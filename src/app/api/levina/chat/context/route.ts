import { NextRequest, NextResponse } from "next/server";
import { LevinaChatService } from "@/server/services/levina-chat.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "usr-1";
    const limit = parseInt(searchParams.get("limit") || "6", 10);

    const context = LevinaChatService.getRecentContext(userId, limit);

    return NextResponse.json({
      success: true,
      data: context,
    });
  } catch (error) {
    console.error("Error pada GET /api/levina/chat/context:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil konteks percakapan" },
      { status: 500 }
    );
  }
}
