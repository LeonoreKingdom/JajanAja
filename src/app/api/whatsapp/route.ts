import { NextRequest, NextResponse } from "next/server";
import {
  getWhatsAppAccount,
  connectWhatsAppAccount,
  disconnectWhatsAppAccount,
} from "@/server/services/whatsapp.service";

/**
 * GET /api/whatsapp
 * Mendapatkan status koneksi nomor WhatsApp akun pengguna
 */
export async function GET(request: NextRequest) {
  try {
    const connection = getWhatsAppAccount();

    return NextResponse.json(
      {
        success: true,
        data: connection || null,
        isConnected: Boolean(connection && connection.status === "terhubung"),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/whatsapp error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil status koneksi WhatsApp.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/whatsapp
 * Menghubungkan nomor WhatsApp aktif ke akun JajanAja
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

    const result = connectWhatsAppAccount(body);

    if (!result.success || !result.data) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Gagal menghubungkan nomor WhatsApp.",
          errors: result.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/whatsapp error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal saat menghubungkan WhatsApp.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/whatsapp
 * Memutuskan koneksi nomor WhatsApp dari akun
 */
export async function DELETE(request: NextRequest) {
  try {
    const result = disconnectWhatsAppAccount();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/whatsapp error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal saat memutuskan WhatsApp.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
