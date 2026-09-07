import { ReceiptScanResult, ReceiptItem } from "@/types/receipt";
import { ReceiptScanRecord, SaveScannedReceiptInput } from "../schemas/receipt.schema";
import { TransactionRecord } from "../schemas/transaction.schema";
import { serverStore } from "../db/store";
import { allSeedCategories } from "../db/seeds/category.seed";
import { performOcrOnImage, parseReceiptText } from "@/lib/ocr-parser";

export interface ScanReceiptRequest {
  image?: string;
  sampleTitle?: string;
  filename?: string;
  mimeType?: string;
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
 * Service untuk memproses pemindaian foto struk (OCR & Parsing)
 */
export async function scanReceiptImage(request: ScanReceiptRequest): Promise<{
  scanResult: ReceiptScanResult;
  record: ReceiptScanRecord;
}> {
  const sampleKey = request.sampleTitle?.toLowerCase() || "";
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr =
    now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";

  // 1. Jika ada gambar nyata dan bukan preset demo, lakukan OCR nyata menggunakan Tesseract
  const isPresetSample =
    sampleKey.includes("kopi") ||
    sampleKey.includes("jiwa") ||
    sampleKey.includes("coffee") ||
    sampleKey.includes("indomaret") ||
    sampleKey.includes("mart") ||
    sampleKey.includes("resto") ||
    sampleKey.includes("padang");

  if (request.image && !isPresetSample) {
    try {
      const ocr = await performOcrOnImage(request.image);
      if (ocr.text && ocr.text.trim().length >= 3) {
        const parsed = parseReceiptText(ocr.text, {
          confidence: ocr.confidence,
          fotoUrl: request.image,
        });

        const record: ReceiptScanRecord = {
          id: parsed.id,
          fotoUrl: request.image,
          namaToko: parsed.namaToko,
          tanggal: parsed.tanggal,
          waktu: parsed.waktu,
          nomorStruk: parsed.nomorStruk,
          items: parsed.items,
          subtotal: parsed.subtotal,
          pajak: parsed.pajak,
          diskon: parsed.diskon,
          total: parsed.total,
          kategoriSaranId: parsed.kategoriSaranId,
          kategoriSaranNama: parsed.kategoriSaranNama,
          confidence: parsed.confidence,
          rawText: ocr.text,
          status: "draft",
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        };

        serverStore.saveReceiptScan(record);
        return { scanResult: parsed, record };
      }
    } catch (err) {
      console.warn("Ekstraksi OCR gagal, menggunakan fallback parser:", err);
    }

    // Jika OCR tidak menghasilkan teks yang jelas atau gagal, kembalikan draft kosong bersih
    // dengan foto pengguna agar pengguna dapat memverifikasi/mengisi nama toko dan nominal secara manual
    const scanId = `scan-${Date.now()}`;
    const cleanDraft: ReceiptScanResult = {
      id: scanId,
      namaToko: "",
      tanggal: dateStr,
      waktu: timeStr,
      nomorStruk: `TRX-${Math.floor(100000 + Math.random() * 900000)}`,
      items: [],
      subtotal: 0,
      pajak: 0,
      diskon: 0,
      total: 0,
      kategoriSaranId: "cat-1",
      kategoriSaranNama: "Makan & Minum",
      confidence: 60,
      fotoUrl: request.image,
    };

    const draftRecord: ReceiptScanRecord = {
      ...cleanDraft,
      status: "draft",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    serverStore.saveReceiptScan(draftRecord);
    return { scanResult: cleanDraft, record: draftRecord };
  }

  // 2. Preset contoh struk untuk demonstrasi cepat (hanya jika memang preset sample)
  let merchantName = "Toko Belanja";
  let items: ReceiptItem[] = [
    { id: "item-1", nama: "Belanja Toko", qty: 1, harga: 50000, subtotal: 50000 },
  ];
  let subtotal = 50000;
  let pajak = 0;
  let diskon = 0;
  let total = 50000;
  let confidence = 90;

  if (sampleKey.includes("kopi") || sampleKey.includes("jiwa") || sampleKey.includes("coffee")) {
    merchantName = "Kopi Janji Jiwa Jkt";
    items = [
      { id: "item-1", nama: "Kopi Susu Aren", qty: 1, harga: 20000, subtotal: 20000 },
      { id: "item-2", nama: "Toast Crunchy Choco", qty: 1, harga: 18000, subtotal: 18000 },
    ];
    subtotal = 38000;
    pajak = 0;
    diskon = 0;
    total = 38000;
    confidence = 98;
  } else if (sampleKey.includes("indomaret") || sampleKey.includes("mart")) {
    merchantName = "Indomaret Point St. Sudirman";
    items = [
      { id: "item-1", nama: "Susu UHT 1000ml Full Cream", qty: 1, harga: 21500, subtotal: 21500 },
      { id: "item-2", nama: "Roti Gandum Kupas", qty: 2, harga: 16000, subtotal: 32000 },
      { id: "item-3", nama: "Air Mineral 1.5L", qty: 1, harga: 7000, subtotal: 7000 },
      { id: "item-4", nama: "Snack Keripik Kentang 68g", qty: 1, harga: 15000, subtotal: 15000 },
    ];
    subtotal = 75500;
    pajak = 0;
    diskon = 0;
    total = 75500;
    confidence = 96;
  } else if (sampleKey.includes("resto") || sampleKey.includes("padang")) {
    merchantName = "Resto Padang Sederhana";
    items = [
      { id: "item-1", nama: "Nasi Rendang Daging", qty: 2, harga: 34000, subtotal: 68000 },
      { id: "item-2", nama: "Ayam Gulai Spesial", qty: 1, harga: 27000, subtotal: 27000 },
      { id: "item-3", nama: "Es Teh Manis Jumbo", qty: 2, harga: 8000, subtotal: 16000 },
      { id: "item-4", nama: "Kerupuk Kulit Kuah", qty: 2, harga: 7000, subtotal: 14000 },
    ];
    subtotal = 125000;
    pajak = 0;
    diskon = 0;
    total = 125000;
    confidence = 97;
  }

  // Pilih kategori otomatis berdasarkan nama merchant dan item
  const suggestedCategory = suggestCategoryForReceipt(merchantName, items);

  const scanId = `scan-${Date.now()}`;
  const receiptNumber = `TRX-${Math.floor(100000 + Math.random() * 900000)}`;

  const scanResult: ReceiptScanResult = {
    id: scanId,
    namaToko: merchantName,
    tanggal: dateStr,
    waktu: timeStr,
    nomorStruk: receiptNumber,
    items,
    subtotal,
    pajak,
    diskon,
    total,
    kategoriSaranId: suggestedCategory.id,
    kategoriSaranNama: suggestedCategory.nama,
    confidence,
    fotoUrl: request.image,
  };

  const record: ReceiptScanRecord = {
    id: scanId,
    fotoUrl: request.image,
    namaToko: merchantName,
    tanggal: dateStr,
    waktu: timeStr,
    nomorStruk: receiptNumber,
    items,
    subtotal,
    pajak,
    diskon,
    total,
    kategoriSaranId: suggestedCategory.id,
    kategoriSaranNama: suggestedCategory.nama,
    confidence,
    rawText: items.map((it) => `${it.qty}x ${it.nama} @${it.harga} = ${it.subtotal}`).join("\n"),
    status: "draft",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  // Simpan record scan ke in-memory database store
  serverStore.saveReceiptScan(record);

  return { scanResult, record };
}

/**
 * Menyimpan transaksi hasil pemindaian struk ke daftar transaksi dan memperbarui status struk
 */
export function saveScannedTransaction(input: SaveScannedReceiptInput): {
  transaction: TransactionRecord;
  scanRecord?: ReceiptScanRecord;
  isDuplicate?: boolean;
} {
  // 1. Cek idempotensi bila idempotencyKey dikirimkan via header/body
  if (input.idempotencyKey) {
    const cachedRecord = serverStore.getIdempotency(input.idempotencyKey);
    if (cachedRecord) {
      const existingTx = serverStore
        .getTransactions()
        .find((t) => t.id === cachedRecord.transactionId);
      if (existingTx) {
        const scanRec = input.strukId
          ? serverStore.getReceiptScanById(input.strukId)
          : undefined;
        return {
          transaction: existingTx,
          scanRecord: scanRec,
          isDuplicate: true,
        };
      }
    }

    const existingScan = serverStore.getReceiptScanByIdempotencyKey(input.idempotencyKey);
    if (existingScan && existingScan.transactionId) {
      const existingTx = serverStore
        .getTransactions()
        .find((t) => t.id === existingScan.transactionId);
      if (existingTx) {
        return {
          transaction: existingTx,
          scanRecord: existingScan,
          isDuplicate: true,
        };
      }
    }
  }

  // 2. Cek idempotensi bila strukId spesifik sudah berstatus 'saved'
  if (input.strukId) {
    const existingScan = serverStore.getReceiptScanById(input.strukId);
    if (existingScan && existingScan.status === "saved" && existingScan.transactionId) {
      const existingTx = serverStore
        .getTransactions()
        .find((t) => t.id === existingScan.transactionId);
      if (existingTx) {
        return {
          transaction: existingTx,
          scanRecord: existingScan,
          isDuplicate: true,
        };
      }
    }
  }

  const dateObj = new Date(input.tanggal);
  const validDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;

  const txId = `tx-scan-${Date.now()}`;
  const transaction: TransactionRecord = {
    id: txId,
    tipe: "pengeluaran",
    jumlah: input.total,
    tanggal: validDate.toISOString(),
    categoryId: input.categoryId,
    assetId: input.assetId,
    catatan:
      input.catatan ||
      (input.namaToko ? `Belanja di ${input.namaToko}` : "Pindai Struk"),
    label: ["Pindai Struk"],
    sumber: "pindai-struk",
    reimbursable: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Simpan transaksi dan otomatis mutasi saldo dompet & budget terpakai
  serverStore.addTransaction(transaction);

  if (input.idempotencyKey) {
    serverStore.setIdempotency(input.idempotencyKey, txId);
  }

  let scanRecord: ReceiptScanRecord | undefined;
  if (input.strukId) {
    const updated = serverStore.updateReceiptScan(input.strukId, {
      status: "saved",
      transactionId: txId,
      idempotencyKey: input.idempotencyKey,
    });
    if (updated) {
      scanRecord = updated;
    }
  }

  return { transaction, scanRecord, isDuplicate: false };
}

