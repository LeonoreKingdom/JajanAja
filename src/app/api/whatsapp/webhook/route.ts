import { NextRequest, NextResponse } from "next/server";
import { handleIncomingWhatsAppWebhook } from "@/server/services/whatsapp.service";

/**
 * GET /api/whatsapp/webhook
 * Verifikasi webhook Meta WhatsApp Cloud API (Challenge Handshake)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || "jajanaja_secret_token";

    if (mode === "subscribe" && token === expectedToken) {
      // Kembalikan plain text challenge untuk handshake validasi Meta
      return new NextResponse(challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    if (!mode && !token) {
      return NextResponse.json(
        {
          status: "ready",
          message: "Endpoint webhook WhatsApp JajanAja aktif dan siap menerima pesan.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Verifikasi webhook WhatsApp gagal. Token verifikasi tidak cocok.",
      },
      { status: 403 }
    );
  } catch (error) {
    console.error("GET /api/whatsapp/webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal saat verifikasi webhook.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/whatsapp/webhook
 * Penerimaan pesan masuk dari pengguna via WhatsApp bot
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

    const result = await handleIncomingWhatsAppWebhook(body);

    if (!result.success || !result.extracted) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Gagal memproses webhook pesan.",
        },
        { status: 400 }
      );
    }

    // Bangun balasan otomatis menggunakan AutoReplyService
    const { WhatsAppAutoReplyService } = await import("@/server/services/whatsapp-auto-reply.service");
    const autoReply = await WhatsAppAutoReplyService.generateReply(
      result.extracted.from,
      result.extracted.text
    );

    // Kirim balasan via WhatsApp Cloud API / Simulator
    await WhatsAppAutoReplyService.sendReply(result.extracted.from, autoReply.replyText);

    return NextResponse.json(
      {
        success: true,
        message: "Pesan WhatsApp berhasil diterima dan dibalas otomatis.",
        data: {
          pengirim: result.extracted.from,
          pesan: result.extracted.text,
          terdaftar: Boolean(result.registeredUser),
          namaPengguna: result.registeredUser?.namaProfil,
          intent: autoReply.intent,
          balasan: autoReply.replyText,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/whatsapp/webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal saat memproses pesan webhook WhatsApp.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
