import { NextRequest, NextResponse } from "next/server";
import { LevinaChatService } from "@/server/services/levina-chat.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.message || body?.prompt || body?.text || "";
    const userId = body?.userId || "usr-1";

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "Pesan / message tidak boleh kosong" },
        { status: 400 }
      );
    }

    const result = await LevinaChatService.sendMessage({
      message: message.trim(),
      userId,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Error pada POST /api/levina/chat:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengirim pesan chat LEVINA" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "usr-1";
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const history = LevinaChatService.getHistory(userId, limit);

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Error pada GET /api/levina/chat:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat riwayat chat" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "usr-1";

    LevinaChatService.clearHistory(userId);

    return NextResponse.json({
      success: true,
      message: "Riwayat chat LEVINA berhasil dikosongkan",
    });
  } catch (error) {
    console.error("Error pada DELETE /api/levina/chat:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengosongkan riwayat chat" },
      { status: 500 }
    );
  }
}
