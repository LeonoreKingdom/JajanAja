import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/server/db/store";
import { scanReceiptImage } from "@/server/services/receipt.service";

/**
 * GET /api/pindai-struk
 * Mengambil riwayat pemindaian struk
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 20;

    const scans = serverStore.getReceiptScans(limit);

    return NextResponse.json({
      success: true,
      data: {
        total: scans.length,
        scans,
      },
    });
  } catch (error) {
    console.error("GET /api/pindai-struk error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil riwayat pemindaian struk.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pindai-struk
 * Forwarder ke scanReceiptImage
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scanResult, record } = await scanReceiptImage(body);

    return NextResponse.json({
      success: true,
      message: "Pemindaian struk berhasil diekstraksi.",
      data: {
        scanId: record.id,
        result: scanResult,
      },
    });
  } catch (error) {
    console.error("POST /api/pindai-struk error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memproses struk.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
