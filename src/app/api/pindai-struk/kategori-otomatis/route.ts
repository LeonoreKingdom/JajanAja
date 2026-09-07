import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/server/db/store";
import { suggestCategoryForReceipt } from "@/server/services/receipt.service";
import { ReceiptItem } from "@/types/receipt";

/**
 * POST /api/pindai-struk/kategori-otomatis
 * Menganalisis nama merchant dan item struk untuk menentukan kategori pengeluaran terbaik
 * Memadukan pencocokan riwayat pengguna terdahulu + pemetaan cerdas keyword
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

    const { namaToko = "", items = [] } = (body || {}) as {
      namaToko?: string;
      items?: ReceiptItem[];
    };

    const categories = serverStore.getCategories().filter((c) => c.tipe === "pengeluaran");

    // 1. Cek riwayat transaksi sebelumnya untuk merchant ini (User Preference Learning)
    if (namaToko.trim()) {
      const cleanMerchant = namaToko.trim().toLowerCase();
      const pastTx = serverStore
        .getTransactions()
        .find(
          (t) =>
            t.tipe === "pengeluaran" &&
            t.catatan &&
            t.catatan.toLowerCase().includes(cleanMerchant)
        );

      if (pastTx) {
        const matchedCategory = categories.find((c) => c.id === pastTx.categoryId);
        if (matchedCategory) {
          return NextResponse.json({
            success: true,
            data: {
              categoryId: matchedCategory.id,
              kategoriNama: matchedCategory.nama,
              confidence: 99,
              isFromHistory: true,
              reasoning: `Sesuai kebiasaan belanjamu di '${namaToko}'.`,
            },
          });
        }
      }
    }

    // 2. Rule & Keyword classifier
    const suggestion = suggestCategoryForReceipt(namaToko, items);
    const matchedCategory =
      categories.find((c) => c.id === suggestion.id) || categories[0];

    return NextResponse.json({
      success: true,
      data: {
        categoryId: matchedCategory.id,
        kategoriNama: matchedCategory.nama,
        confidence: 95,
        isFromHistory: false,
        reasoning: `Berdasarkan jenis toko dan rincian item belanja.`,
      },
    });
  } catch (error) {
    console.error("POST /api/pindai-struk/kategori-otomatis error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal saat menentukan kategori otomatis.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
