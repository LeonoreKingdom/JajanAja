import { NextRequest, NextResponse } from "next/server";
import { serverStore, ensureStoreInitialized } from "@/server/db/store";
import { TransactionType } from "@/types/finance";

/**
 * GET /api/kategori
 * Mengambil daftar kategori transaksi (pengeluaran atau pemasukan)
 */
export async function GET(request: NextRequest) {
  try {
    await ensureStoreInitialized();
    const { searchParams } = new URL(request.url);
    const tipe = searchParams.get("tipe") as TransactionType | null;

    let categories = serverStore.getCategories();
    if (tipe && (tipe === "pengeluaran" || tipe === "pemasukan")) {
      categories = categories.filter((c) => c.tipe === tipe);
    }

    return NextResponse.json(
      {
        success: true,
        data: categories,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data kategori.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
