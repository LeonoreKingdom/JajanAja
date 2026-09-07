import { serverStore } from "../db/store";
import { LevinaBudgetItem } from "@/types/levina";

export interface LevinaQAResponse {
  text: string;
  tipe: "text" | "budget_summary";
  topic: "budget" | "pengeluaran" | "pemasukan" | "saldo" | "umum";
  budgetData?: LevinaBudgetItem[];
  transactionSummary?: {
    totalPengeluaran: number;
    totalPemasukan: number;
    jumlahTransaksi: number;
    periode: string;
    topKategori?: Array<{ nama: string; total: number; persentase: number }>;
  };
}

function formatRupiah(amount: number): string {
  return "Rp " + Math.round(amount).toLocaleString("id-ID");
}

/**
 * Layanan cerdas Q&A LEVINA untuk menjawab pertanyaan pengguna seputar
 * data transaksi, riwayat pengeluaran/pemasukan, dan alokasi budget secara real-time.
 */
export class LevinaQAService {
  /**
   * Menjawab pertanyaan Q&A keuangan pengguna berdasarkan database & store transaksi/budget
   */
  static answerQuestion(prompt: string, _userId?: string): LevinaQAResponse {
    const query = prompt.toLowerCase().trim();

    // 1. Apakah pertanyaan spesifik seputar Budget / Pos Anggaran?
    const isBudgetQuery =
      query.includes("budget") ||
      query.includes("anggaran") ||
      query.includes("sisa limit") ||
      query.includes("batas") ||
      query.includes("sisa pos");

    // 2. Apakah pertanyaan seputar Pengeluaran / Transaksi / Jajan?
    const isExpenseQuery =
      query.includes("pengeluaran") ||
      query.includes("jajan") ||
      query.includes("habis") ||
      query.includes("keluar") ||
      query.includes("boros") ||
      query.includes("belanja berapa") ||
      query.includes("biaya");

    // 3. Apakah pertanyaan seputar Pemasukan / Pendapatan / Nabung?
    const isIncomeQuery =
      query.includes("pemasukan") ||
      query.includes("pendapatan") ||
      query.includes("gaji") ||
      query.includes("nabung") ||
      query.includes("tabungan");

    // 4. Apakah pertanyaan seputar Saldo / Aset?
    const isBalanceQuery =
      query.includes("saldo") ||
      query.includes("total uang") ||
      query.includes("rekening") ||
      query.includes("dompet") ||
      query.includes("aset");

    if (isBudgetQuery) {
      return this.handleBudgetQuestion(query);
    }

    if (isExpenseQuery) {
      return this.handleExpenseQuestion(query);
    }

    if (isIncomeQuery) {
      return this.handleIncomeQuestion(query);
    }

    if (isBalanceQuery) {
      return this.handleBalanceQuestion(query);
    }

    // Default ringkasan gabungan
    return this.handleGeneralFinancialOverview();
  }

