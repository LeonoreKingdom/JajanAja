import { NextRequest, NextResponse } from "next/server";
import { getExpenseTransactionsForSplit } from "@/server/services/split-bill.service";

/**
 * GET /api/transaksi/pengeluaran
 * Mengambil daftar transaksi khusus pengeluaran (JajanAja)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 20;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0;
    const excludeAlreadySplit = searchParams.get("excludeSplit") === "true";

    const result = getExpenseTransactionsForSplit({
      search,
      limit,
      offset,
      excludeAlreadySplit,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Berhasil mengambil daftar transaksi pengeluaran.",
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/transaksi/pengeluaran:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil daftar transaksi pengeluaran.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
