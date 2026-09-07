import { NextRequest, NextResponse } from "next/server";
import { getExpenseTransactionsForSplit } from "@/server/services/split-bill.service";

/**
 * GET /api/bagi-tagihan/transaksi
 * Mengambil daftar transaksi pengeluaran (JajanAja) yang dapat dibagikan / di-split
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
        message: "Berhasil mengambil daftar transaksi pengeluaran untuk bagi tagihan.",
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/bagi-tagihan/transaksi:", error);
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
