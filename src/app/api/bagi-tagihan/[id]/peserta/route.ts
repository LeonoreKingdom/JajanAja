import { NextRequest, NextResponse } from "next/server";
import { togglePesertaPaymentStatus } from "@/server/services/split-bill.service";
import { serverStore } from "@/server/db/store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/bagi-tagihan/[id]/peserta
 * Mengubah status bayar peserta (single atau mark-all-paid)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

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

    // Case 1: Mark all paid
    if (raw.markAllPaid === true) {
      const bill = serverStore.getBagiTagihanById(id);
      if (!bill) {
        return NextResponse.json(
          {
            success: false,
            message: `Bagi tagihan dengan ID '${id}' tidak ditemukan.`,
          },
          { status: 404 }
        );
      }

      bill.peserta.forEach((p) => {
        serverStore.updatePesertaStatus(id, p.id, true);
      });

      const updated = serverStore.getBagiTagihanById(id);
      return NextResponse.json(
        {
          success: true,
          message: "Semua peserta berhasil ditandai Lunas.",
          data: updated,
        },
        { status: 200 }
      );
    }

    // Case 2: Specific pesertaId and sudahBayar
    if (typeof raw.pesertaId === "string" && typeof raw.sudahBayar === "boolean") {
      const result = togglePesertaPaymentStatus(id, raw.pesertaId, raw.sudahBayar);
      if (!result.success || !result.data) {
        return NextResponse.json(
          {
            success: false,
            message: result.message || "Data peserta tidak ditemukan.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Status pembayaran peserta berhasil diperbarui.",
          data: result.data,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Format body tidak sesuai. Berikan { pesertaId, sudahBayar } atau { markAllPaid: true }.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("PATCH /api/bagi-tagihan/[id]/peserta error:", error);
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
