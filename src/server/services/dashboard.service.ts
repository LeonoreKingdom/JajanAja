import { serverStore } from "../db/store";
import { LevinaInsight } from "@/types/finance";

export interface FinancialConditionSummaryResponse {
  periodeBulan: string; // YYYY-MM
  namaBulan: string;
  totalSaldo: number;
  totalPemasukanBulanIni: number;
  totalPengeluaranBulanIni: number;
  cashflowSurplus: number;
  savingRate: number; // Persentase 0-100
  totalBudgetBulanIni: number;
  sisaBudgetBulanIni: number;
  dailySafeSpendLimit: number;
  sisaHariBulanIni: number;
  skorKesehatan: number; // 0 - 100
  statusKesehatan: "sangat_sehat" | "sehat" | "waspada" | "kritis";
  labelKesehatan: string;
  trend7Hari: {
    tanggal: string;
    labelHari: string;
    pengeluaran: number;
    pemasukan: number;
  }[];
  insightLevina: LevinaInsight;
}

export function getRunningMonthFinancialCondition(
  targetDateStr?: string
): FinancialConditionSummaryResponse {
  const now = targetDateStr ? new Date(targetDateStr) : new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  const periodeBulan = `${year}-${String(month + 1).padStart(2, "0")}`;
  const namaBulan = now.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const currentDay = now.getDate();
  const sisaHariBulanIni = Math.max(1, daysInMonth - currentDay + 1);

  const assets = serverStore.getAssets();
  const budgets = serverStore.getBudgets();
  const allTransactions = serverStore.getTransactions();

  // Filter transaksi bulan ini
  const monthlyTransactions = allTransactions.filter((tx) => {
    const txDate = new Date(tx.tanggal);
    return txDate.getFullYear() === year && txDate.getMonth() === month;
  });

  // Kalkulasi total
  const totalSaldo = assets.reduce((acc, a) => acc + a.saldo, 0);

  let totalPemasukanBulanIni = 0;
  let totalPengeluaranBulanIni = 0;

  monthlyTransactions.forEach((tx) => {
    if (tx.tipe === "pemasukan") {
      totalPemasukanBulanIni += tx.jumlah;
    } else {
      totalPengeluaranBulanIni += tx.jumlah;
    }
  });

  // Bila belum ada pemasukan di transaksi bulan ini, gunakan estimasi pemasukan gaji standar
  if (totalPemasukanBulanIni === 0) {
    totalPemasukanBulanIni = 10000000;
  }

  const cashflowSurplus = totalPemasukanBulanIni - totalPengeluaranBulanIni;
  const savingRate =
    totalPemasukanBulanIni > 0
      ? Math.max(0, Math.round((cashflowSurplus / totalPemasukanBulanIni) * 100))
      : 0;

  const totalBudgetBulanIni = budgets.reduce((acc, b) => acc + b.batasJumlah, 0);
  const sisaBudgetBulanIni = Math.max(0, totalBudgetBulanIni - totalPengeluaranBulanIni);

  // Batas belanja harian aman
  const dailySafeSpendLimit = Math.max(
    0,
    Math.round(sisaBudgetBulanIni / sisaHariBulanIni)
  );

  // Hitung Skor & Status Kesehatan Finansial
  let skorKesehatan = 75;
  if (savingRate >= 30 && sisaBudgetBulanIni > 0) {
    skorKesehatan = Math.min(100, 70 + Math.round(savingRate * 0.4));
  } else if (savingRate >= 15) {
    skorKesehatan = 65;
  } else if (cashflowSurplus > 0) {
    skorKesehatan = 50;
  } else {
    skorKesehatan = 30;
  }

  let statusKesehatan: "sangat_sehat" | "sehat" | "waspada" | "kritis" = "sehat";
  let labelKesehatan = "Kondisi Keuangan Sehat";

  if (skorKesehatan >= 85) {
    statusKesehatan = "sangat_sehat";
    labelKesehatan = "Keuangan Sangat Prima";
  } else if (skorKesehatan >= 65) {
    statusKesehatan = "sehat";
    labelKesehatan = "Kondisi Keuangan Sehat";
  } else if (skorKesehatan >= 45) {
    statusKesehatan = "waspada";
    labelKesehatan = "Perlu Waspada Belanja";
  } else {
    statusKesehatan = "kritis";
    labelKesehatan = "Pengeluaran Melebihi Batas";
  }

  // Tren 7 Hari Terakhir
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const trend7Hari = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split("T")[0];
    const labelHari = dayNames[d.getDay()];

    const txDay = allTransactions.filter((tx) => tx.tanggal.startsWith(dateKey));
    const pengeluaran = txDay
      .filter((t) => t.tipe === "pengeluaran")
      .reduce((sum, t) => sum + t.jumlah, 0);
    const pemasukan = txDay
      .filter((t) => t.tipe === "pemasukan")
      .reduce((sum, t) => sum + t.jumlah, 0);

    trend7Hari.push({
      tanggal: dateKey,
      labelHari,
      pengeluaran,
      pemasukan,
    });
  }

  // Insight cerdas dari maskot LEVINA
  let insightLevina: LevinaInsight;
  if (statusKesehatan === "sangat_sehat") {
    insightLevina = {
      sapaan: "Luar biasa, Sobat!",
      pesan: `Saving rate kamu mencapai ${savingRate}% bulan ini. Cashflow surplus sangat terjaga!`,
      tips: `Batas belanja harianmu yang aman adalah Rp ${new Intl.NumberFormat("id-ID").format(
        dailySafeLimitSafe(dailySafeSpendLimit)
      )}/hari. Pertahankan ritme ini!`,
      mood: "bangga",
    };
  } else if (statusKesehatan === "sehat") {
    insightLevina = {
      sapaan: "Halo, Semangat Finansial!",
      pesan: `Alokasi budget berjalan stabil dengan surplus Rp ${new Intl.NumberFormat("id-ID").format(
        cashflowSurplus
      )}.`,
      tips: "Fokus batasi jajan impulsif pada akhir pekan agar saving rate naik ke 30%.",
      mood: "senang",
    };
  } else if (statusKesehatan === "waspada") {
    insightLevina = {
      sapaan: "Perhatian, Sobat!",
      pesan: "Pengeluaran bulan ini mulai mendekati pagu budget yang ditentukan.",
      tips: `Jaga batas harian maksimal di Rp ${new Intl.NumberFormat("id-ID").format(
        dailySafeLimitSafe(dailySafeSpendLimit)
      )}/hari agar tidak defisit.`,
      mood: "waspada",
    };
  } else {
    insightLevina = {
      sapaan: "Waspada Defisit!",
      pesan: "Arus kas bulan ini mengalami defisit. Perlu evaluasi pos pengeluaran prioritas.",
      tips: "Hentikan pos belanja sekunder dan prioritaskan kebutuhan wajib pokok.",
      mood: "waspada",
    };
  }

  return {
    periodeBulan,
    namaBulan,
    totalSaldo,
    totalPemasukanBulanIni,
    totalPengeluaranBulanIni,
    cashflowSurplus,
    savingRate,
    totalBudgetBulanIni,
    sisaBudgetBulanIni,
    dailySafeSpendLimit,
    sisaHariBulanIni,
    skorKesehatan,
    statusKesehatan,
    labelKesehatan,
    trend7Hari,
    insightLevina,
  };
}

function dailySafeLimitSafe(val: number): number {
  return isNaN(val) || val <= 0 ? 0 : val;
}
