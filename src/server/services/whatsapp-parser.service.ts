import { serverStore } from "../db/store";
import { Category } from "@/types/finance";

export interface ParsedWhatsAppTransaction {
  isValidTransaction: boolean;
  intent: "transaksi" | "budget_query" | "help" | "unknown";
  tipe?: "pengeluaran" | "pemasukan";
  nominal?: number;
  deskripsi?: string;
  kategoriId?: string;
  kategoriNama?: string;
  kategoriIkon?: string;
  confidence: number;
  originalText: string;
}

/**
 * Normalisasi nominal numerik dari teks natural berbahasa Indonesia
 * Mendukung variasi:
 * - 25rb, 25k, 25ribu -> 25000
 * - 1.5jt, 1.5juta, 1,5 jt -> 1500000
 * - 35.000, 35,000 -> 35000
 * - Rp 50.000, Rp50rb -> 50000
 */
export function extractNominalFromText(text: string): {
  nominal: number | null;
  matchedString: string | null;
} {
  const lower = text.toLowerCase();

  // Pattern 1: Jutaan (1.5jt, 2juta, 3,5 jt)
  const jutaRegex = /(?:rp\.?\s*)?(\d+(?:[.,]\d+)?)\s*(?:jt|juta)\b/i;
  const jutaMatch = lower.match(jutaRegex);
  if (jutaMatch) {
    const rawVal = parseFloat(jutaMatch[1].replace(",", "."));
    return {
      nominal: Math.round(rawVal * 1_000_000),
      matchedString: jutaMatch[0],
    };
  }

  // Pattern 2: Ribuan (25rb, 50k, 100ribu)
  const ribuRegex = /(?:rp\.?\s*)?(\d+(?:[.,]\d+)?)\s*(?:rb|k|ribu)\b/i;
  const ribuMatch = lower.match(ribuRegex);
  if (ribuMatch) {
    const rawVal = parseFloat(ribuMatch[1].replace(",", "."));
    return {
      nominal: Math.round(rawVal * 1_000),
      matchedString: ribuMatch[0],
    };
  }

  // Pattern 3: Format Rupiah titik/koma ribuan: Rp 50.000 atau 50.000
  const currencyRegex = /(?:rp\.?\s*)?(\d{1,3}(?:[.,]\d{3})+)\b/i;
  const currencyMatch = lower.match(currencyRegex);
  if (currencyMatch) {
    const rawClean = currencyMatch[1].replace(/[.,]/g, "");
    const val = parseInt(rawClean, 10);
    if (!isNaN(val) && val > 0) {
      return {
        nominal: val,
        matchedString: currencyMatch[0],
      };
    }
  }

  // Pattern 4: Angka polos minimal 3 digit (cth: 25000, 150000)
  const plainNumRegex = /(?:rp\.?\s*)?(\b\d{3,9}\b)/i;
  const plainMatch = lower.match(plainNumRegex);
  if (plainMatch) {
    const val = parseInt(plainMatch[1], 10);
    if (!isNaN(val) && val >= 100) {
      return {
        nominal: val,
        matchedString: plainMatch[0],
      };
    }
  }

  return { nominal: null, matchedString: null };
}

/**
 * Deteksi tipe transaksi (pengeluaran atau pemasukan)
 */
export function detectTransactionType(text: string): "pengeluaran" | "pemasukan" {
  const lower = text.toLowerCase();

  const incomeKeywords = [
    "gaji",
    "salary",
    "terima",
    "diterima",
    "pemasukan",
    "nabung",
    "menabung",
    "bonus",
    "freelance",
    "proyek",
    "dividen",
    "cashback",
    "reimburse",
    "penjualan",
    "omset",
    "omzet",
    "cair",
  ];

  for (const kw of incomeKeywords) {
    if (lower.includes(kw)) {
      return "pemasukan";
    }
  }

  return "pengeluaran";
}

/**
 * Pemetaan kategori otomatis berdasarkan kata kunci deskripsi belanja
 */
