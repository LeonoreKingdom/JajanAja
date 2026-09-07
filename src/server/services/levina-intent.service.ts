export type LevinaIntentType =
  | "sapaan"
  | "tanya_budget"
  | "tanya_pengeluaran"
  | "saran_hemat"
  | "panduan_fitur"
  | "tanya_aset"
  | "umum";

export interface LevinaIntentResult {
  intent: LevinaIntentType;
  subIntent?: string;
  kategoriKeyword?: string;
  featureTarget?: "bagi_tagihan" | "pindai_struk" | "whatsapp" | "budgetin" | "asetku";
  confidence: number;
  entities: {
    nominal?: number;
    periode?: "hari_ini" | "minggu_ini" | "bulan_ini";
    kategori?: string;
  };
}

/**
 * Mendeteksi intent pertanyaan pengguna dalam percakapan chatbot teman finansial LEVINA
 */
export function detectLevinaIntent(prompt: string): LevinaIntentResult {
  const lower = prompt.toLowerCase().trim();

  // 1. Sapaan & Identitas LEVINA
  if (
    lower.startsWith("halo") ||
    lower.startsWith("hai") ||
    lower.startsWith("hei") ||
    lower.startsWith("pagi") ||
    lower.startsWith("siang") ||
    lower.startsWith("malam") ||
    lower.includes("siapa kamu") ||
    lower.includes("kenalan") ||
    lower === "p" ||
    lower.includes("bisa apa")
  ) {
    return {
      intent: "sapaan",
      confidence: 98,
      entities: {},
    };
  }

  // 2. Panduan Fitur Spesifik
  if (
    lower.includes("cara") ||
    lower.includes("gimana") ||
    lower.includes("bagaimana") ||
    lower.includes("panduan") ||
    lower.includes("tutorial") ||
    lower.includes("pakai fitur")
  ) {
    if (lower.includes("split") || lower.includes("tagihan") || lower.includes("patungan")) {
      return {
        intent: "panduan_fitur",
        subIntent: "bagi_tagihan",
        featureTarget: "bagi_tagihan",
        confidence: 95,
        entities: {},
      };
    }

    if (lower.includes("struk") || lower.includes("pindai") || lower.includes("scan") || lower.includes("ocr")) {
      return {
        intent: "panduan_fitur",
        subIntent: "pindai_struk",
        featureTarget: "pindai_struk",
        confidence: 95,
        entities: {},
      };
    }

    if (lower.includes("wa") || lower.includes("whatsapp")) {
      return {
        intent: "panduan_fitur",
        subIntent: "whatsapp",
        featureTarget: "whatsapp",
        confidence: 95,
        entities: {},
      };
    }

    if (lower.includes("budget") || lower.includes("anggaran") || lower.includes("pos")) {
      return {
        intent: "panduan_fitur",
        subIntent: "budgetin",
        featureTarget: "budgetin",
        confidence: 92,
        entities: {},
      };
    }

    if (lower.includes("aset") || lower.includes("rekening") || lower.includes("dompet")) {
      return {
        intent: "panduan_fitur",
        subIntent: "asetku",
        featureTarget: "asetku",
        confidence: 92,
        entities: {},
      };
    }
  }

  // 3. Saran Hemat & Tips Pengeluaran
  if (
    lower.includes("hemat") ||
    lower.includes("tips") ||
    lower.includes("saran") ||
    lower.includes("bocor") ||
    lower.includes("nabung") ||
    lower.includes("menabung") ||
    lower.includes("rekomendasi") ||
    lower.includes("kurangi pengeluaran")
  ) {
    // Ekstraksi target nominal jika ada (cth: "hemat 500rb")
    let targetNominal: number | undefined;
    const matchNominal = lower.match(/\d+(?:[.,]\d+)?\s*(?:rb|k|ribu|jt|juta)?/);
    if (matchNominal) {
      const numStr = matchNominal[0];
      const val = parseFloat(numStr.replace(/[^\d.,]/g, "").replace(",", "."));
      if (numStr.includes("rb") || numStr.includes("k") || numStr.includes("ribu")) {
        targetNominal = val * 1000;
      } else if (numStr.includes("jt") || numStr.includes("juta")) {
        targetNominal = val * 1000000;
      } else if (val >= 100) {
        targetNominal = val;
      }
    }

    return {
      intent: "saran_hemat",
      confidence: 94,
      entities: {
        nominal: targetNominal,
      },
    };
  }

  // 4. Tanya Sisa Budget / Anggaran
  if (
    lower.includes("budget") ||
    lower.includes("sisa") ||
    lower.includes("kuota") ||
    lower.includes("anggaran") ||
    lower.includes("pos jajan")
  ) {
    let subIntent: string | undefined;
    let kategoriKeyword: string | undefined;

    if (lower.includes("kopi") || lower.includes("coffee") || lower.includes("toast")) {
      subIntent = "kategori_kopi";
      kategoriKeyword = "Kopi & Jajan";
    } else if (lower.includes("makan") || lower.includes("minum") || lower.includes("resto")) {
      subIntent = "kategori_makan";
      kategoriKeyword = "Makan & Minum";
    } else if (lower.includes("belanja") || lower.includes("bulanan") || lower.includes("indomaret")) {
      subIntent = "kategori_belanja";
      kategoriKeyword = "Belanja Bulanan";
    } else if (lower.includes("transport") || lower.includes("bensin") || lower.includes("grab")) {
      subIntent = "kategori_transport";
      kategoriKeyword = "Transportasi";
    }

    return {
      intent: "tanya_budget",
      subIntent,
      kategoriKeyword,
      confidence: 92,
      entities: {
        kategori: kategoriKeyword,
      },
    };
  }

  // 5. Tanya Pengeluaran / Transaksi
  if (
    lower.includes("pengeluaran") ||
    lower.includes("jajan berapa") ||
    lower.includes("habis berapa") ||
    lower.includes("boros") ||
    lower.includes("belanja berapa")
  ) {
    let periode: "hari_ini" | "minggu_ini" | "bulan_ini" = "bulan_ini";
    if (lower.includes("hari ini")) {
      periode = "hari_ini";
    } else if (lower.includes("minggu ini")) {
      periode = "minggu_ini";
    }

    return {
      intent: "tanya_pengeluaran",
      confidence: 90,
      entities: {
        periode,
      },
    };
  }

  // 6. Tanya Saldo & Aset
  if (
    lower.includes("saldo") ||
    lower.includes("aset") ||
    lower.includes("uangku") ||
    lower.includes("kekayaan") ||
    lower.includes("rekening") ||
    lower.includes("tabungan")
  ) {
    return {
      intent: "tanya_aset",
      confidence: 88,
      entities: {},
    };
  }

  // 7. Percakapan Umum / Default
  return {
    intent: "umum",
    confidence: 60,
    entities: {},
  };
}

export const LevinaIntentService = {
  detectIntent: detectLevinaIntent,
};
