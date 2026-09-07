import { NextRequest, NextResponse } from "next/server";
import { validateSaveScannedReceipt } from "@/server/schemas/receipt.schema";
import { saveScannedTransaction } from "@/server/services/receipt.service";
import { serverStore } from "@/server/db/store";

/**
 * POST /api/pindai-struk/simpan
 * Menyimpan hasil baca struk menjadi transaksi pengeluaran resmi
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

    const validation = validateSaveScannedReceipt(body);
    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi data transaksi struk gagal.",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const headerIdempotencyKey =
      request.headers.get("Idempotency-Key") ||
      request.headers.get("idempotency-key") ||
      request.headers.get("x-idempotency-key") ||
      undefined;

    if (headerIdempotencyKey && !validation.data.idempotencyKey) {
      validation.data.idempotencyKey = headerIdempotencyKey.trim();
    } else if (!validation.data.idempotencyKey && validation.data.strukId) {
      validation.data.idempotencyKey = `scan-${validation.data.strukId}`;
    }

    // Verifikasi keberadaan akun aset sumber dana
    const asset = serverStore.getAssetById(validation.data.assetId);
    if (!asset) {
      return NextResponse.json(
        {
          success: false,
          message: `Akun aset sumber dana dengan ID '${validation.data.assetId}' tidak ditemukan.`,
        },
        { status: 404 }
      );
    }

    const result = saveScannedTransaction(validation.data);

    const message = result.isDuplicate
      ? "Transaksi ini sudah pernah disimpan sebelumnya (idempotent replay)."
      : `Transaksi struk belanja '${validation.data.namaToko}' sebesar Rp ${new Intl.NumberFormat(
          "id-ID"
        ).format(validation.data.total)} berhasil disimpan.`;

    const headers: Record<string, string> = {};
    if (result.isDuplicate) {
      headers["X-Idempotent-Replay"] = "true";
    }
    if (validation.data.idempotencyKey) {
      headers["Idempotency-Key"] = validation.data.idempotencyKey;
    }

    return NextResponse.json(
      {
        success: true,
        message,
        data: {
          transaction: result.transaction,
          scanRecord: result.scanRecord,
          isDuplicate: Boolean(result.isDuplicate),
          updatedAsset: serverStore.getAssetById(validation.data.assetId),
        },
      },
      {
        status: result.isDuplicate ? 200 : 201,
        headers,
      }
    );
  } catch (error) {
    console.error("POST /api/pindai-struk/simpan error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal saat menyimpan transaksi hasil pindai struk.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
