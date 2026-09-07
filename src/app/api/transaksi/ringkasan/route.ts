import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/server/db/store";
import { getRecentTransactions } from "@/server/services/transaction.service";
import { TransactionType } from "@/types/finance";

/**
 * GET /api/transaksi/ringkasan
 * Endpoint ringkasan bulan berjalan, status budget kategori, dan riwayat transaksi terbaru
 * Query:
 * - categoryId (optional): filter/proyeksi pos kategori
 * - amount (optional): nominal untuk simulasi live budget impact
 * - flow (optional): "pengeluaran" | "pemasukan"
 * - limit (optional): jumlah transaksi terbaru (default: 10)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const categoryId = searchParams.get("categoryId") || undefined;
    const amount = parseInt(searchParams.get("amount") || "0", 10) || 0;
    const flow = (searchParams.get("flow") as TransactionType) || "pengeluaran";
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const periodeBulan = `${year}-${String(month + 1).padStart(2, "0")}`;

    const transactions = serverStore.getTransactions();
    const categories = serverStore.getCategories();
    const assets = serverStore.getAssets();
    const budgets = serverStore.getBudgets();

    // Transaksi bulan berjalan
    const currentMonthTx = transactions.filter((t) => {
      const d = new Date(t.tanggal);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    let totalPemasukan = 0;
    let totalPengeluaran = 0;

    currentMonthTx.forEach((tx) => {
      if (tx.tipe === "pemasukan") {
        totalPemasukan += tx.jumlah;
      } else {
        totalPengeluaran += tx.jumlah;
      }
    });

    if (totalPemasukan === 0) {
      totalPemasukan = 10000000; // Base baseline pemasukan
    }

    const totalBudget = budgets.reduce((sum, b) => sum + b.batasJumlah, 0);
    const sisaBudget = Math.max(0, totalBudget - totalPengeluaran);
    const persentaseBudget = totalBudget > 0 ? Math.round((totalPengeluaran / totalBudget) * 100) : 0;

    // Proyeksi jika ada input amount simulasi
    const projectedPengeluaran =
      flow === "pengeluaran" ? totalPengeluaran + amount : totalPengeluaran;
    const projectedPemasukan =
      flow === "pemasukan" ? totalPemasukan + amount : totalPemasukan;
    const projectedSisaBudget = Math.max(0, totalBudget - projectedPengeluaran);

    // Status budget per kategori
    const kategoriStatus = categories
      .filter((c) => c.tipe === "pengeluaran")
      .map((cat) => {
        const b = budgets.find((item) => item.categoryId === cat.id);
        const batas = b ? b.batasJumlah : 0;
        const terpakai = b ? b.terpakai : 0;
        const sisa = Math.max(0, batas - terpakai);
        const persentase = batas > 0 ? Math.min(100, Math.round((terpakai / batas) * 100)) : 0;

        let projectedTerpakai = terpakai;
        if (flow === "pengeluaran" && categoryId === cat.id) {
          projectedTerpakai += amount;
        }

        const isOver = batas > 0 && projectedTerpakai > batas;

        return {
          id: cat.id,
          nama: cat.nama,
          ikon: cat.ikon,
          warna: cat.warna,
          batasJumlah: batas,
          terpakai,
          sisa,
          persentase,
          projectedTerpakai,
          isOverBudget: isOver,
        };
      });

    // Ambil transaksi terbaru
    const recentTxResult = getRecentTransactions({ limit });

    return NextResponse.json(
      {
        success: true,
        data: {
          periodeBulan,
          ringkasan: {
            totalPemasukan,
            totalPengeluaran,
            totalBudget,
            sisaBudget,
            persentaseBudget,
            proyeksi: {
              inputAmount: amount,
              projectedPengeluaran,
              projectedPemasukan,
              projectedSisaBudget,
            },
          },
          kategoriStatus,
          transaksiTerbaru: recentTxResult.transaksi,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/transaksi/ringkasan:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil ringkasan transaksi dan riwayat terbaru.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
