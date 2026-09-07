import { NextRequest, NextResponse } from "next/server";
import { LevinaSavingTipsService } from "@/server/services/levina-saving-tips.service";

export async function GET() {
  try {
    const result = LevinaSavingTipsService.generateTips();
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error pada GET /api/levina/saran-hemat:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghasilkan saran hemat" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = body?.userId;

    const result = LevinaSavingTipsService.generateTips(userId);
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error pada POST /api/levina/saran-hemat:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memproses saran hemat" },
      { status: 500 }
    );
  }
}
