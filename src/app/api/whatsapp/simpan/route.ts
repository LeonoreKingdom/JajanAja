import { NextRequest, NextResponse } from "next/server";
import { saveTransactionFromWhatsAppMessage } from "@/server/services/whatsapp-transaction.service";

/**
 * POST /api/whatsapp/simpan
 * Endpoint untuk memproses dan menyimpan transaksi dari teks pesan WhatsApp
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
    const assetId = typeof raw.assetId === "string" ? raw.assetId : undefined;

    if (!text.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Field 'text' atau 'message' wajib disertakan.",
        },
        { status: 400 }
      );
    }

    const result = saveTransactionFromWhatsAppMessage({
      from,
      text: text.trim(),
      assetId,
    });

    return NextResponse.json(
      {
        success: result.success,
        message: result.message,
        data: {
          balasan: result.replyText,
          parsed: result.parsed,
          transaksi: result.transaction,
          sisaBudget: result.remainingBudget,
        },
      },
      { status: result.success && result.transaction ? 201 : 200 }
    );
  } catch (error) {
    console.error("POST /api/whatsapp/simpan error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal saat menyimpan transaksi WhatsApp.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
