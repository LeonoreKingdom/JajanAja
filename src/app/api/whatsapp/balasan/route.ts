import { NextRequest, NextResponse } from "next/server";
import { WhatsAppAutoReplyService } from "@/server/services/whatsapp-auto-reply.service";

/**
 * POST /api/whatsapp/balasan
 * Menguji dan menghasilkan balasan otomatis bot WhatsApp
 */
export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Request body harus berupa JSON yang valid.",
        },
        { status: 400 }
      );
    }

    const raw = body as Record<string, unknown>;
    const text = typeof raw.text === "string" ? raw.text : typeof raw.message === "string" ? raw.message : "";
    const from = typeof raw.from === "string" ? raw.from : typeof raw.sender === "string" ? raw.sender : "6281234567890";

    if (!text.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Field 'text' atau 'message' wajib disertakan.",
        },
        { status: 400 }
      );
    }

    const reply = await WhatsAppAutoReplyService.generateReply(from, text);

    return NextResponse.json(
      {
        success: true,
        message: "Berhasil menghasilkan balasan otomatis WhatsApp.",
        data: {
          balasan: reply.replyText,
          intent: reply.intent,
          transaksi: reply.processedTransaction,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/whatsapp/balasan error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal saat menghasilkan balasan otomatis.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/whatsapp/balasan?text=...&from=...
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get("text") || searchParams.get("q") || "";
    const from = searchParams.get("from") || "6281234567890";

    if (!text.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Query parameter '?text=...' wajib disertakan.",
        },
        { status: 400 }
      );
    }

    const reply = await WhatsAppAutoReplyService.generateReply(from, text);

    return NextResponse.json(
      {
        success: true,
        data: {
          balasan: reply.replyText,
          intent: reply.intent,
          transaksi: reply.processedTransaction,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/whatsapp/balasan error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal saat menghasilkan balasan otomatis.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
