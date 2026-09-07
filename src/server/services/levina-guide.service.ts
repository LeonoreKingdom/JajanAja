import { LevinaFeatureGuide } from "@/types/levina";

export interface LevinaFeatureGuideResult {
  text: string;
  tipe: "feature_guide";
  featureGuide: LevinaFeatureGuide;
}

export const featureGuidesDatabase: Record<string, LevinaFeatureGuide & { explanation: string; aliases: string[] }> = {
  "bagi-tagihan": {
    featureName: "Bagi Tagihan (Split Bill)",
    description: "Bagi bon makan bareng teman tanpa pusing hitung manual & tagih via WhatsApp.",
    explanation:
      "👥 Panduan Praktis Fitur Bagi Tagihan:\n\n1. Masuk ke menu 'Bagi Tagihan' (ada di menu bawah atau pintasan dashboard).\n2. Tekan tombol 'Bagi Baru' dan isi total tagihan atau pilih dari transaksi yang sudah dicatat.\n3. Masukkan nama teman-teman dan pilih metode 'Sama Rata' atau atur 'Nominal Bebas'.\n4. Klik 'Bagikan Tagihan' untuk menyalin teks rincian patungan siap kirim ke WhatsApp!\n5. Saat teman sudah transfer, centang status 'Lunas' agar kamu tahu siapa yang belum bayar.",
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
    aliases: ["split", "tagihan", "patungan", "bagi tagihan", "teman", "split bill"],
  },

  "pindai-struk": {
    featureName: "Pindai Struk Belanja",
    description: "Scan struk belanjaan fisik secara instan dengan OCR & deteksi kategori otomatis.",
    explanation:
      "🧾 Cara Mencatat Cepat dengan Pindai Struk:\n\n1. Pilih menu 'Pindai Struk' dari navigasi bawah atau ikon kamera.\n2. Ambil foto struk fisik belanjaanmu (Alfamart, Indomaret, resto, cafe, dll).\n3. AI JajanAja membaca merchant, tanggal, item barang, dan total harga otomatis.\n4. Verifikasi dan klik 'Simpan Transaksi'—dompet & alokasi budgetmu langsung terupdate!",
    steps: [
      "Buka menu Pindai Struk atau klik ikon kamera",
      "Ambil atau unggah foto struk fisik belanjaanmu dengan jelas",
      "Tinjau merchant, item belanjaan, dan total harga yang terdeteksi",
      "Pilih pos kategori dan kantong aset pembayaran",
      "Klik Simpan Transaksi untuk mencatat pengeluaran secara instan",
    ],
    actionLabel: "Mulai Pindai Struk",
    actionHref: "/pindai-struk",
    icon: "🧾",
    aliases: ["struk", "pindai", "scan", "foto struk", "ocr", "kamera struk"],
  },

  "whatsapp": {
    featureName: "Catat Cepat via WhatsApp",
    description: "Catat pengeluaran harian secepat chat teman lewat bot WhatsApp AI JajanAja.",
    explanation:
      "💬 Catat Transaksi Instan via WhatsApp:\n\n1. Buka halaman 'Catat via WhatsApp'.\n2. Hubungkan nomor WhatsApp pribadimu ke akun JajanAja.\n3. Simpan nomor bot resmi JajanAja (+62 821-5555-0123).\n4. Cukup kirim pesan singkat sehari-hari seperti 'kopi 25rb' atau 'nasi padang 30k', transaksi langsung tercatat rapi di dashboard!",
    steps: [
      "Buka menu Catat via WhatsApp",
      "Tautkan dan verifikasi nomor WhatsApp aktifmu",
      "Simpan kontak nomor resmi bot JajanAja",
      "Kirim pesan format santai (cth: 'kopi susu 22k', 'bensin 50rb')",
      "Bot membalas konfirmasi pencatatan seketika",
    ],
    actionLabel: "Hubungkan WhatsApp",
    actionHref: "/whatsapp",
    icon: "💬",
    aliases: ["wa", "whatsapp", "bot wa", "chat wa", "catat whatsapp"],
  },

  "budgetin": {
    featureName: "Kelola Pos Anggaran (Budgetin)",
    description: "Atur batas maksimal pengeluaran per kategori agar tidak kebablasan jajan.",
    explanation:
      "🎯 Panduan Mengatur Anggaran di Budgetin:\n\n1. Masuk ke menu 'Budgetin'.\n2. Atur target batas pengeluaran bulanan per pos (cth: Makan & Minum, Kopi & Jajan).\n3. JajanAja melacak sisa saldo dan persentase penggunaan otomatis setiap kali transaksi dicatat.\n4. LEVINA akan memberikan peringatan dini jika posmu sudah mendekati zona waspada (75%) atau kritis (90%)!",
    steps: [
      "Masuk ke halaman Budgetin melalui navigasi bawah",
      "Pilih kategori yang ingin dibatasi (Makan, Kopi, Belanja, Hiburan)",
      "Tentukan batas nominal anggaran untuk bulan berjalan",
      "Pantau persentase pemakaian secara real-time dan hindari overbudget",
    ],
    actionLabel: "Atur Budgetin",
    actionHref: "/budgetin",
    icon: "🎯",
    aliases: ["budget", "budgetin", "anggaran", "pos", "limit", "alokasi"],
  },

  "asetku": {
    featureName: "Manajemen Saldo (Asetku)",
    description: "Pusatkan semua rekening bank, e-wallet, dan uang tunai dalam satu dashboard aset.",
    explanation:
      "💼 Panduan Mengelola Dompet & Asetku:\n\n1. Masuk ke menu 'Asetku'.\n2. Daftarkan semua rekening bank (BCA, Mandiri, dll), e-wallet (GoPay, OVO), dan uang tunai.\n3. Saldo akan otomatis bertambah saat mencatat pemasukan (NabungAja) dan berkurang saat mencatat pengeluaran (JajanAja).\n4. Pantau total kekayaan likuid dan alokasi kantong keuanganmu!",
    steps: [
      "Buka halaman Asetku dari menu utama",
      "Klik Tambah Aset untuk mendaftarkan akun bank atau e-wallet baru",
      "Sesuaikan saldo awal kantong keuanganmu",
      "Perbarui saldo atau biarkan otomatis termutasi setiap transaksi",
    ],
    actionLabel: "Buka Asetku",
    actionHref: "/asetku",
    icon: "💼",
    aliases: ["aset", "asetku", "saldo", "rekening", "bank", "dompet", "ewallet"],
  },

  "transaksi": {
    featureName: "Catat Transaksi (JajanAja & NabungAja)",
    description: "Pencatatan pengeluaran dan pemasukan cepat dengan multi-kategori dan tag.",
    explanation:
      "✍️ Cara Mencatat Transaksi Pengeluaran & Pemasukan:\n\n1. Klik tombol '+' melayang atau buka menu Transaksi.\n2. Pilih tab 'JajanAja' untuk pengeluaran atau 'NabungAja' untuk pemasukan.\n3. Masukkan nominal uang, tanggal, dan catatan singkat.\n4. Pilih kategori yang sesuai serta kantong aset sumber dana.\n5. Klik Simpan dan transaksi langsung mempengaruhi saldo aset serta kuota budget!",
    steps: [
      "Klik tombol tambah (+) di bagian tengah navigasi bawah",
      "Pilih jenis: Pengeluaran (JajanAja) atau Pemasukan (NabungAja)",
      "Ketikkan nominal rupiah dan catatan transaksi",
      "Tentukan pos kategori dan aset yang digunakan",
      "Simpan transaksi untuk memperbarui dashboard seketika",
    ],
    actionLabel: "Catat Transaksi",
    actionHref: "/transaksi",
    icon: "✍️",
    aliases: ["transaksi", "jajan", "nabung", "tambah pengeluaran", "tambah pemasukan", "catat"],
  },
};

