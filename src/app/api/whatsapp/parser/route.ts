import { NextRequest, NextResponse } from "next/server";
import { parseWhatsAppMessage } from "@/server/services/whatsapp-parser.service";

/**
 * POST /api/whatsapp/parser
 * Endpoint menguji dan mengekstrak deskripsi, nominal, dan kategori dari pesan teks WhatsApp
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

    if (!text.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Field 'text' atau 'message' wajib disertakan.",
        },
        { status: 400 }
      );
    }

    const result = parseWhatsAppMessage(text);

    return NextResponse.json(
      {
        success: true,
        message: result.isValidTransaction
          ? "Berhasil mengekstrak data transaksi dari pesan."
          : "Pesan bukan merupakan format pencatatan transaksi.",
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/whatsapp/parser error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal saat parsing pesan.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/whatsapp/parser?text=...
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get("text") || searchParams.get("q") || "";

    if (!text.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Query parameter '?text=...' wajib disertakan.",
        },
        { status: 400 }
      );
    }

    const result = parseWhatsAppMessage(text);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/whatsapp/parser error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal saat parsing pesan.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