  /**
   * Menangani pertanyaan seputar Budgeting
   */
  static handleBudgetQuestion(query: string): LevinaQAResponse {
    const rawBudgets = serverStore.getBudgets();
    const categories = serverStore.getCategories();
    const transactions = serverStore.getTransactions();

    if (rawBudgets.length === 0) {
      return {
        text: "Hai kak! Kamu belum mengatur target budget bulanan di menu Budgetin nih 🎯. Yuk buat alokasi budget pertamamu biar LEVINA bisa bantu pantau bocor halusnya!",
        tipe: "text",
        topic: "budget",
      };
    }

    // Hitung pemakaian terkini dari transaksi bulan ini
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const items: LevinaBudgetItem[] = rawBudgets.map((b) => {
      const cat = categories.find((c) => c.id === b.categoryId) || b.kategori;
      // Hitung pengeluaran real-time kategori ini di bulan berjalan
      const expenseThisMonth = transactions
        .filter(
          (t) =>
            t.tipe === "pengeluaran" &&
            t.categoryId === b.categoryId &&
            t.tanggal.startsWith(currentMonth)
        )
        .reduce((sum, t) => sum + t.jumlah, 0);

      // Gunakan nilai terbesar antara b.terpakai dan hitungan riil
      const terpakai = Math.max(b.terpakai || 0, expenseThisMonth);
      const sisa = Math.max(0, b.batasJumlah - terpakai);
      const persentase = b.batasJumlah > 0 ? Math.min(100, Math.round((terpakai / b.batasJumlah) * 100)) : 0;

      let status: "aman" | "waspada" | "habis" = "aman";
      if (persentase >= 90) status = "habis";
      else if (persentase >= 75) status = "waspada";

      return {
        kategori: cat?.nama || "Kategori Lain",
        batas: b.batasJumlah,
        terpakai,
        sisa,
        persentase,
        status,
      };
    });

    // Cek apakah ada kategori spesifik yang ditanyakan
    const matchedCategory = items.find((item) =>
      query.includes(item.kategori.toLowerCase())
    );

    if (matchedCategory) {
      let advice = "";
      if (matchedCategory.status === "habis") {
        advice = `⚠️ Perhatian! Budget ${matchedCategory.kategori} sudah mencapai ${matchedCategory.persentase}%. Sebaiknya rem dulu jajan di kategori ini sampai awal bulan depan ya kak!`;
      } else if (matchedCategory.status === "waspada") {
        advice = `⚡ Budget ${matchedCategory.kategori} sudah terpakai ${matchedCategory.persentase}%. Masih ada sisa ${formatRupiah(matchedCategory.sisa)}, gunakan dengan bijak ya!`;
      } else {
        advice = `🎯 Budget ${matchedCategory.kategori} masih sangat aman! Terpakai baru ${matchedCategory.persentase}%. Kamu masih leluasa jajan dengan sisa ${formatRupiah(matchedCategory.sisa)}.`;
      }

      const text = `📊 Informasi Budget [${matchedCategory.kategori}]:\n• Batas Bulanan: ${formatRupiah(matchedCategory.batas)}\n• Terpakai: ${formatRupiah(matchedCategory.terpakai)} (${matchedCategory.persentase}%)\n• Sisa Saldo: ${formatRupiah(matchedCategory.sisa)}\n\n${advice}`;

      return {
        text,
        tipe: "budget_summary",
        topic: "budget",
        budgetData: [matchedCategory],
      };
    }

    // Jika pertanyaan umum tentang seluruh budget
    const totalBatas = items.reduce((acc, b) => acc + b.batas, 0);
    const totalTerpakai = items.reduce((acc, b) => acc + b.terpakai, 0);
    const totalSisa = Math.max(0, totalBatas - totalTerpakai);
    const overallPercentage = totalBatas > 0 ? Math.round((totalTerpakai / totalBatas) * 100) : 0;

    const criticalItems = items.filter((i) => i.status === "habis");
    const warningItems = items.filter((i) => i.status === "waspada");

    let statusOverview = "Kondisi alokasi pos anggaranmu secara keseluruhan terpantau AMAN dan teratur 🟢.";
    if (criticalItems.length > 0) {
      statusOverview = `Ada ${criticalItems.length} pos yang masuk zona HABIS/KRITIS: ${criticalItems.map((c) => c.kategori).join(", ")}. Hati-hati jangan sampai overbudget ya kak! 🚨`;
    } else if (warningItems.length > 0) {
      statusOverview = `Ada ${warningItems.length} pos dalam zona WASPADA: ${warningItems.map((c) => c.kategori).join(", ")}. Tetap kontrol ritme belanjamu! ⚠️`;
    }

    const text = `📊 Ringkasan Seluruh Budget Bulan Ini:\n• Total Batas Anggaran: ${formatRupiah(totalBatas)}\n• Total Terpakai: ${formatRupiah(totalTerpakai)} (${overallPercentage}%)\n• Sisa Kuota Budget: ${formatRupiah(totalSisa)}\n\n${statusOverview}`;

    return {
      text,
      tipe: "budget_summary",
      topic: "budget",
      budgetData: items,
    };
  }

