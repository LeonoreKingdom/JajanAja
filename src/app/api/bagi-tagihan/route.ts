import { NextRequest, NextResponse } from "next/server";
import {
  createNewBagiTagihan,
  getAllBagiTagihan,
} from "@/server/services/split-bill.service";

/**
 * GET /api/bagi-tagihan
 * Mengambil seluruh daftar bagi tagihan beserta pesertanya
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // "aktif" | "selesai" | undefined
    const search = searchParams.get("search")?.toLowerCase().trim();

    let list = getAllBagiTagihan();

    if (status && status !== "semua") {
      list = list.filter((b) => b.status === status);
    }

    if (search) {
      list = list.filter(
        (b) =>
          b.judul.toLowerCase().includes(search) ||
          b.namaToko?.toLowerCase().includes(search) ||
          b.peserta.some((p) => p.nama.toLowerCase().includes(search))
      );
    }

    // Hitung ringkasan status & piutang
    const totalSemua = list.length;
    const totalAktif = list.filter((b) => b.status === "aktif").length;
    const totalSelesai = list.filter((b) => b.status === "selesai").length;

    let totalPiutangBelumDibayar = 0;
    list.forEach((b) => {
      b.peserta.forEach((p) => {
        if (!p.sudahBayar) {
          totalPiutangBelumDibayar += p.bagian;
        }
      });
    });

    return NextResponse.json(
      {
        success: true,
        data: list,
        meta: {
          totalSemua,
          totalAktif,
          totalSelesai,
          totalPiutangBelumDibayar,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/bagi-tagihan:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil daftar bagi tagihan.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bagi-tagihan
 * Endpoint untuk menyimpan pembagian tagihan baru beserta daftar peserta
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

    const result = createNewBagiTagihan(body);

    if (!result.success || !result.data) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi data pembagian tagihan gagal.",
          errors: result.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Bagi tagihan berhasil dibuat!",
        data: result.data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/bagi-tagihan:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal saat menyimpan bagi tagihan.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
