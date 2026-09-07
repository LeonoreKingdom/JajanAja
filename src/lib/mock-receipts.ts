import { ReceiptScanResult } from "@/types/receipt";

export const defaultMockReceiptResults: Record<string, ReceiptScanResult> = {
  "sample-coffee": {
    id: "scan-cf-01",
    namaToko: "Kopi Janji Jiwa Jkt",
    tanggal: new Date().toISOString().split("T")[0],
    waktu: "14:32 WIB",
    nomorStruk: "INV-JJ-88219",
    items: [
      { id: "item-1", nama: "Kopi Susu Aren", qty: 1, harga: 20000, subtotal: 20000 },
      { id: "item-2", nama: "Toast Crunchy Choco", qty: 1, harga: 18000, subtotal: 18000 },
    ],
    subtotal: 38000,
    pajak: 0,
    diskon: 0,
    total: 38000,
    kategoriSaranId: "cat-2", // Kopi & Jajan
    kategoriSaranNama: "Kopi & Jajan",
    confidence: 98,
  },
  "sample-mart": {
    id: "scan-mt-02",
    namaToko: "Indomaret Point St. Sudirman",
    tanggal: new Date().toISOString().split("T")[0],
    waktu: "19:15 WIB",
    nomorStruk: "POS-IDM-99120",
    items: [
      { id: "item-1", nama: "Susu UHT 1000ml Full Cream", qty: 1, harga: 21500, subtotal: 21500 },
      { id: "item-2", nama: "Roti Gandum Kupas", qty: 2, harga: 16000, subtotal: 32000 },
      { id: "item-3", nama: "Air Mineral 1.5L", qty: 1, harga: 7000, subtotal: 7000 },
      { id: "item-4", nama: "Snack Keripik Kentang 68g", qty: 1, harga: 15000, subtotal: 15000 },
    ],
    subtotal: 75500,
    pajak: 0,
    diskon: 0,
    total: 75500,
    kategoriSaranId: "cat-4", // Belanja Bulanan
    kategoriSaranNama: "Belanja Bulanan",
    confidence: 96,
  },
  "sample-resto": {
    id: "scan-rs-03",
    namaToko: "Resto Padang Sederhana",
    tanggal: new Date().toISOString().split("T")[0],
    waktu: "12:45 WIB",
    nomorStruk: "TB-RM-3341",
    items: [
      { id: "item-1", nama: "Nasi Rendang Daging", qty: 2, harga: 34000, subtotal: 68000 },
      { id: "item-2", nama: "Ayam Gulai Spesial", qty: 1, harga: 27000, subtotal: 27000 },
      { id: "item-3", nama: "Es Teh Manis Jumbo", qty: 2, harga: 8000, subtotal: 16000 },
      { id: "item-4", nama: "Kerupuk Kulit Kuah", qty: 2, harga: 7000, subtotal: 14000 },
    ],
    subtotal: 125000,
    pajak: 0,
    diskon: 0,
    total: 125000,
    kategoriSaranId: "cat-1", // Makan & Minum
    kategoriSaranNama: "Makan & Minum",
    confidence: 97,
  },
};

export function getMockReceiptResult(sampleTitle?: string, imageDataUrl?: string): ReceiptScanResult {
  if (sampleTitle?.toLowerCase().includes("kopi")) {
    return { ...defaultMockReceiptResults["sample-coffee"], fotoUrl: imageDataUrl };
  }
  if (sampleTitle?.toLowerCase().includes("indomaret")) {
    return { ...defaultMockReceiptResults["sample-mart"], fotoUrl: imageDataUrl };
  }
  if (sampleTitle?.toLowerCase().includes("resto") || sampleTitle?.toLowerCase().includes("padang")) {
    return { ...defaultMockReceiptResults["sample-resto"], fotoUrl: imageDataUrl };
  }

  // Fallback jika pemindaian OCR offline
  return {
    id: `scan-gen-${Date.now()}`,
    namaToko: "Struk Belanja Baru",
    tanggal: new Date().toISOString().split("T")[0],
    waktu: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
    nomorStruk: `TRX-${Math.floor(100000 + Math.random() * 900000)}`,
    items: [
      { id: "item-1", nama: "Total Belanja Struk", qty: 1, harga: 50000, subtotal: 50000 },
    ],
    subtotal: 50000,
    pajak: 0,
    diskon: 0,
    total: 50000,
    kategoriSaranId: "cat-1",
    kategoriSaranNama: "Makan & Minum",
    confidence: 85,
    fotoUrl: imageDataUrl,
  };
}
