import { LevinaChatMessage } from "@/types/levina";
import { initialLevinaChatHistory } from "./mock-levina";

const LEVINA_STORAGE_KEY = "jajanaja_levina_chats";

export function loadStoredLevinaMessages(): LevinaChatMessage[] {
  if (typeof window === "undefined") return initialLevinaChatHistory;

  try {
    const saved = localStorage.getItem(LEVINA_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Gagal memuat riwayat chat LEVINA:", e);
  }

  try {
    localStorage.setItem(LEVINA_STORAGE_KEY, JSON.stringify(initialLevinaChatHistory));
  } catch {}

  return initialLevinaChatHistory;
}

export function saveStoredLevinaMessages(messages: LevinaChatMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LEVINA_STORAGE_KEY, JSON.stringify(messages));
  } catch (e) {
    console.error("Gagal menyimpan riwayat chat LEVINA:", e);
  }
}

export function resetStoredLevinaMessages(): LevinaChatMessage[] {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LEVINA_STORAGE_KEY, JSON.stringify(initialLevinaChatHistory));
    } catch {}
  }
  return initialLevinaChatHistory;
}

export function clearStoredLevinaMessages(): LevinaChatMessage[] {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(LEVINA_STORAGE_KEY);
    } catch {}
  }
  return [];
}

/**
 * Mesin simulasi kecerdasan tiruan LEVINA untuk menjawab berbagai topik keuangan
 */
