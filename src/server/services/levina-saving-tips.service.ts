import { serverStore } from "../db/store";
import { LevinaSavingTip } from "@/types/levina";

export interface GeneratedSavingTipsResult {
  text: string;
  tipe: "saving_tip";
  totalPotensiHemat: number;
  tips: LevinaSavingTip[];
  bocorHalusDetected: boolean;
}

function formatRupiah(amount: number): string {
  return "Rp " + Math.round(amount).toLocaleString("id-ID");
}

/**
 * Generator saran hemat cerdas LEVINA yang menganalisis pola transaksi riil,
 * frekuensi jajan, dan kebocoran halus (latte factor/bocor halus).
 */
export class LevinaSavingTipsService {
  /**
   * Menghasilkan saran hemat dinamis berdasarkan data pengeluaran aktual
   */
  static generateTips(_userId?: string): GeneratedSavingTipsResult {
    const transactions = serverStore.getTransactions();
    const categories = serverStore.getCategories();
    const budgets = serverStore.getBudgets();

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // Filter pengeluaran bulan ini (atau fallback semua pengeluaran jika baru/sedikit)
    let expenses = transactions.filter(
      (t) => t.tipe === "pengeluaran" && t.tanggal.startsWith(currentMonth)
    );
    if (expenses.length < 3) {
      expenses = transactions.filter((t) => t.tipe === "pengeluaran");
    }

    const tips: LevinaSavingTip[] = [];
    let bocorHalusCount = 0;
    let bocorHalusAmount = 0;

    // 1. Analisis Kategori Jajan & Kopi (Bocor Halus Utama)
    const kopiExpenses = expenses.filter((t) => {
      const cat = categories.find((c) => c.id === t.categoryId);
      const catName = cat?.nama.toLowerCase() || "";
      const note = (t.catatan || "").toLowerCase();
      return (
        catName.includes("kopi") ||
        catName.includes("jajan") ||
        catName.includes("camilan") ||
        note.includes("kopi") ||
        note.includes("coffee") ||
        note.includes("boba") ||
        note.includes("snack")
      );
    });

    if (kopiExpenses.length > 0) {
      const totalKopi = kopiExpenses.reduce((sum, t) => sum + t.jumlah, 0);
      const freq = kopiExpenses.length;
      // Potensi hemat jika mengurangi frekuensi setengahnya
      const potensi = Math.round(totalKopi * 0.45);

      tips.push({
        id: "tip-kopi-jajan",
        kategori: "Kopi & Jajan",
        judul: "Optimalisasi Jajan Kopi & Camilan Sore",
        deskripsi: `Tercatat ${freq}x jajan kopi/snack dengan total ${formatRupiah(
          totalKopi
        )}. Kurangi frekuensinya menjadi 2-3 kali seminggu dan seduh kopi sendiri di rumah untuk hemat optimal.`,
        potensiHemat: potensi > 50000 ? potensi : 150000,
        ikon: "☕",
      });
    }

    // 2. Analisis Makan di Luar & Ongkir Delivery (Online Food)
    const makanExpenses = expenses.filter((t) => {
      const cat = categories.find((c) => c.id === t.categoryId);
      const catName = cat?.nama.toLowerCase() || "";
      const note = (t.catatan || "").toLowerCase();
      return (
        (catName.includes("makan") || catName.includes("kuliner")) &&
        (note.includes("gofood") ||
          note.includes("grabfood") ||
          note.includes("shopeefood") ||
          note.includes("resto") ||
          note.includes("delivery") ||
          t.jumlah >= 40000)
      );
    });

    if (makanExpenses.length >= 2) {
      const totalMakan = makanExpenses.reduce((sum, t) => sum + t.jumlah, 0);
      const potensi = Math.round(totalMakan * 0.35);

      tips.push({
        id: "tip-makan-delivery",
        kategori: "Makan & Minum",
        judul: "Pangkas Biaya Ongkir & Layanan Aplikasi",
        deskripsi: `Pengeluaran makan di luar & delivery menyumbang ${formatRupiah(
          totalMakan
        )}. Menyiapkan meal prep atau beli langsung saat arah pulang bisa memotong biaya kemasan & biaya antar.`,
        potensiHemat: potensi > 100000 ? potensi : 180000,
        ikon: "🛵",
      });
    }

    // 3. Deteksi Kebocoran Halus (Nominal kecil < Rp 35.000 dengan frekuensi tinggi)
    const smallExpenses = expenses.filter((t) => t.jumlah > 0 && t.jumlah <= 35000);
    bocorHalusCount = smallExpenses.length;
    bocorHalusAmount = smallExpenses.reduce((sum, t) => sum + t.jumlah, 0);

    if (bocorHalusCount >= 3) {
      const potensi = Math.round(bocorHalusAmount * 0.4);
      tips.push({
        id: "tip-bocor-halus",
        kategori: "Bocor Halus",
        judul: "Waspadai Pengeluaran Mikro Berulang",
        deskripsi: `Ditemukan ${bocorHalusCount} transaksi kecil (di bawah Rp 35.000) senilai total ${formatRupiah(
          bocorHalusAmount
        )}. Kebocoran mikro ini sering tak terasa namun menggerus tabungan.`,
        potensiHemat: potensi > 40000 ? potensi : 120000,
        ikon: "🔍",
      });
    }

    // 4. Analisis Pos yang Mendekati Budget Limit (Waspada / Habis)
    const criticalBudgets = budgets.filter((b) => {
      const pct = b.batasJumlah > 0 ? (b.terpakai / b.batasJumlah) * 100 : 0;
      return pct >= 75;
    });

    if (criticalBudgets.length > 0) {
      const firstB = criticalBudgets[0];
      const cat = categories.find((c) => c.id === firstB.categoryId) || firstB.kategori;
      const catName = cat?.nama || "Pos Anggaran";

      tips.push({
        id: `tip-budget-${firstB.id}`,
        kategori: catName,
        judul: `Kendalikan Pengeluaran Pos ${catName}`,
        deskripsi: `Alokasi budget ${catName} sudah terpakai ${Math.round(
          (firstB.terpakai / firstB.batasJumlah) * 100
        )}%. Terapkan aturan 24 jam sebelum melakukan pembelian non-esensial di pos ini.`,
        potensiHemat: Math.round(firstB.batasJumlah * 0.2),
        ikon: "🎯",
      });
    }

    // 5. Fallback jika data transaksi masih sangat sedikit
    if (tips.length < 3) {
      tips.push({
        id: "tip-langganan-tagihan",
        kategori: "Tagihan & Langganan",
        judul: "Audit Langganan Digital & Paket Data",
        deskripsi:
          "Cek kembali langganan streaming atau paket internet yang jarang dipakai. Beralih ke paket keluarga atau beli paket bulanan saat ada cashback.",
        potensiHemat: 75000,
        ikon: "📱",
      });
    }

    if (tips.length < 3) {
      tips.push({
        id: "tip-belanja-bulanan",
        kategori: "Belanja Bulanan",
        judul: "Gunakan Daftar Belanja Ketat Saat ke Supermarket",
        deskripsi:
          "Buat daftar belanja tertulis sebelum ke supermarket dan jangan belanja saat perut lapar untuk menghindari impulsive buying.",
        potensiHemat: 120000,
        ikon: "🛒",
      });
    }

    // Batasi maksimum 3-4 tips terpenting
    const finalTips = tips.slice(0, 3);
    const totalPotensiHemat = finalTips.reduce((acc, t) => acc + t.potensiHemat, 0);

    const summaryText = `💡 Rekomendasi Cerdas Penghematan Dompet (Berdasarkan Pola Belanja):\n\nAku menganalisis riwayat transaksi dan pos anggaranmu. Ada potensi penghematan hingga ${formatRupiah(
      totalPotensiHemat
    )}/bulan dengan penyesuaian kebiasaan kecil berikut:`;

    return {
      text: summaryText,
      tipe: "saving_tip",
      totalPotensiHemat,
      tips: finalTips,
      bocorHalusDetected: bocorHalusCount >= 3,
    };
  }
}
