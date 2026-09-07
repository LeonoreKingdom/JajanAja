import { NextRequest, NextResponse } from "next/server";
import { assetService } from "@/server/services/asset.service";
import { validateCreateAsset } from "@/server/schemas/asset.schema";
import { ensureStoreInitialized } from "@/server/db/store";

/**
 * GET /api/aset
 * Mengambil daftar aset keuangan beserta ringkasan total kekayaan likuid dan distribusinya
 */
export async function GET(request: NextRequest) {
  try {
    await ensureStoreInitialized();
    const { searchParams } = new URL(request.url);
    const jenis = searchParams.get("jenis") || undefined;
    const search = searchParams.get("q") || searchParams.get("search") || undefined;

    const result = assetService.getAssetsWithWealthSummary({
      jenis,
      search,
    });

    return NextResponse.json({
      success: true,
      data: {
        totalKekayaan: result.summary.totalKekayaan,
        totalAkun: result.summary.totalAkun,
        distribusi: result.summary.distribusi,
        rekap: result.summary.rekap,
        aset: result.assets,
      },
    });
  } catch (error) {
    console.error("GET /api/aset error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data aset dan total kekayaan.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/aset
 * Menambahkan akun aset baru (rekening bank, e-wallet, atau uang tunai)
 */
export async function POST(request: NextRequest) {
  try {
    await ensureStoreInitialized();
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

    const validation = validateCreateAsset(body);
    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi data aset baru gagal.",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const newAsset = assetService.createAsset(validation.data);

    return NextResponse.json(
      {
        success: true,
        message: `Akun aset '${newAsset.nama}' berhasil ditambahkan.`,
        data: newAsset,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/aset error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal saat menambahkan akun aset.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
