export interface ReceiptItem {
  id: string;
  nama: string;
  qty: number;
  harga: number;
  subtotal: number;
}

export interface ReceiptScanResult {
  id: string;
  namaToko: string;
  tanggal: string;
  waktu?: string;
  nomorStruk?: string;
  items: ReceiptItem[];
  subtotal: number;
  pajak: number;
  diskon: number;
  total: number;
  kategoriSaranId: string;
  kategoriSaranNama: string;
  confidence: number; // 0 - 100
  fotoUrl?: string;
  rawOcrText?: string;
}
