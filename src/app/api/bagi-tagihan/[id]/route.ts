import { NextRequest, NextResponse } from "next/server";
import {
  getBagiTagihanById,
} from "@/server/services/split-bill.service";
import { serverStore } from "@/server/db/store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/bagi-tagihan/[id]
 * Mengambil detail lengkap bagi tagihan beserta seluruh peserta dan status pembayarannya
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const bill = getBagiTagihanById(id);

    if (!bill) {
      return NextResponse.json(
        {
          success: false,
          message: `Data bagi tagihan dengan ID '${id}' tidak ditemukan.`,
        },
        { status: 404 }
      );
    }

    const totalPeserta = bill.peserta.length;
    const sudahBayarList = bill.peserta.filter((p) => p.sudahBayar);
    const belumBayarList = bill.peserta.filter((p) => !p.sudahBayar);

    const totalSudahBayar = sudahBayarList.length;
    const totalBelumBayar = belumBayarList.length;

    const nominalSudahTerkumpul = sudahBayarList.reduce((sum, p) => sum + p.bagian, 0);
    const nominalSisaBelumBayar = belumBayarList.reduce((sum, p) => sum + p.bagian, 0);

    const persentaseLunas =
      bill.totalTagihan > 0
        ? Math.min(100, Math.round((nominalSudahTerkumpul / bill.totalTagihan) * 100))
        : 100;

    return NextResponse.json(
      {
        success: true,
        data: {
          ...bill,
          statistik: {
            totalPeserta,
            totalSudahBayar,
            totalBelumBayar,
            nominalSudahTerkumpul,
            nominalSisaBelumBayar,
            persentaseLunas,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/bagi-tagihan/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal saat mengambil detail bagi tagihan.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/bagi-tagihan/[id]
 * Memperbarui informasi umum bagi tagihan (judul, catatan, status, namaToko)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const existing = getBagiTagihanById(id);

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: `Data bagi tagihan dengan ID '${id}' tidak ditemukan.`,
        },
        { status: 404 }
      );
    }

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

    const updates = body as Record<string, unknown>;
    const allowedUpdates: Record<string, unknown> = {};

    if (typeof updates.judul === "string" && updates.judul.trim()) {
      allowedUpdates.judul = updates.judul.trim();
    }
    if (typeof updates.namaToko === "string") {
      allowedUpdates.namaToko = updates.namaToko.trim();
    }
    if (typeof updates.catatan === "string") {
      allowedUpdates.catatan = updates.catatan.trim();
    }
    if (
      typeof updates.status === "string" &&
      (updates.status === "aktif" || updates.status === "selesai" || updates.status === "dibatalkan")
    ) {
      allowedUpdates.status = updates.status;
    }

    const updated = serverStore.updateBagiTagihan(id, allowedUpdates);

    return NextResponse.json(
      {
        success: true,
        message: "Berhasil memperbarui data bagi tagihan.",
        data: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/bagi-tagihan/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal saat memperbarui bagi tagihan.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/bagi-tagihan/[id]
 * Menghapus pembagian tagihan beserta daftar pesertanya
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const existing = getBagiTagihanById(id);

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: `Data bagi tagihan dengan ID '${id}' tidak ditemukan.`,
        },
        { status: 404 }
      );
    }

    const deleted = serverStore.deleteBagiTagihan(id);

    return NextResponse.json(
      {
        success: true,
        message: `Berhasil menghapus bagi tagihan '${existing.judul}'.`,
        data: { id },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/bagi-tagihan/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal saat menghapus bagi tagihan.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
