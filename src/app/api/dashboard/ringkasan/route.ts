import { NextRequest, NextResponse } from "next/server";
import { getRunningMonthFinancialCondition } from "@/server/services/dashboard.service";

/**
 * GET /api/dashboard/ringkasan
 * Endpoint ringkasan kondisi uang bulan berjalan
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tanggal = searchParams.get("tanggal") || undefined;

    const summary = getRunningMonthFinancialCondition(tanggal);

    return NextResponse.json(
      {
        success: true,
        data: summary,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/dashboard/ringkasan:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil ringkasan kondisi keuangan bulan berjalan.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
