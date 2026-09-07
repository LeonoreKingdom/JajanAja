import { NextRequest, NextResponse } from "next/server";
import { serverStore, ensureStoreInitialized } from "@/server/db/store";
import {
  validateCreateTransaction,
  TransactionRecord,
} from "@/server/schemas/transaction.schema";
import { getRecentTransactions } from "@/server/services/transaction.service";
import { TransactionSource, TransactionType } from "@/types/finance";

/**
 * POST /api/transaksi
 * Endpoint simpan transaksi baru (pengeluaran atau pemasukan) dengan validasi lengkap
 */
export async function POST(request: NextRequest) {
  try {
    await ensureStoreInitialized();
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Request body harus berupa JSON yang valid.",
        },
        { status: 400 }
      );
    }

    // 1. Validasi skema & tipe data isian wajib
    const validation = validateCreateTransaction(body);
    if (!validation.isValid || !validation.data) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi data transaksi gagal.",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const payload = validation.data;

    // 2. Validasi keberadaan aset
    const assets = serverStore.getAssets();
    const targetAsset = assets.find((a) => a.id === payload.assetId);
    if (!targetAsset) {
      return NextResponse.json(
        {
          success: false,
          message: `Aset dengan ID '${payload.assetId}' tidak ditemukan.`,
        },
        { status: 404 }
      );
    }

    // 3. Validasi kecukupan saldo jika transaksi adalah pengeluaran
    if (payload.tipe === "pengeluaran" && targetAsset.saldo < payload.jumlah) {
      return NextResponse.json(
        {
          success: false,
          message: `Saldo ${targetAsset.nama} tidak mencukupi untuk transaksi sebesar Rp ${new Intl.NumberFormat(
            "id-ID"
          ).format(payload.jumlah)}. Sisa saldo: Rp ${new Intl.NumberFormat(
            "id-ID"
          ).format(targetAsset.saldo)}.`,
          code: "INSUFFICIENT_FUNDS",
        },
        { status: 422 }
      );
    }

    // 4. Validasi / Pencarian Kategori
    const categories = serverStore.getCategories();
    let category = categories.find((c) => c.id === payload.categoryId);
    if (!category) {
      // Jika kategori kustom baru
      category = {
        id: payload.categoryId,
        nama: payload.catatan || "Kategori Kustom",
        tipe: payload.tipe,
        ikon: payload.tipe === "pengeluaran" ? "ShoppingBag" : "Coins",
        warna: payload.tipe === "pengeluaran" ? "#f43f5e" : "#10b981",
      };
    }

    // 5. Buat record transaksi baru
    const now = new Date().toISOString();
    const newRecord: TransactionRecord = {
      id: `tx-${Date.now()}`,
      tipe: payload.tipe,
      jumlah: payload.jumlah,
      tanggal: payload.tanggal || now,
      categoryId: payload.categoryId,
      assetId: payload.assetId,
      catatan: payload.catatan || category.nama,
      merchant: payload.merchant,
      label: Array.isArray(payload.label) ? payload.label : undefined,
      sumber: payload.sumber || "manual",
      reimbursable: payload.reimbursable,
      photoUrl: payload.photoUrl,
      createdAt: now,
      updatedAt: now,
    };

    // 6. Simpan transaksi ke database / serverStore
    serverStore.addTransaction(newRecord);

    // 7. Ambil aset & budget yang terupdate
    const updatedAssets = serverStore.getAssets();
    const updatedAsset = updatedAssets.find((a) => a.id === payload.assetId);

    const budgets = serverStore.getBudgets();
    const updatedBudget = budgets.find((b) => b.categoryId === payload.categoryId);

    return NextResponse.json(
      {
        success: true,
        message:
          payload.tipe === "pengeluaran"
            ? "Transaksi JajanAja berhasil dicatat!"
            : "Transaksi NabungAja berhasil ditambahkan!",
        data: {
          transaksi: {
            ...newRecord,
            kategori: category,
            aset: updatedAsset,
          },
          updatedAsset,
          updatedBudget,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/transaksi:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal saat menyimpan transaksi.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/transaksi
 * Endpoint mengambil daftar transaksi dengan filter
 */
export async function GET(request: NextRequest) {
  try {
    await ensureStoreInitialized();
    const { searchParams } = new URL(request.url);

    const tipe = (searchParams.get("tipe") as TransactionType | "semua") || "semua";
    const sumber = (searchParams.get("sumber") as TransactionSource | "semua") || "semua";
    const search = searchParams.get("search") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const assetId = searchParams.get("assetId") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 20;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0;

    const result = getRecentTransactions({
      tipe,
      sumber,
      search,
      categoryId,
      assetId,
      limit,
      offset,
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/transaksi:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil daftar transaksi.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
