import { NextRequest, NextResponse } from "next/server";
import { getDailyChartData } from "@/server/services/chart.service";

/**
 * GET /api/dashboard/grafik-harian
 * Endpoint data grafik harian pemasukan dan pengeluaran
 * Query: ?range=7d | 14d | 30d | bulan-ini & startDate & endDate
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = (searchParams.get("range") as "7d" | "14d" | "30d" | "bulan-ini") || "7d";
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const data = getDailyChartData({
      range,
      startDate,
      endDate,
    });

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/dashboard/grafik-harian:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data grafik harian pemasukan dan pengeluaran.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
