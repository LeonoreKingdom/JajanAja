import { NextRequest, NextResponse } from "next/server";
import { getRecentTransactions } from "@/server/services/transaction.service";
import { TransactionSource, TransactionType } from "@/types/finance";

/**
 * GET /api/dashboard/transaksi-terbaru
 * Endpoint daftar transaksi terbaru dengan filter tipe, sumber, pencarian, dan paginasi
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const tipe = (searchParams.get("tipe") as TransactionType | "semua") || "semua";
    const sumber = (searchParams.get("sumber") as TransactionSource | "semua") || "semua";
    const search = searchParams.get("search") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const assetId = searchParams.get("assetId") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 10;
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
    console.error("Error in GET /api/dashboard/transaksi-terbaru:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil daftar transaksi terbaru.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
