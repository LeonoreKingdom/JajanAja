import { serverStore } from "../db/store";
import { TransactionRecord } from "../schemas/transaction.schema";
import { Asset, Budget, Category } from "@/types/finance";

export interface BudgetImpactWarning {
  level: "info" | "warning" | "danger";
  message: string;
  persentaseTerpakai: number;
  sisaBudget: number;
}

export interface MutationImpactResult {
  asset: Asset;
  budget?: Budget & { kategori: Category };
  warning?: BudgetImpactWarning;
}

export class BalanceBudgetService {
  /**
   * Terapkan dampak finansial dari transaksi (Mutasi Saldo Aset & Terpakai Budget)
   */
  applyTransaction(tx: TransactionRecord): MutationImpactResult {
    const assets = serverStore.getAssets();
    const asset = assets.find((a) => a.id === tx.assetId);

    if (!asset) {
      throw new Error(`Aset '${tx.assetId}' tidak ditemukan.`);
    }

    // Mutasi Saldo
    if (tx.tipe === "pengeluaran") {
      asset.saldo -= tx.jumlah;
    } else {
      asset.saldo += tx.jumlah;
    }
    asset.updatedAt = new Date().toISOString();

    let updatedBudget: (Budget & { kategori: Category }) | undefined;
    let warning: BudgetImpactWarning | undefined;

    // Mutasi Budget jika pengeluaran
    if (tx.tipe === "pengeluaran") {
      const budgets = serverStore.getBudgets();
      const b = budgets.find((item) => item.categoryId === tx.categoryId);

      if (b) {
        b.terpakai += tx.jumlah;
        b.updatedAt = new Date().toISOString();
        updatedBudget = b;

        const persentase =
          b.batasJumlah > 0 ? Math.round((b.terpakai / b.batasJumlah) * 100) : 100;
        const sisa = Math.max(0, b.batasJumlah - b.terpakai);

        if (b.terpakai > b.batasJumlah) {
          warning = {
            level: "danger",
            message: `Peringatan: Pos '${b.kategori.nama}' telah melebihi pagu budget sebesar Rp ${new Intl.NumberFormat(
              "id-ID"
            ).format(b.terpakai - b.batasJumlah)}!`,
            persentaseTerpakai: persentase,
            sisaBudget: 0,
          };
        } else if (persentase >= 80) {
          warning = {
            level: "warning",
            message: `Perhatian: Pos '${b.kategori.nama}' sudah terpakai ${persentase}%. Sisa budget: Rp ${new Intl.NumberFormat(
              "id-ID"
            ).format(sisa)}.`,
            persentaseTerpakai: persentase,
            sisaBudget: sisa,
          };
        }
      }
    }

    return {
      asset,
      budget: updatedBudget,
      warning,
    };
  }

  /**
   * Rollback / batalkan mutasi saldo dan budget saat transaksi dihapus
   */
  rollbackTransaction(tx: TransactionRecord): {
    asset?: Asset;
    budget?: Budget & { kategori: Category };
  } {
    const assets = serverStore.getAssets();
    const asset = assets.find((a) => a.id === tx.assetId);

    if (asset) {
      if (tx.tipe === "pengeluaran") {
        asset.saldo += tx.jumlah;
      } else {
        asset.saldo -= tx.jumlah;
      }
      asset.updatedAt = new Date().toISOString();
    }

    let budget: (Budget & { kategori: Category }) | undefined;
    if (tx.tipe === "pengeluaran") {
      const budgets = serverStore.getBudgets();
      budget = budgets.find((item) => item.categoryId === tx.categoryId);
      if (budget) {
        budget.terpakai = Math.max(0, budget.terpakai - tx.jumlah);
        budget.updatedAt = new Date().toISOString();
      }
    }

    return { asset, budget };
  }

  /**
   * Hitung sisa budget otomatis dari agregasi seluruh transaksi pengeluaran pada periode bulan
   */
  calculateBudgetUsage(periodeBulan?: string) {
    const now = new Date();
    const targetPeriode =
      periodeBulan ||
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const [yearStr, monthStr] = targetPeriode.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();
    const isCurrentMonth =
      now.getFullYear() === year && now.getMonth() + 1 === month;
    const remainingDays = isCurrentMonth
      ? Math.max(1, daysInMonth - now.getDate() + 1)
      : daysInMonth;

    const budgets = serverStore.getBudgets(targetPeriode);
    const transactions = serverStore.getTransactions();

    const calculatedBudgets = budgets.map((b) => {
      // Agregasi pengeluaran aktual dari seluruh transaksi pada periode & kategori ini
      const actualSpent = transactions
        .filter((tx) => {
          if (tx.tipe !== "pengeluaran" || tx.categoryId !== b.categoryId) {
            return false;
          }
          const txMonth = tx.tanggal.slice(0, 7);
          return txMonth === targetPeriode;
        })
        .reduce((sum, tx) => sum + tx.jumlah, 0);

      // Sinkronkan ke store jika ada perbedaan
      const terpakai = actualSpent > 0 ? actualSpent : b.terpakai;
      b.terpakai = terpakai;

      const batas = b.batasJumlah;
      const sisa = Math.max(0, batas - terpakai);
      const persentase = batas > 0 ? Math.round((terpakai / batas) * 100) : 0;
      const overBudget = terpakai > batas;
      const overBudgetAmount = Math.max(0, terpakai - batas);
      const sisaHarianRekomendasi = Math.round(sisa / remainingDays);

      let status: "aman" | "waspada" | "kritis" | "habis" = "aman";
      if (overBudget || sisa === 0) {
        status = "habis";
      } else if (persentase >= 90) {
        status = "kritis";
      } else if (persentase >= 75) {
        status = "waspada";
      }

      return {
        id: b.id,
        categoryId: b.categoryId,
        periodeBulan: b.periodeBulan,
        batasJumlah: batas,
        terpakai,
        sisa,
        persentase,
        overBudget,
        overBudgetAmount,
        sisaHarianRekomendasi,
        status,
        kategori: b.kategori,
        warna: b.warna,
        updatedAt: b.updatedAt,
      };
    });

    const totalBatas = calculatedBudgets.reduce(
      (acc, item) => acc + item.batasJumlah,
      0
    );
    const totalTerpakai = calculatedBudgets.reduce(
      (acc, item) => acc + item.terpakai,
      0
    );
    const totalSisa = Math.max(0, totalBatas - totalTerpakai);
    const persentaseTotal =
      totalBatas > 0 ? Math.round((totalTerpakai / totalBatas) * 100) : 0;
    const jumlahKategoriOverBudget = calculatedBudgets.filter(
      (b) => b.overBudget
    ).length;

    return {
      periode: targetPeriode,
      summary: {
        totalBatas,
        totalTerpakai,
        totalSisa,
        persentaseTotal,
        jumlahKategori: calculatedBudgets.length,
        jumlahKategoriOverBudget,
        hariTersisa: remainingDays,
        rekomendasiHarianTotal: Math.round(totalSisa / remainingDays),
      },
      budgets: calculatedBudgets,
    };
  }
}

export const balanceBudgetService = new BalanceBudgetService();