export function matchCategoryFromText(
  text: string,
  tipe: "pengeluaran" | "pemasukan"
): { id: string; nama: string; ikon: string } {
  const lower = text.toLowerCase();
  const categories = serverStore.getCategories();

  if (tipe === "pemasukan") {
    if (lower.includes("freelance") || lower.includes("proyek") || lower.includes("side job")) {
      const cat = categories.find((c) => c.nama.toLowerCase().includes("freelance"));
      return {
        id: cat?.id || "cat-8",
        nama: cat?.nama || "Freelance & Side Project",
        ikon: cat?.ikon || "Briefcase",
      };
    }

    const cat = categories.find((c) => c.nama.toLowerCase().includes("gaji"));
    return {
      id: cat?.id || "cat-7",
      nama: cat?.nama || "Gaji Utama",
      ikon: cat?.ikon || "Wallet",
    };
  }

  // Tipe Pengeluaran
  if (
    lower.includes("kopi") ||
    lower.includes("coffee") ||
    lower.includes("toast") ||
    lower.includes("starbucks") ||
    lower.includes("janji jiwa") ||
    lower.includes("kenangan") ||
    lower.includes("boba") ||
    lower.includes("teh") ||
    lower.includes("snack") ||
    lower.includes("eskrim")
  ) {
    const cat = categories.find((c) => c.nama.toLowerCase().includes("kopi"));
    return {
      id: cat?.id || "cat-2",
      nama: cat?.nama || "Kopi & Jajan",
      ikon: cat?.ikon || "Coffee",
    };
  }

  if (
    lower.includes("bensin") ||
    lower.includes("pertamax") ||
    lower.includes("pertalite") ||
    lower.includes("solar") ||
    lower.includes("grab") ||
    lower.includes("gojek") ||
    lower.includes("ojol") ||
    lower.includes("parkir") ||
    lower.includes("tol") ||
    lower.includes("krl") ||
    lower.includes("mrt") ||
    lower.includes("taksi")
  ) {
    const cat = categories.find((c) => c.nama.toLowerCase().includes("transportasi"));
    return {
      id: cat?.id || "cat-3",
      nama: cat?.nama || "Transportasi",
      ikon: cat?.ikon || "Car",
    };
  }

  if (
    lower.includes("indomaret") ||
    lower.includes("alfamart") ||
    lower.includes("supermarket") ||
    lower.includes("sabun") ||
    lower.includes("shampo") ||
    lower.includes("deterjen") ||
    lower.includes("minyak") ||
    lower.includes("beras") ||
    lower.includes("belanja bulanan")
  ) {
    const cat = categories.find((c) => c.nama.toLowerCase().includes("belanja bulanan"));
    return {
      id: cat?.id || "cat-4",
      nama: cat?.nama || "Belanja Bulanan",
      ikon: cat?.ikon || "ShoppingBag",
    };
  }

  if (
    lower.includes("listrik") ||
    lower.includes("pln") ||
    lower.includes("pdam") ||
    lower.includes("air") ||
    lower.includes("wifi") ||
    lower.includes("indihome") ||
    lower.includes("pulsa") ||
    lower.includes("kuota") ||
    lower.includes("paket data") ||
    lower.includes("bpjs") ||
    lower.includes("kost") ||
    lower.includes("kontrakan")
  ) {
    const cat = categories.find((c) => c.nama.toLowerCase().includes("tagihan"));
    return {
      id: cat?.id || "cat-5",
      nama: cat?.nama || "Tagihan & Pulsa",
      ikon: cat?.ikon || "Zap",
    };
  }

  if (
    lower.includes("nonton") ||
    lower.includes("bioskop") ||
    lower.includes("xxi") ||
    lower.includes("game") ||
    lower.includes("steam") ||
    lower.includes("netflix") ||
    lower.includes("spotify")
  ) {
    const cat = categories.find((c) => c.nama.toLowerCase().includes("hiburan"));
    return {
      id: cat?.id || "cat-6",
      nama: cat?.nama || "Hiburan & Rekreasi",
      ikon: cat?.ikon || "Film",
    };
  }

  // Default makan & minum jika ada makanan / default
  const defaultMakan = categories.find((c) => c.nama.toLowerCase().includes("makan"));
  return {
    id: defaultMakan?.id || "cat-1",
    nama: defaultMakan?.nama || "Makan & Minum",
    ikon: defaultMakan?.ikon || "Utensils",
  };
}

/**
 * Bersihkan deskripsi belanja dari angka nominal dan stopwords
 */
export function cleanTransactionDescription(
  text: string,
  matchedNominalStr: string | null
): string {
  let cleaned = text;

  // Hapus bagian nominal yang cocok
  if (matchedNominalStr) {
    cleaned = cleaned.replace(matchedNominalStr, " ");
  }

  // Hapus kata sambung / stopwords yang umum
  cleaned = cleaned
    .replace(/\b(?:beli|bayar|jajan|buat|untuk|sebesar|seharga|catat|tambah)\b/gi, " ")
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return "Transaksi WhatsApp";
  }

  // Capitalize kata pertama
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Parser utama untuk pesan teks alami WhatsApp
 */
export function parseWhatsAppMessage(text: string): ParsedWhatsAppTransaction {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // 1. Cek intent non-transaksi: Cek budget
  if (
    lower.includes("sisa budget") ||
    lower.includes("cek budget") ||
    lower.includes("rekap") ||
    lower === "budget"
  ) {
    return {
      isValidTransaction: false,
      intent: "budget_query",
      confidence: 95,
      originalText: trimmed,
    };
  }

  // 2. Cek intent bantuan / sapaan
  if (
    lower === "halo" ||
    lower === "hai" ||
    lower === "menu" ||
    lower === "bantuan" ||
    lower === "help" ||
    lower === "p"
  ) {
    return {
      isValidTransaction: false,
      intent: "help",
      confidence: 99,
      originalText: trimmed,
    };
  }

  // 3. Ekstraksi nominal
  const { nominal, matchedString } = extractNominalFromText(trimmed);

  if (!nominal || nominal <= 0) {
    return {
      isValidTransaction: false,
      intent: "unknown",
      confidence: 20,
      originalText: trimmed,
    };
  }

  // 4. Deteksi tipe dan kategori
  const tipe = detectTransactionType(trimmed);
  const kategori = matchCategoryFromText(trimmed, tipe);
  const deskripsi = cleanTransactionDescription(trimmed, matchedString);

  return {
    isValidTransaction: true,
    intent: "transaksi",
    tipe,
    nominal,
    deskripsi,
    kategoriId: kategori.id,
    kategoriNama: kategori.nama,
    kategoriIkon: kategori.ikon,
    confidence: 90,
    originalText: trimmed,
  };
}
