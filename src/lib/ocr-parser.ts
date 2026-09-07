import { ReceiptScanResult, ReceiptItem } from "@/types/receipt";
import { allSeedCategories } from "@/server/db/seeds/category.seed";

/**
 * Membersihkan format angka uang (contoh: "18.000", "Rp 25,500", "34000") menjadi integer murni
 */
export function cleanPriceNumber(raw: string): number {
  if (!raw) return 0;
  // Hapus "Rp", spasi, dan karakter non-digit kecuali titik/koma
  const clean = raw.replace(/Rp\.?/gi, "").trim();
  const stripped = clean.replace(/[^0-9]/g, "");
  const num = parseInt(stripped, 10);
  return isNaN(num) ? 0 : num;
}

/**
 * Helper untuk normalisasi tanggal ke YYYY-MM-DD
 */
export function normalizeDate(dateStr: string): string {
  try {
    const today = new Date().toISOString().split("T")[0];
    if (!dateStr) return today;

    // Pattern: DD/MM/YYYY atau DD-MM-YYYY atau DD.MM.YYYY
    const dmyMatch = dateStr.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
    if (dmyMatch) {
      let day = parseInt(dmyMatch[1], 10);
      let month = parseInt(dmyMatch[2], 10);
      let year = parseInt(dmyMatch[3], 10);

      // Handle YY -> 20YY
      if (year < 100) year += 2000;

      // Swap jika terbalik (MM/DD/YYYY di mana month > 12)
      if (month > 12 && day <= 12) {
        const temp = day;
        day = month;
        month = temp;
      }

      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        const mm = String(month).padStart(2, "0");
        const dd = String(day).padStart(2, "0");
        return `${year}-${mm}-${dd}`;
      }
    }

    // Pattern teks: 12 Jan 2024 atau 12 Januari 2024
    const monthNames: Record<string, string> = {
      jan: "01", feb: "02", mar: "03", apr: "04", mei: "05", may: "05",
      jun: "06", jul: "07", agu: "08", ags: "08", aug: "08", sep: "09",
      okt: "10", oct: "10", nov: "11", des: "12", dec: "12"
    };

    const textDateMatch = dateStr.match(/(\d{1,2})\s+([a-zA-Z]{3,8})\s+(\d{2,4})/i);
    if (textDateMatch) {
      const day = String(parseInt(textDateMatch[1], 10)).padStart(2, "0");
      const monthKey = textDateMatch[2].substring(0, 3).toLowerCase();
      const month = monthNames[monthKey] || "01";
      let year = parseInt(textDateMatch[3], 10);
      if (year < 100) year += 2000;
      return `${year}-${month}-${day}`;
    }

    return today;
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

/**
 * Deteksi otomatis kategori pengeluaran terbaik berdasarkan nama toko dan daftar item
 */
export function suggestCategoryForReceipt(
  merchantName: string,
  items: ReceiptItem[] = []
): { id: string; nama: string } {
  const combinedText = [
    merchantName,
    ...items.map((it) => it.nama),
  ]
    .join(" ")
    .toLowerCase();

  // Kopi & Jajan
  if (
    combinedText.includes("kopi") ||
    combinedText.includes("coffee") ||
    combinedText.includes("cafe") ||
    combinedText.includes("toast") ||
    combinedText.includes("boba") ||
    combinedText.includes("jiwa") ||
    combinedText.includes("kulo") ||
    combinedText.includes("starbucks") ||
    combinedText.includes("fore") ||
    combinedText.includes("kenangan") ||
    combinedText.includes("snack") ||
    combinedText.includes("croissant")
  ) {
    const cat = allSeedCategories.find((c) => c.id === "cat-2");
    return { id: cat?.id || "cat-2", nama: cat?.nama || "Kopi & Jajan" };
  }

  // Belanja Bulanan / Supermarket
  if (
    combinedText.includes("indomaret") ||
    combinedText.includes("alfamart") ||
    combinedText.includes("superindo") ||
    combinedText.includes("hypermart") ||
    combinedText.includes("hero") ||
    combinedText.includes("lotte") ||
    combinedText.includes("ranch market") ||
    combinedText.includes("minimarket") ||
    combinedText.includes("sabun") ||
    combinedText.includes("minyak goreng") ||
    combinedText.includes("deterjen")
  ) {
    const cat = allSeedCategories.find((c) => c.id === "cat-4");
    return { id: cat?.id || "cat-4", nama: cat?.nama || "Belanja Bulanan" };
  }

  // Transportasi
  if (
    combinedText.includes("spbu") ||
    combinedText.includes("pertamina") ||
    combinedText.includes("shell") ||
    combinedText.includes("bp") ||
    combinedText.includes("bensin") ||
    combinedText.includes("pertalite") ||
    combinedText.includes("pertamax") ||
    combinedText.includes("parkir") ||
    combinedText.includes("toll") ||
    combinedText.includes("tol")
  ) {
    const cat = allSeedCategories.find((c) => c.id === "cat-3");
    return { id: cat?.id || "cat-3", nama: cat?.nama || "Transportasi" };
  }

  // Kesehatan & Medis
  if (
    combinedText.includes("apotek") ||
    combinedText.includes("kimia farma") ||
    combinedText.includes("guardian") ||
    combinedText.includes("century") ||
    combinedText.includes("obat") ||
    combinedText.includes("klinik") ||
    combinedText.includes("laboratorium")
  ) {
    const cat = allSeedCategories.find((c) => c.id === "cat-13");
    return { id: cat?.id || "cat-13", nama: cat?.nama || "Kesehatan & Medis" };
  }

  // Hiburan & Hobi
  if (
    combinedText.includes("xxi") ||
    combinedText.includes("cinema") ||
    combinedText.includes("cgv") ||
    combinedText.includes("game") ||
    combinedText.includes("steam") ||
    combinedText.includes("timezone")
  ) {
    const cat = allSeedCategories.find((c) => c.id === "cat-6");
    return { id: cat?.id || "cat-6", nama: cat?.nama || "Hiburan & Hobi" };
  }

  // Pendidikan & Buku
  if (
    combinedText.includes("gramedia") ||
    combinedText.includes("buku") ||
    combinedText.includes("stationery") ||
    combinedText.includes("kursus")
  ) {
    const cat = allSeedCategories.find((c) => c.id === "cat-15");
    return { id: cat?.id || "cat-15", nama: cat?.nama || "Pendidikan & Buku" };
  }

  // Tagihan & Pulsa
  if (
    combinedText.includes("pln") ||
    combinedText.includes("pdam") ||
    combinedText.includes("indihome") ||
    combinedText.includes("telkom") ||
    combinedText.includes("pulsa") ||
    combinedText.includes("paket data")
  ) {
    const cat = allSeedCategories.find((c) => c.id === "cat-5");
    return { id: cat?.id || "cat-5", nama: cat?.nama || "Tagihan & Pulsa" };
  }

  // Default: Makan & Minum
  const defaultCat = allSeedCategories.find((c) => c.id === "cat-1");
  return { id: defaultCat?.id || "cat-1", nama: defaultCat?.nama || "Makan & Minum" };
}

/**
 * Parser teks OCR struk belanja ke ReceiptScanResult terstruktur
 */
export function parseReceiptText(
  rawText: string,
  options?: {
    confidence?: number;
    fotoUrl?: string;
  }
): ReceiptScanResult {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const now = new Date();
  const defaultDate = now.toISOString().split("T")[0];
  const defaultTime =
    now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";

  let namaToko = "";
  let tanggal = defaultDate;
  let waktu = defaultTime;
  let nomorStruk = "";
  const items: ReceiptItem[] = [];
  let subtotal = 0;
  let pajak = 0;
  let diskon = 0;
  let total = 0;

  // 1. Ekstraksi Nama Toko (biasanya berada di 1-8 baris pertama)
  const ignoredStoreKeywords = [
    "selamat", "datang", "welcome", "terima", "kasih", "struk", "receipt",
    "invoice", "jl.", "jalan", "telp", "phone", "npwp", "pos", "pax",
    "kasir", "cashier", "order", "bill", "table", "meja", "lantai", "kassa",
    "no.", "tanggal", "date", "waktu", "time", "id", "merchant", "terminal"
  ];

  for (let i = 0; i < Math.min(lines.length, 8); i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    // Lewati baris yang terlalu pendek atau hanya simbol / angka
    if (line.replace(/[^a-zA-Z]/g, "").length < 3) continue;

    // Periksa apakah baris mengandung kata-kata yang bukan nama toko
    const hasIgnored = ignoredStoreKeywords.some((kw) => lower.startsWith(kw) || lower.includes(" " + kw));
    if (!hasIgnored) {
      // Bersihkan karakter simbol di awal/akhir
      const cleaned = line.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "").trim();
      if (cleaned.length >= 3) {
        namaToko = cleaned;
        break;
      }
    }
  }

  // Fallback toko jika belum dapat
  if (!namaToko) {
    const fullTextLower = rawText.toLowerCase();
    if (fullTextLower.includes("indomaret")) namaToko = "Indomaret";
    else if (fullTextLower.includes("alfamart")) namaToko = "Alfamart";
    else if (fullTextLower.includes("superindo")) namaToko = "Superindo";
    else if (fullTextLower.includes("janji jiwa")) namaToko = "Kopi Janji Jiwa";
    else if (fullTextLower.includes("starbucks")) namaToko = "Starbucks Coffee";
    else if (fullTextLower.includes("kopi kenangan")) namaToko = "Kopi Kenangan";
    else if (fullTextLower.includes("mcdonald")) namaToko = "McDonald's";
    else if (fullTextLower.includes("kfc")) namaToko = "KFC";
    else if (fullTextLower.includes("solaria")) namaToko = "Solaria";
    else if (fullTextLower.includes("point coffee")) namaToko = "Point Coffee";
    else if (lines.length > 0) namaToko = lines[0].replace(/[^a-zA-Z0-9\s]/g, "").trim() || "Toko Belanja";
    else namaToko = "Toko Belanja";
  }

  // 2. Ekstraksi Tanggal & Waktu & Nomor Struk
  for (const line of lines) {
    // Cari tanggal
    const dateMatch = line.match(
      /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})|(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|Mei|May|Jun|Jul|Agu|Ags|Aug|Sep|Okt|Oct|Nov|Des|Dec)[a-z]*\s+\d{2,4})/i
    );
    if (dateMatch && tanggal === defaultDate) {
      tanggal = normalizeDate(dateMatch[0]);
    }

    // Cari jam/waktu
    const timeMatch = line.match(/(\d{1,2}[:\.]\d{2}(?:[:\.]\d{2})?)\s*(wib|wita|wit|am|pm)?/i);
    if (timeMatch && waktu === defaultTime) {
      waktu = timeMatch[0].toUpperCase();
      if (!waktu.includes("WIB") && !waktu.includes("WITA") && !waktu.includes("WIT")) {
        waktu += " WIB";
      }
    }

    // Cari nomor struk
    const receiptNoMatch = line.match(
      /(?:no|inv|trx|bill|order|receipt|ref|resi)[\s\:\.\#\-]+([A-Za-z0-9\-\/]{4,25})/i
    );
    if (receiptNoMatch && !nomorStruk) {
      nomorStruk = receiptNoMatch[1].trim();
    }
  }

  if (!nomorStruk) {
    nomorStruk = `TRX-${Math.floor(100000 + Math.random() * 900000)}`;
  }

  // 3. Kata kunci batas akhir item / ringkasan pembayaran
  const summaryKeywords = [
    "total", "subtotal", "sub total", "grand total", "jumlah", "bayar",
    "tunai", "cash", "kembali", "change", "debit", "qris", "pajak", "ppn",
    "tax", "pb1", "diskon", "discount", "potongan", "hemat", "kartu", "bca",
    "mandiri", "bni", "bri", "ovo", "gopay", "shopeepay", "dana"
  ];

  const priceRegex = /(?:Rp\.?\s*)?(\d{1,3}(?:[\.,]\d{3})+(?:[\.,]\d{2})?|\d{4,7})/i;

  // 4. Ekstraksi Total, Subtotal, Pajak, Diskon dari baris ringkasan
  for (const line of lines) {
    const lower = line.toLowerCase();

    // Grand Total / Total Akhir / Total
    if (
      (lower.includes("total") || lower.includes("tagihan") || lower.includes("bayar")) &&
      !lower.includes("sub") &&
      !lower.includes("item") &&
      !lower.includes("diskon")
    ) {
      const match = line.match(priceRegex);
      if (match) {
        const val = cleanPriceNumber(match[0]);
        if (val > total && val < 50000000) {
          total = val;
        }
      }
    }

    // Subtotal
    if (lower.includes("subtotal") || lower.includes("sub total")) {
      const match = line.match(priceRegex);
      if (match) {
        const val = cleanPriceNumber(match[0]);
        if (val > 0 && val < 50000000) {
          subtotal = val;
        }
      }
    }

    // Pajak
    if (lower.includes("ppn") || lower.includes("pajak") || lower.includes("tax") || lower.includes("pb1")) {
      const match = line.match(priceRegex);
      if (match) {
        const val = cleanPriceNumber(match[0]);
        if (val > 0 && val < 10000000) {
          pajak = val;
        }
      }
    }

    // Diskon
    if (lower.includes("diskon") || lower.includes("discount") || lower.includes("potongan") || lower.includes("hemat")) {
      const match = line.match(priceRegex);
      if (match) {
        const val = cleanPriceNumber(match[0]);
        if (val > 0 && val < 10000000) {
          diskon = val;
        }
      }
    }
  }

  // 5. Ekstraksi Item Barang
  let itemIdCounter = 1;
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const lower = line.toLowerCase();

    // Lewati baris toko, alamat, tanggal, nomor struk
    if (idx < 2 && line.includes(namaToko)) continue;
    if (line.includes(tanggal)) continue;
    const isDateOrTimeLine =
      /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})|(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})|\b(wib|wita|wit)\b/i.test(line);
    if (isDateOrTimeLine) continue;

    // Lewati jika ini baris ringkasan (Total, Subtotal, Bayar, dsb)
    const isSummaryLine = summaryKeywords.some((kw) => {
      const wordBound = new RegExp(`\\b${kw}\\b`, "i");
      return wordBound.test(lower);
    });

    if (isSummaryLine) continue;

    // Cek apakah ada harga di baris ini
    const priceMatches = Array.from(line.matchAll(/(?:Rp\.?\s*)?(\d{1,3}(?:[\.,]\d{3})+(?:[\.,]\d{2})?|\d{4,7})/gi));

    if (priceMatches.length > 0) {
      const lastPriceMatch = priceMatches[priceMatches.length - 1];
      const itemSubtotal = cleanPriceNumber(lastPriceMatch[0]);

      const namePart = line.substring(0, lastPriceMatch.index).trim();
      const cleanedName = namePart
        .replace(/^[\d\.\-\*\#\s]+/, "")
        .replace(/[\d\s]+[xX@]\s*[\d\.,]+.*$/, "")
        .trim();

      // Pastikan nama barang memiliki setidaknya 2 karakter huruf
      if (cleanedName.replace(/[^a-zA-Z]/g, "").length < 2) continue;

      let qty = 1;
      let unitPrice = itemSubtotal;

      const qtyMatch = line.match(/(\d+)\s*[xX@]\s*(?:Rp\.?\s*)?([\d\.,]+)/i);
      if (qtyMatch) {
        qty = parseInt(qtyMatch[1], 10) || 1;
        unitPrice = cleanPriceNumber(qtyMatch[2]) || Math.round(itemSubtotal / qty);
      } else if (priceMatches.length >= 2) {
        const firstPriceVal = cleanPriceNumber(priceMatches[0][0]);
        if (firstPriceVal > 0 && firstPriceVal <= itemSubtotal) {
          unitPrice = firstPriceVal;
          qty = Math.max(1, Math.round(itemSubtotal / unitPrice));
        }
      }

      if (cleanedName.length >= 2 && itemSubtotal >= 500 && itemSubtotal <= 10000000) {
        items.push({
          id: `item-${itemIdCounter++}`,
          nama: cleanedName,
          qty,
          harga: unitPrice || itemSubtotal,
          subtotal: itemSubtotal,
        });
      }
    } else {
      // Pola B: Dua baris
      if (idx + 1 < lines.length) {
        const nextLine = lines[idx + 1];
        const nextLower = nextLine.toLowerCase();
        const nextIsSummary = summaryKeywords.some((kw) => {
          const wordBound = new RegExp(`\\b${kw}\\b`, "i");
          return wordBound.test(nextLower);
        });

        if (!nextIsSummary) {
          const nextPriceMatches = Array.from(nextLine.matchAll(/(?:Rp\.?\s*)?(\d{1,3}(?:[\.,]\d{3})+(?:[\.,]\d{2})?|\d{4,7})/gi));
          if (nextPriceMatches.length > 0) {
            const lastMatch = nextPriceMatches[nextPriceMatches.length - 1];
            const itemSubtotal = cleanPriceNumber(lastMatch[0]);

            let qty = 1;
            let unitPrice = itemSubtotal;
            const qtyMatch = nextLine.match(/(\d+)\s*(?:pcs|x|@)\s*(?:Rp\.?\s*)?([\d\.,]+)/i);
            if (qtyMatch) {
              qty = parseInt(qtyMatch[1], 10) || 1;
              unitPrice = cleanPriceNumber(qtyMatch[2]) || Math.round(itemSubtotal / qty);
            }

            const cleanedName = line.replace(/^[\d\.\-\*\#\s]+/, "").trim();
            if (cleanedName.length >= 2 && itemSubtotal >= 500 && itemSubtotal <= 10000000) {
              items.push({
                id: `item-${itemIdCounter++}`,
                nama: cleanedName,
                qty,
                harga: unitPrice || itemSubtotal,
                subtotal: itemSubtotal,
              });
              idx++;
            }
          }
        }
      }
    }
  }

  // 6. Hitung Total & Subtotal
  const sumItems = items.reduce((acc, it) => acc + it.subtotal, 0);

  if (total === 0) {
    if (sumItems > 0) {
      total = sumItems + pajak - diskon;
    } else {
      const allPrices: number[] = [];
      for (const line of lines) {
        const matches = Array.from(line.matchAll(priceRegex));
        for (const m of matches) {
          const num = cleanPriceNumber(m[0]);
          if (num >= 1000 && num <= 50000000) {
            allPrices.push(num);
          }
        }
      }
      total = allPrices.length > 0 ? Math.max(...allPrices) : 0;
    }
  }

  if (subtotal === 0) {
    subtotal = sumItems > 0 ? sumItems : total;
  }

  // Jika tidak ada item yang terurai tapi ada total, buat 1 item ringkasan
  if (items.length === 0 && total > 0) {
    items.push({
      id: "item-1",
      nama: namaToko ? `Belanja ${namaToko}` : "Item Belanja",
      qty: 1,
      harga: total,
      subtotal: total,
    });
  }

  const calculatedConfidence = options?.confidence
    ? Math.min(99, Math.max(70, Math.round(options.confidence)))
    : items.length > 1 ? 95 : 85;

  const suggestedCategory = suggestCategoryForReceipt(namaToko, items);

  return {
    id: `scan-${Date.now()}`,
    namaToko,
    tanggal,
    waktu,
    nomorStruk,
    items,
    subtotal,
    pajak,
    diskon,
    total,
    kategoriSaranId: suggestedCategory.id,
    kategoriSaranNama: suggestedCategory.nama,
    confidence: calculatedConfidence,
    fotoUrl: options?.fotoUrl,
    rawOcrText: rawText,
  };
}

let ocrWorkerPromise: Promise<any> | null = null;

async function getSharedWorker() {
  if (!ocrWorkerPromise) {
    ocrWorkerPromise = (async () => {
      const { createWorker } = await import("tesseract.js");
      const path = await import("path");
      const workerPath = path.resolve(
        process.cwd(),
        "node_modules/tesseract.js/src/worker-script/node/index.js"
      );
      const cachePath = process.env.VERCEL
        ? "/tmp"
        : path.resolve(process.cwd(), ".tessdata");
      const worker = await createWorker("eng", 1, {
        workerPath,
        cachePath,
      });
      return worker;
    })();
  }
  return ocrWorkerPromise;
}

/**
 * Ekstraksi OCR gambar menggunakan Tesseract.js di Node.js / Server
 */
export async function performOcrOnImage(
  imageSource: string | Buffer
): Promise<{ text: string; confidence: number }> {
  try {
    let input: string | Buffer = imageSource;
    if (typeof imageSource === "string" && imageSource.startsWith("data:")) {
      const base64Data = imageSource.split(",")[1];
      if (base64Data) {
        input = Buffer.from(base64Data, "base64");
      }
    }

    const worker = await getSharedWorker();
    const ret = await worker.recognize(input);

    return {
      text: ret.data.text || "",
      confidence: ret.data.confidence || 90,
    };
  } catch (error) {
    console.error("Gagal melakukan OCR Tesseract:", error);
    // Reset worker promise jika terjadi crash agar bisa retry
    ocrWorkerPromise = null;
    return {
      text: "",
      confidence: 70,
    };
  }
}