export async function simulateLevinaReply(
  prompt: string
): Promise<{
  text: string;
  tipe: LevinaChatMessage["tipe"];
  budgetData?: import("@/types/levina").LevinaBudgetItem[];
  savingTips?: import("@/types/levina").LevinaSavingTip[];
  featureGuide?: import("@/types/levina").LevinaFeatureGuide;
}> {
  // Simulasi latency natural 600 - 900ms
  await new Promise((resolve) => setTimeout(resolve, 750));

  const lower = prompt.toLowerCase().trim();

  // 1. Sapaan & Karakter LEVINA
  if (
    lower.startsWith("halo") ||
    lower.startsWith("hai") ||
    lower.startsWith("pagi") ||
    lower.startsWith("siang") ||
    lower.startsWith("malam") ||
    lower.includes("siapa kamu") ||
    lower.includes("kenalan")
  ) {
    return {
      text: "Halo kak! Senang ngobrol lagi denganmu. Aku LEVINA, maskot rubah pintar & teman finansial setiamu di JajanAja 🦊✨.\n\nTugas utamaku adalah membantu kamu melacak uang jajan, menyusun budget bulanan, dan mencegah kebocoran dompet tanpa bikin hidup kamu kaku!",
      tipe: "text",
    };
  }

  // 2. Pertanyaan Khusus Kategori Kopi
  if (lower.includes("kopi") && (lower.includes("budget") || lower.includes("sisa"))) {
    return {
      text: "☕ Khusus pos Kopi & Jajan:\n• Batas Bulanan: Rp 500.000\n• Terpakai: Rp 178.000 (36%)\n• Sisa Saldo: Rp 322.000 (64%)\n\nMasih aman banget! Jatah jajanmu sekitar 2 cup per minggu (@Rp 25.000) masih pas sampai akhir bulan. 🎯",
      tipe: "budget_summary",
      budgetData: [
        {
          kategori: "Kopi & Jajan",
          batas: 500000,
          terpakai: 178000,
          sisa: 322000,
          persentase: 36,
          status: "aman",
        },
      ],
    };
  }

  // 3. Pertanyaan Khusus Kategori Makan
  if (lower.includes("makan") && (lower.includes("budget") || lower.includes("sisa"))) {
    return {
      text: "🍽️ Khusus pos Makan & Minum:\n• Batas Bulanan: Rp 1.500.000\n• Terpakai: Rp 650.000 (43%)\n• Sisa Saldo: Rp 850.000 (57%)\n\nKamu masih punya kuota sekitar Rp 28.000/hari untuk makan di luar. Sangat terkendali! 👍",
      tipe: "budget_summary",
      budgetData: [
        {
          kategori: "Makan & Minum",
          batas: 1500000,
          terpakai: 650000,
          sisa: 850000,
          persentase: 43,
          status: "aman",
        },
      ],
    };
  }

  // 4. Pertanyaan Pengeluaran Hari Ini / Bulan Ini
  if (
    lower.includes("pengeluaran") ||
    lower.includes("jajan berapa") ||
    lower.includes("habis berapa") ||
    lower.includes("boros")
  ) {
    if (lower.includes("hari ini")) {
      return {
        text: "🧾 Pengeluaranmu Hari Ini:\n• Kopi Susu Aren: Rp 20.000\n• Nasi Padang Rendang: Rp 34.000\n\nTotal pengeluaran hari ini Rp 54.000. Masih di bawah batas aman harianmu Rp 65.000/hari lho! Mantap! 👏",
        tipe: "text",
      };
    }

    return {
      text: "📈 Evaluasi Pengeluaran Bulan Ini:\n• Total Pemasukan: Rp 8.500.000\n• Total Pengeluaran: Rp 2.078.000 (24% dari pemasukan)\n• Tingkat Tabungan (Savings Rate): 76%\n\nKondisi keuanganmu bulan ini masuk kategori SANGAT SEHAT (Hijau 🟢). Tidak terdeteksi boncos atau kebocoran ekstrim.",
      tipe: "budget_summary",
      budgetData: [
        {
          kategori: "Makan & Minum",
          batas: 1500000,
          terpakai: 650000,
          sisa: 850000,
          persentase: 43,
          status: "aman",
        },
        {
          kategori: "Kopi & Jajan",
          batas: 500000,
          terpakai: 178000,
          sisa: 322000,
          persentase: 36,
          status: "aman",
        },
        {
          kategori: "Belanja Bulanan",
          batas: 1500000,
          terpakai: 1050000,
          sisa: 450000,
          persentase: 70,
          status: "waspada",
        },
      ],
    };
  }

  // 5. Pertanyaan Umum Budget & Sisa Alokasi
  if (
    lower.includes("budget") ||
    lower.includes("sisa") ||
    lower.includes("pos") ||
    lower.includes("kuota") ||
    lower.includes("alokasi")
  ) {
    return {
      text: "📊 Rekap Sisa Budget Bulan Ini:\n\n• 🍽️ Makan & Minum: Tersisa Rp 850.000 (45%)\n• ☕ Kopi & Jajan: Tersisa Rp 322.000 (64%)\n• 🛒 Belanja Bulanan: Tersisa Rp 450.000 (30%)\n• 🚗 Transportasi: Tersisa Rp 200.000 (50%)\n\nTotal sisa alokasi masih Rp 1.822.000. Pos Belanja Bulanan sudah mencapai 70%, jadi belanja berikutnya prioritaskan kebutuhan pokok ya! 🎯",
      tipe: "budget_summary",
      budgetData: [
        {
          kategori: "Makan & Minum",
          batas: 1500000,
          terpakai: 650000,
          sisa: 850000,
          persentase: 43,
          status: "aman",
        },
        {
          kategori: "Kopi & Jajan",
          batas: 500000,
          terpakai: 178000,
          sisa: 322000,
          persentase: 36,
          status: "aman",
        },
        {
          kategori: "Belanja Bulanan",
          batas: 1500000,
          terpakai: 1050000,
          sisa: 450000,
          persentase: 70,
          status: "waspada",
        },
        {
          kategori: "Transportasi",
          batas: 400000,
          terpakai: 200000,
          sisa: 200000,
          persentase: 50,
          status: "aman",
        },
      ],
    };
  }

  // 3. Saran Hemat & Deteksi Kebocoran Halus
  if (
    lower.includes("hemat") ||
    lower.includes("tips") ||
    lower.includes("saran") ||
    lower.includes("bocor") ||
    lower.includes("nabung") ||
    lower.includes("rekomendasi")
  ) {
    return {
      text: "💡 Rekomendasi Cerdas Penghematan Dompet (Berdasarkan Pola Belanja):\n\nAku menganalisis riwayat transaksi dan anggaranmu bulan ini. Ada potensi penghematan hingga Rp 450.000/bulan dengan penyesuaian kebiasaan kecil berikut:",
      tipe: "saving_tip",
      savingTips: [
        {
          id: "tip-1",
          kategori: "Kopi & Jajan",
          judul: "Batasi Frekuensi Kopi Kekinian",
          deskripsi:
            "Jajan kopi tercatat rata-rata 4x seminggu. Kurangi jadi 2x seminggu, sisanya seduh sendiri di rumah/kantor.",
          potensiHemat: 200000,
          ikon: "☕",
        },
        {
          id: "tip-2",
          kategori: "Makan & Minum",
          judul: "Kurangi Biaya Delivery & Ongkir",
          deskripsi:
            "Biaya antar dan jasa aplikasi menyumbang ~Rp 180rb bulan ini. Ambil makanan takeaway langsung saat jalan pulang.",
          potensiHemat: 180000,
          ikon: "🛵",
        },
        {
          id: "tip-3",
          kategori: "Tagihan & Pulsa",
          judul: "Bundling Paket Data & Pulsa",
          deskripsi:
            "Hindari beli kuota darurat eceran; gunakan paket data bulanan saat ada promo cashback e-wallet.",
          potensiHemat: 70000,
          ikon: "📱",
        },
      ],
    };
  }

  // 4. Panduan Fitur: Bagi Tagihan (Split Bill)
  if (
    lower.includes("split") ||
    lower.includes("tagihan") ||
    lower.includes("patungan") ||
    lower.includes("teman")
  ) {
    return {
      text: "👥 Panduan Praktis Fitur Bagi Tagihan:\n\n1. Masuk ke menu 'Bagi Tagihan' (ada di dashboard atau tombol cepat).\n2. Tekan 'Bagi Baru' dan isi total tagihan makan bersama.\n3. Pilih metode 'Sama Rata' atau atur 'Nominal Bebas' tiap orang.\n4. Klik 'Bagikan Tagihan' untuk otomatis menyalin rincian siap kirim via WhatsApp!\n5. Saat teman sudah transfer, centang status 'Lunas' agar kamu ingat siapa yang belum bayar.",
      tipe: "feature_guide",
      featureGuide: {
        featureName: "Bagi Tagihan (Split Bill)",
        description: "Bagi bon makan bareng teman tanpa pusing hitung manual & tagih via WhatsApp.",
        steps: [
          "Buka menu Bagi Tagihan atau klik tombol di bawah",
          "Buat tagihan baru & masukkan total struk serta nama teman-teman",
          "Pilih metode bagi sama rata atau nominal khusus per orang",
          "Salin teks rincian dan bagikan ke grup WhatsApp",
          "Tandai status lunas seketika saat teman sudah transfer",
        ],
        actionLabel: "Buka Bagi Tagihan",
        actionHref: "/bagi-tagihan",
        icon: "👥",
      },
    };
  }

  // 5. Panduan Fitur: Pindai Struk
  if (
    lower.includes("struk") ||
    lower.includes("pindai") ||
    lower.includes("scan") ||
    lower.includes("foto struk") ||
    lower.includes("ocr")
  ) {
    return {
      text: "🧾 Cara Mencatat Cepat dengan Pindai Struk:\n\n1. Pilih menu 'Pindai Struk' dari navigasi bawah atau tombol kamera.\n2. Ambil foto struk belanjaan fisik (Indomaret, Alfamart, Cafe, Resto Padang, dll).\n3. AI JajanAja akan membaca nama merchant, rincian barang, dan total nominal secara otomatis.\n4. Verifikasi hasilnya dan klik 'Simpan ke Transaksi'—dompet dan budget langsung terpotong akurat!",
      tipe: "feature_guide",
      featureGuide: {
        featureName: "Pindai Struk Belanja",
        description: "Scan struk belanjaan fisik secara instan dengan OCR & deteksi kategori otomatis.",
        steps: [
          "Buka menu Pindai Struk atau klik ikon kamera",
          "Ambil foto struk fisik belanjaanmu dengan pencahayaan jelas",
          "Tinjau item, harga, dan kategori hasil deteksi otomatis",
          "Klik Simpan Transaksi untuk mencatat ke dompet & budget",
        ],
        actionLabel: "Mulai Pindai Struk",
        actionHref: "/pindai-struk",
        icon: "🧾",
      },
    };
  }

  // 6. Panduan Fitur: WhatsApp Bot
  if (lower.includes("wa") || lower.includes("whatsapp")) {
    return {
      text: "💬 Catat Transaksi Instan via WhatsApp:\n\n1. Buka halaman 'Catat via WhatsApp'.\n2. Pastikan nomor WhatsApp pribadimu sudah terhubung.\n3. Simpan nomor bot JajanAja (+62 821-5555-0123).\n4. Cukup kirim pesan singkat seperti 'kopi 25rb' atau 'grab 30000', transaksi langsung otomatis tercatat di dashboard!",
      tipe: "feature_guide",
      featureGuide: {
        featureName: "Catat Cepat via WhatsApp",
        description: "Catat pengeluaran harian secepat chat teman lewat bot WhatsApp AI JajanAja.",
        steps: [
          "Buka menu Catat via WhatsApp",
          "Tautkan nomor WhatsApp aktifmu untuk verifikasi",
          "Simpan kontak nomor resmi bot JajanAja",
          "Kirim chat format bebas (cth: 'kopi 25rb', 'nasi padang 30k')",
          "Bot akan mengonfirmasi pencatatan seketika",
        ],
        actionLabel: "Hubungkan WhatsApp",
        actionHref: "/whatsapp",
        icon: "💬",
      },
    };
  }

  // 7. Panduan Fitur: Budgetin
  if (lower.includes("cara") && (lower.includes("budget") || lower.includes("anggaran"))) {
    return {
      text: "🎯 Panduan Mengatur Anggaran di Budgetin:\n\n1. Masuk ke menu 'Budgetin'.\n2. Tentukan batas pengeluaran bulanan per pos (cth: Makan & Minum, Kopi).\n3. JajanAja akan menghitung sisa kuota dan persentase penggunaan otomatis setiap kali kamu mencatat transaksi.\n4. LEVINA akan memperingatkanmu jika pengeluaran sudah mendekati 80%!",
      tipe: "feature_guide",
      featureGuide: {
        featureName: "Kelola Pos Anggaran (Budgetin)",
        description: "Atur batas maksimal pengeluaran per kategori agar tidak kebablasan jajan.",
        steps: [
          "Masuk ke halaman Budgetin melalui navigasi bawah",
          "Pilih kategori yang ingin dibatasi (Makan, Kopi, Belanja, dll)",
          "Tentukan batas nominal pengeluaran untuk bulan berjalan",
          "Pantau persentase pemakaian secara real-time",
        ],
        actionLabel: "Atur Budgetin",
        actionHref: "/budgetin",
        icon: "🎯",
      },
    };
  }

  // 8. Panduan Fitur: Asetku
  if (lower.includes("cara") && (lower.includes("aset") || lower.includes("saldo") || lower.includes("dompet"))) {
    return {
      text: "💼 Panduan Mengelola Dompet & Asetku:\n\n1. Masuk ke menu 'Asetku'.\n2. Tambahkan semua kantong keuanganmu (Rekening Bank, E-Wallet, Uang Tunai).\n3. Perbarui saldo secara berkala atau biarkan otomatis terpotong saat transaksi dicatat.\n4. Pantau total kekayaan bersihmu di satu tempat rapi!",
      tipe: "feature_guide",
      featureGuide: {
        featureName: "Manajemen Saldo (Asetku)",
        description: "Pusatkan semua rekening bank, e-wallet, dan uang tunai dalam satu dashboard aset.",
        steps: [
          "Buka halaman Asetku",
          "Klik Tambah Aset untuk mendaftarkan akun bank atau e-wallet baru",
          "Sesuaikan saldo awal kantong keuanganmu",
          "Lihat pertumbuhan total kekayaan likuidmu",
        ],
        actionLabel: "Buka Asetku",
        actionHref: "/asetku",
        icon: "💼",
      },
    };
  }

  // 9. Saldo & Aset (Info)
  if (lower.includes("saldo") || lower.includes("aset") || lower.includes("uang")) {
    return {
      text: "💰 Ringkasan Saldo Asetku:\n\n• 🏦 BCA: Rp 12.500.000\n• 📱 GoPay: Rp 320.000\n• 🟣 OVO: Rp 150.000\n• 💵 Uang Tunai: Rp 450.000\n\nTotal kekayaan likuidmu saat ini adalah Rp 13.420.000. Semua saldo asetmu tercatat rapi di menu Asetku ya kak! ✨",
      tipe: "text",
    };
  }

  // 8. Respon Umum / default
  return {
    text: `Siap kak! Aku catat pertanyaanmu: "${prompt}". Sebagai asisten finansialmu, aku selalu mengawasi arus kasmu agar kamu bisa menikmati jajan enak dengan tenang tanpa rasa bersalah. Ada yang mau dicek lagi? 🦊✨`,
    tipe: "text",
  };
}
