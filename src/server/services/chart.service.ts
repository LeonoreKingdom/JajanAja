import { serverStore } from "../db/store";
import { TransactionType } from "@/types/finance";

export interface DailyChartPoint {
  tanggal: string; // YYYY-MM-DD
  labelHari: string; // "Sen", "Sel", dll.
  tanggalDisplay: string; // "7 Sep"
  pemasukan: number;
  pengeluaran: number;
  netCashflow: number;
  jumlahTransaksi: number;
  kategoriPengeluaranTerbanyak?: string;
}

export interface DailyChartResponse {
  range: string;
  startDate: string;
  endDate: string;
  totalPemasukan: number;
  totalPengeluaran: number;
  netCashflow: number;
  rataRataPengeluaranHarian: number;
  hariPengeluaranTertinggi?: {
    tanggal: string;
    labelHari: string;
    pengeluaran: number;
  };
  points: DailyChartPoint[];
}

export function getDailyChartData(params?: {
  range?: "7d" | "14d" | "30d" | "bulan-ini";
  startDate?: string;
  endDate?: string;
}): DailyChartResponse {
  const range = params?.range || "7d";
  const now = new Date();
  let start = new Date(now);
  let end = new Date(now);

  if (range === "bulan-ini") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else if (range === "30d") {
    start.setDate(now.getDate() - 29);
  } else if (range === "14d") {
    start.setDate(now.getDate() - 13);
  } else {
    // 7d default
    start.setDate(now.getDate() - 6);
  }

  if (params?.startDate) {
    const parsedStart = new Date(params.startDate);
    if (!isNaN(parsedStart.getTime())) start = parsedStart;
  }
  if (params?.endDate) {
    const parsedEnd = new Date(params.endDate);
    if (!isNaN(parsedEnd.getTime())) end = parsedEnd;
  }

  const allTransactions = serverStore.getTransactions();
  const categories = serverStore.getCategories();
  const catMap = new Map(categories.map((c) => [c.id, c.nama]));

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const points: DailyChartPoint[] = [];

  let cur = new Date(start);
  cur.setHours(0, 0, 0, 0);
  const endLimit = new Date(end);
  endLimit.setHours(23, 59, 59, 999);

  let totalPemasukan = 0;
  let totalPengeluaran = 0;
  let maxPengeluaran = -1;
  let hariPengeluaranTertinggi: DailyChartResponse["hariPengeluaranTertinggi"] = undefined;

  while (cur <= endLimit) {
    const dateKey = cur.toISOString().split("T")[0];
    const labelHari = dayNames[cur.getDay()];
    const tanggalDisplay = `${cur.getDate()} ${cur.toLocaleDateString("id-ID", { month: "short" })}`;

    // Ambil transaksi hari ini
    const dayTx = allTransactions.filter((tx) => tx.tanggal.startsWith(dateKey));

    let dayIncome = 0;
    let dayExpense = 0;
    const catExpenseCounts: Record<string, number> = {};

    dayTx.forEach((tx) => {
      if (tx.tipe === "pemasukan") {
        dayIncome += tx.jumlah;
      } else {
        dayExpense += tx.jumlah;
        catExpenseCounts[tx.categoryId] = (catExpenseCounts[tx.categoryId] || 0) + tx.jumlah;
      }
    });

    let topCategoryName: string | undefined = undefined;
    let highestCatAmount = 0;
    for (const [catId, amount] of Object.entries(catExpenseCounts)) {
      if (amount > highestCatAmount) {
        highestCatAmount = amount;
        topCategoryName = catMap.get(catId) || "Lainnya";
      }
    }

    if (dayExpense > maxPengeluaran) {
      maxPengeluaran = dayExpense;
      hariPengeluaranTertinggi = {
        tanggal: dateKey,
        labelHari,
        pengeluaran: dayExpense,
      };
    }

    totalPemasukan += dayIncome;
    totalPengeluaran += dayExpense;

    points.push({
      tanggal: dateKey,
      labelHari,
      tanggalDisplay,
      pemasukan: dayIncome,
      pengeluaran: dayExpense,
      netCashflow: dayIncome - dayExpense,
      jumlahTransaksi: dayTx.length,
      kategoriPengeluaranTerbanyak: topCategoryName,
    });

    cur.setDate(cur.getDate() + 1);
  }

  const daysCount = points.length || 1;
  const rataRataPengeluaranHarian = Math.round(totalPengeluaran / daysCount);
  const netCashflow = totalPemasukan - totalPengeluaran;

  return {
    range,
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
    totalPemasukan,
    totalPengeluaran,
    netCashflow,
    rataRataPengeluaranHarian,
    hariPengeluaranTertinggi: maxPengeluaran > 0 ? hariPengeluaranTertinggi : undefined,
    points,
  };
}
