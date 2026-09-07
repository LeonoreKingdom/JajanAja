import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/server/db/store";
import { validateUpdateAsset } from "@/server/schemas/asset.schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/aset/[id]
 * Mengambil detail satu akun aset berdasarkan ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const asset = serverStore.getAssetById(id);

    if (!asset) {
      return NextResponse.json(
        {
          success: false,
          message: `Akun aset dengan ID '${id}' tidak ditemukan.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: asset,
    });
  } catch (error) {
    console.error("GET /api/aset/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal saat mengambil akun aset.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/aset/[id]
 * Memperbarui data akun aset (nama, jenis, nomorRekening, warna, ikon, saldo)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const existingAsset = serverStore.getAssetById(id);

    if (!existingAsset) {
      return NextResponse.json(
        {
          success: false,
          message: `Akun aset dengan ID '${id}' tidak ditemukan.`,
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

    const validation = validateUpdateAsset(body);
    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi data pembaruan aset gagal.",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const updatedAsset = serverStore.updateAsset(id, validation.data);

    return NextResponse.json({
      success: true,
      message: `Akun aset '${updatedAsset?.nama}' berhasil diperbarui.`,
      data: updatedAsset,
    });
  } catch (error) {
    console.error("PATCH /api/aset/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal saat memperbarui akun aset.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/aset/[id]
 * Menghapus akun aset
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const existingAsset = serverStore.getAssetById(id);

    if (!existingAsset) {
      return NextResponse.json(
        {
          success: false,
          message: `Akun aset dengan ID '${id}' tidak ditemukan.`,
        },
        { status: 404 }
      );
    }

    const deleted = serverStore.deleteAsset(id);
    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          message: `Gagal menghapus akun aset dengan ID '${id}'.`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Akun aset '${existingAsset.nama}' berhasil dihapus.`,
      data: { id },
    });
  } catch (error) {
    console.error("DELETE /api/aset/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal saat menghapus akun aset.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