/**
 * Generator panduan langkah fitur JajanAja cerdas LEVINA
 */
export class LevinaGuideService {
  /**
   * Menghasilkan panduan fitur berdasarkan kata kunci pencarian atau identifier fitur
   */
  static generateGuide(queryOrKey: string): LevinaFeatureGuideResult {
    const q = (queryOrKey || "").toLowerCase().trim();

    // 1. Cek kecocokan langsung dengan key
    if (featureGuidesDatabase[q]) {
      const guide = featureGuidesDatabase[q];
      return {
        text: guide.explanation,
        tipe: "feature_guide",
        featureGuide: {
          featureName: guide.featureName,
          description: guide.description,
          steps: guide.steps,
          actionLabel: guide.actionLabel,
          actionHref: guide.actionHref,
          icon: guide.icon,
        },
      };
    }

    // 2. Cek kecocokan melalui aliases
    for (const [key, item] of Object.entries(featureGuidesDatabase)) {
      if (item.aliases.some((alias) => q.includes(alias))) {
        return {
          text: item.explanation,
          tipe: "feature_guide",
          featureGuide: {
            featureName: item.featureName,
            description: item.description,
            steps: item.steps,
            actionLabel: item.actionLabel,
            actionHref: item.actionHref,
            icon: item.icon,
          },
        };
      }
    }

    // 3. Default fallback: Panduan Fitur Bagi Tagihan & Fitur Populer
    const defaultGuide = featureGuidesDatabase["bagi-tagihan"];
    return {
      text: `🦊 Berikut panduan salah satu fitur unggulan JajanAja:\n\n${defaultGuide.explanation}\n\nKamu juga bisa menanyakan panduan fitur lain seperti 'cara scan struk', 'cara pakai whatsapp bot', atau 'cara atur budget' ya kak! ✨`,
      tipe: "feature_guide",
      featureGuide: {
        featureName: defaultGuide.featureName,
        description: defaultGuide.description,
        steps: defaultGuide.steps,
        actionLabel: defaultGuide.actionLabel,
        actionHref: defaultGuide.actionHref,
        icon: defaultGuide.icon,
      },
    };
  }

  /**
   * Mengambil daftar seluruh panduan fitur yang tersedia
   */
  static getAllGuides(): LevinaFeatureGuide[] {
    return Object.values(featureGuidesDatabase).map((item) => ({
      featureName: item.featureName,
      description: item.description,
      steps: item.steps,
      actionLabel: item.actionLabel,
      actionHref: item.actionHref,
      icon: item.icon,
    }));
  }
}
