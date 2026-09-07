import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/server/db/store";
import { validateUpdateAssetBalance } from "@/server/schemas/asset.schema";
import { TransactionRecord } from "@/server/schemas/transaction.schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/aset/[id]/saldo
 * Endpoint khusus untuk mengubah atau menyesuaikan saldo akun aset
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const asset = serverStore.getAssetById(id);
    if (!asset) {
      return NextResponse.json(
        {
          success: false,
          message: `Akun aset dengan ID '${id}' tidak ditemukan.`,
        },
        { status: 404 }
      );
    }

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

    const validation = validateUpdateAssetBalance(body);
    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi data saldo baru gagal.",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const { saldo: newBalance, catatPenyesuaian } = validation.data;
    const oldBalance = asset.saldo;
    const diff = newBalance - oldBalance;

    // Mutasi saldo aset
    const updatedAsset = serverStore.updateAssetBalance(id, newBalance);

    let adjustmentTransaction: TransactionRecord | undefined;

    // Catat transaksi penyesuaian jika opsi aktif dan ada selisih
    if (catatPenyesuaian && diff !== 0) {
      const isIncrease = diff > 0;
      const categories = serverStore.getCategories();
      const targetCategory =
        categories.find((c) =>
          isIncrease ? c.tipe === "pemasukan" : c.tipe === "pengeluaran"
        ) || categories[0];

      adjustmentTransaction = {
        id: `tx-adj-${Date.now()}`,
        tipe: isIncrease ? "pemasukan" : "pengeluaran",
        jumlah: Math.abs(diff),
        tanggal: new Date().toISOString(),
        categoryId: targetCategory.id,
        assetId: asset.id,
        catatan: `Penyesuaian saldo (${asset.nama})`,
        label: ["Penyesuaian"],
        sumber: "manual",
        reimbursable: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Tambahkan transaksi ke store tanpa double-mutating saldo yang sudah disesuaikan
      const txs = serverStore.getTransactions();
      txs.unshift(adjustmentTransaction);
    }

    return NextResponse.json({
      success: true,
      message: `Saldo ${asset.nama} berhasil diperbarui dari Rp ${new Intl.NumberFormat(
        "id-ID"
      ).format(oldBalance)} menjadi Rp ${new Intl.NumberFormat("id-ID").format(
        newBalance
      )}.`,
      data: {
        asset: updatedAsset,
        selisih: diff,
        penyesuaianTercatat: Boolean(adjustmentTransaction),
        transaksiPenyesuaian: adjustmentTransaction,
      },
    });
  } catch (error) {
    console.error("PATCH /api/aset/[id]/saldo error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal saat memperbarui saldo aset.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
