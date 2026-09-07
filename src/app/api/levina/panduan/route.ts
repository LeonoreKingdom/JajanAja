import { NextRequest, NextResponse } from "next/server";
import { LevinaGuideService } from "@/server/services/levina-guide.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fitur = searchParams.get("fitur") || searchParams.get("query");

    if (fitur) {
      const guide = LevinaGuideService.generateGuide(fitur);
      return NextResponse.json({
        success: true,
        data: guide,
      });
    }

    const all = LevinaGuideService.getAllGuides();
    return NextResponse.json({
      success: true,
      data: all,
    });
  } catch (error) {
    console.error("Error pada GET /api/levina/panduan:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil panduan fitur" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = body?.fitur || body?.query || body?.prompt || "";

    const guide = LevinaGuideService.generateGuide(query);
    return NextResponse.json({
      success: true,
      data: guide,
    });
  } catch (error) {
    console.error("Error pada POST /api/levina/panduan:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memproses panduan fitur" },
      { status: 500 }
    );
  }
}
