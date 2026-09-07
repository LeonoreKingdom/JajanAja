import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/server/db/store";
import { AssetType, TransactionType } from "@/types/finance";

/**
 * GET /api/transaksi/pilihan
 * Endpoint gabungan pilihan kategori dan aset untuk form pencatatan transaksi
 * Query params: ?tipe=pengeluaran|pemasukan|semua & ?jenisAset=bank|e-wallet|tunai|semua
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipe = (searchParams.get("tipe") as TransactionType | "semua") || "semua";
    const jenisAset = (searchParams.get("jenisAset") as AssetType | "semua") || "semua";

    const allCategories = serverStore.getCategories();
    const allAssets = serverStore.getAssets();
    const allBudgets = serverStore.getBudgets();

    // Filter Kategori
    const filteredCategories = allCategories.filter((c) => {
      if (tipe !== "semua" && c.tipe !== tipe) return false;
      return true;
    });

    const pengeluaranCategories = allCategories
      .filter((c) => c.tipe === "pengeluaran")
      .map((c) => {
        const budget = allBudgets.find((b) => b.categoryId === c.id);
        return {
          ...c,
          budgetInfo: budget
            ? {
                batasJumlah: budget.batasJumlah,
                terpakai: budget.terpakai,
                sisa: Math.max(0, budget.batasJumlah - budget.terpakai),
              }
            : null,
        };
      });

    const pemasukanCategories = allCategories.filter((c) => c.tipe === "pemasukan");

    // Filter Aset
    const filteredAssets = allAssets.filter((a) => {
      if (jenisAset !== "semua" && a.jenis !== jenisAset) return false;
      return true;
    });

    const totalSaldoAset = allAssets.reduce((sum, a) => sum + a.saldo, 0);

    return NextResponse.json(
      {
        success: true,
        data: {
          kategori: {
            semua: filteredCategories,
            pengeluaran: pengeluaranCategories,
            pemasukan: pemasukanCategories,
          },
          aset: filteredAssets,
          totalSaldoAset,
          presetNominal: {
            pengeluaran: [10000, 20000, 50000, 100000, 250000],
            pemasukan: [500000, 1000000, 2500000, 5000000, 10000000],
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/transaksi/pilihan:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil pilihan kategori dan aset.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
