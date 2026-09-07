import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/server/db/store";
import { validateCreateBudget } from "@/server/schemas/budget.schema";
import { balanceBudgetService } from "@/server/services/balance-budget.service";

/**
 * GET /api/budget
 * Mengambil daftar alokasi budget pos pengeluaran & menghitung sisa otomatis dari transaksi
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const periode = searchParams.get("periode") || currentMonthStr;

    const result = balanceBudgetService.calculateBudgetUsage(periode);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("GET /api/budget error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil data budget.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/budget
 * Membuat alokasi budget baru untuk pos kategori pada periode bulan tertentu
 */
export async function POST(request: NextRequest) {
  try {
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

    const validation = validateCreateBudget(body);
    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi data alokasi budget gagal.",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const payload = validation.data;

    // Cek apakah kategori valid
    const categories = serverStore.getCategories();
    const targetCategory = categories.find((c) => c.id === payload.categoryId);
    if (!targetCategory) {
      return NextResponse.json(
        {
          success: false,
          message: `Kategori dengan ID '${payload.categoryId}' tidak ditemukan.`,
        },
        { status: 404 }
      );
    }

    if (targetCategory.tipe !== "pengeluaran") {
      return NextResponse.json(
        {
          success: false,
          message: `Alokasi budget hanya dapat dibuat untuk kategori bertipe pengeluaran.`,
        },
        { status: 400 }
      );
    }

    // Cek duplikasi periode & kategori
    const existing = serverStore.getBudgetByCategoryAndPeriod(
      payload.categoryId,
      payload.periodeBulan
    );
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: `Budget untuk kategori '${targetCategory.nama}' pada periode ${payload.periodeBulan} sudah ada. Silakan ubah budget yang sudah ada.`,
        },
        { status: 409 }
      );
    }

    const newBudget = serverStore.createBudget({
      categoryId: payload.categoryId,
      periodeBulan: payload.periodeBulan,
      batasJumlah: payload.batasJumlah,
      warna: payload.warna || targetCategory.warna,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Berhasil membuat alokasi budget untuk kategori '${targetCategory.nama}'.`,
        data: newBudget,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/budget error:", error);
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan internal saat membuat budget.";
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