  /**
   * Menangani pertanyaan seputar Pengeluaran & Transaksi
   */
  static handleExpenseQuestion(query: string): LevinaQAResponse {
    const transactions = serverStore.getTransactions();
    const categories = serverStore.getCategories();
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const expenses = transactions.filter((t) => t.tipe === "pengeluaran");

    // 1. Pengeluaran Hari Ini
    if (query.includes("hari ini") || query.includes("today")) {
      const todayExpenses = expenses.filter((t) => t.tanggal.startsWith(todayStr));
      const totalToday = todayExpenses.reduce((sum, t) => sum + t.jumlah, 0);

      if (todayExpenses.length === 0) {
        return {
          text: "✨ Belum ada catatan pengeluaran untuk hari ini kak! Dompetmu masih utuh dan aman sentosa 🦊👏.",
          tipe: "text",
          topic: "pengeluaran",
          transactionSummary: {
            totalPengeluaran: 0,
            totalPemasukan: 0,
            jumlahTransaksi: 0,
            periode: "Hari Ini",
          },
        };
      }

      const listStr = todayExpenses
        .slice(0, 5)
        .map((t) => {
          const cat = categories.find((c) => c.id === t.categoryId)?.nama || "Lainnya";
          return `• ${t.catatan || cat}: ${formatRupiah(t.jumlah)}`;
        })
        .join("\n");

      const text = `🧾 Catatan Pengeluaran Hari Ini:\n${listStr}\n\nTotal pengeluaran hari ini: ${formatRupiah(totalToday)} (${todayExpenses.length} transaksi). Tetap cermat ya kak! 🎯`;

      return {
        text,
        tipe: "text",
        topic: "pengeluaran",
        transactionSummary: {
          totalPengeluaran: totalToday,
          totalPemasukan: 0,
          jumlahTransaksi: todayExpenses.length,
          periode: "Hari Ini",
        },
      };
    }

    // 2. Pengeluaran Bulan Ini & Breakdown Kategori
    const monthExpenses = expenses.filter((t) => t.tanggal.startsWith(currentMonthStr));
    const totalMonth = monthExpenses.reduce((sum, t) => sum + t.jumlah, 0);

    // Hitung per kategori
    const catMap = new Map<string, number>();
    monthExpenses.forEach((t) => {
      const cat = categories.find((c) => c.id === t.categoryId)?.nama || "Lainnya";
      catMap.set(cat, (catMap.get(cat) || 0) + t.jumlah);
    });

    const topKategori = Array.from(catMap.entries())
      .map(([nama, total]) => ({
        nama,
        total,
        persentase: totalMonth > 0 ? Math.round((total / totalMonth) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    const top3Str = topKategori
      .slice(0, 3)
      .map((k, idx) => `${idx + 1}. ${k.nama}: ${formatRupiah(k.total)} (${k.persentase}%)`)
      .join("\n");

    const text = `📈 Evaluasi Pengeluaran Bulan Ini:\n• Total Pengeluaran: ${formatRupiah(totalMonth)}\n• Jumlah Transaksi: ${monthExpenses.length} kali\n\nTop 3 Pos Pengeluaran Terbesar:\n${top3Str || "Belum ada data pengeluaran terklasifikasi."}\n\nTips dari LEVINA: Pos terbesar bulan ini ada di ${topKategori[0]?.nama || "jajan"}. Coba perhatikan apakah ada pengeluaran impulsif di pos tersebut! 🦊💡`;

    return {
      text,
      tipe: "text",
      topic: "pengeluaran",
      transactionSummary: {
        totalPengeluaran: totalMonth,
        totalPemasukan: 0,
        jumlahTransaksi: monthExpenses.length,
        periode: "Bulan Ini",
        topKategori,
      },
    };
  }

  /**
   * Menangani pertanyaan seputar Pemasukan & Pendapatan
   */
  static handleIncomeQuestion(_query: string): LevinaQAResponse {
    const transactions = serverStore.getTransactions();
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const incomes = transactions.filter(
      (t) => t.tipe === "pemasukan" && t.tanggal.startsWith(currentMonthStr)
    );
    const totalIncome = incomes.reduce((sum, t) => sum + t.jumlah, 0);

    const text = `💰 Ringkasan Pemasukan Bulan Ini:\n• Total Pemasukan: ${formatRupiah(totalIncome)}\n• Frekuensi Pemasukan: ${incomes.length} kali\n\nTerus jaga rasio tabunganmu di atas 20% ya kak agar target dana darurat dan investasi lekas tercapai! 🚀`;

    return {
      text,
      tipe: "text",
      topic: "pemasukan",
      transactionSummary: {
        totalPengeluaran: 0,
        totalPemasukan: totalIncome,
        jumlahTransaksi: incomes.length,
        periode: "Bulan Ini",
      },
    };
  }

  /**
   * Menangani pertanyaan seputar Saldo & Aset Keuangan
   */
  static handleBalanceQuestion(_query: string): LevinaQAResponse {
    const assets = serverStore.getAssets();
    const totalSaldo = assets.reduce((sum, a) => sum + a.saldo, 0);

    const assetList = assets
      .map((a) => `• ${a.nama} (${a.jenis}): ${formatRupiah(a.saldo)}`)
      .join("\n");

    const text = `🏦 Ringkasan Saldo & Aset Keuanganmu:\n${assetList}\n\nTotal Kekayaan Likuid: ${formatRupiah(totalSaldo)}.\nSemua rekening dan dompet tercatat rapi di Asetku! 💼✨`;

    return {
      text,
      tipe: "text",
      topic: "saldo",
    };
  }

  /**
   * Ringkasan Finansial Holistik Umum
   */
  static handleGeneralFinancialOverview(): LevinaQAResponse {
    const assets = serverStore.getAssets();
    const transactions = serverStore.getTransactions();
    const rawBudgets = serverStore.getBudgets();
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const monthExpenses = transactions
      .filter((t) => t.tipe === "pengeluaran" && t.tanggal.startsWith(currentMonthStr))
      .reduce((sum, t) => sum + t.jumlah, 0);

    const monthIncome = transactions
      .filter((t) => t.tipe === "pemasukan" && t.tanggal.startsWith(currentMonthStr))
      .reduce((sum, t) => sum + t.jumlah, 0);

    const totalSaldo = assets.reduce((sum, a) => sum + a.saldo, 0);

    const text = `🦊 Halo! Ini ringkasan kesehatan finansialmu saat ini:\n• Total Saldo Aset: ${formatRupiah(totalSaldo)}\n• Pemasukan Bulan Ini: ${formatRupiah(monthIncome)}\n• Pengeluaran Bulan Ini: ${formatRupiah(monthExpenses)}\n• Jumlah Pos Budget Aktif: ${rawBudgets.length} pos\n\nAda yang mau kamu tanyakan secara spesifik, seperti cek sisa budget atau pos pengeluaran terbesar? LEVINA siap bantu! ✨`;

    return {
      text,
      tipe: "text",
      topic: "umum",
      transactionSummary: {
        totalPengeluaran: monthExpenses,
        totalPemasukan: monthIncome,
        jumlahTransaksi: transactions.length,
        periode: "Bulan Ini",
      },
    };
  }
}
