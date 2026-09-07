import { NextRequest, NextResponse } from "next/server";
import { togglePesertaPaymentStatus } from "@/server/services/split-bill.service";

interface RouteParams {
  params: Promise<{ id: string; pesertaId: string }>;
}

/**
 * PATCH /api/bagi-tagihan/[id]/peserta/[pesertaId]
 * Mengubah status pelunasan seorang peserta dalam bagi tagihan
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, pesertaId } = await params;

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
    if (typeof raw.sudahBayar !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "Field 'sudahBayar' (boolean: true/false) wajib disertakan.",
        },
        { status: 400 }
      );
    }

    const result = togglePesertaPaymentStatus(id, pesertaId, raw.sudahBayar);

    if (!result.success || !result.data) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Data bagi tagihan atau peserta tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: raw.sudahBayar
          ? "Peserta berhasil ditandai sudah bayar (Lunas)."
          : "Status pembayaran peserta diubah menjadi belum bayar.",
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/bagi-tagihan/[id]/peserta/[pesertaId] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal saat memperbarui status peserta.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
