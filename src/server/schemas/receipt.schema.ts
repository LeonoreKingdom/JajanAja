import { ReceiptItem, ReceiptScanResult } from "@/types/receipt";

export type ReceiptScanStatus = "draft" | "verified" | "saved" | "cancelled";

export interface ReceiptItemRecord extends ReceiptItem {
  strukId: string;
  createdAt: string;
}

export interface ReceiptScanRecord {
  id: string;
  fotoUrl?: string;
  namaToko: string;
  tanggal: string;
  waktu?: string;
  nomorStruk?: string;
  items: ReceiptItem[];
  subtotal: number;
  pajak: number;
  diskon: number;
  total: number;
  kategoriSaranId?: string;
  kategoriSaranNama?: string;
  confidence: number;
  rawText?: string;
  status: ReceiptScanStatus;
  transactionId?: string;
  idempotencyKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaveScannedReceiptInput {
  strukId?: string;
  namaToko: string;
  tanggal: string;
  total: number;
  subtotal?: number;
  pajak?: number;
  diskon?: number;
  categoryId: string;
  assetId: string;
  catatan?: string;
  items?: ReceiptItem[];
  idempotencyKey?: string;
}

/**
 * Validasi payload untuk menyimpan hasil pindai struk menjadi transaksi keuangan
 */
export function validateSaveScannedReceipt(input: unknown): {
  valid: boolean;
  errors: string[];
  data?: SaveScannedReceiptInput;
} {
  const errors: string[] = [];

  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Data payload transaksi struk tidak valid."] };
  }

  const raw = input as Record<string, unknown>;

  if (!raw.namaToko || typeof raw.namaToko !== "string" || !raw.namaToko.trim()) {
    errors.push("Nama toko / merchant wajib diisi.");
  }

  if (!raw.tanggal || typeof raw.tanggal !== "string" || !raw.tanggal.trim()) {
    errors.push("Tanggal struk wajib diisi.");
  }

  const total = Number(raw.total);
  if (isNaN(total) || total <= 0) {
    errors.push("Total nominal belanja harus berupa angka lebih dari 0.");
  }

  if (!raw.categoryId || typeof raw.categoryId !== "string") {
    errors.push("Kategori pengeluaran wajib dipilih.");
  }

  if (!raw.assetId || typeof raw.assetId !== "string") {
    errors.push("Metode pembayaran / akun aset sumber dana wajib dipilih.");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      strukId: typeof raw.strukId === "string" ? raw.strukId : undefined,
      namaToko: (raw.namaToko as string).trim(),
      tanggal: (raw.tanggal as string).trim(),
      total,
      subtotal: typeof raw.subtotal === "number" ? raw.subtotal : total,
      pajak: typeof raw.pajak === "number" ? raw.pajak : 0,
      diskon: typeof raw.diskon === "number" ? raw.diskon : 0,
      categoryId: (raw.categoryId as string).trim(),
      assetId: (raw.assetId as string).trim(),
      catatan: typeof raw.catatan === "string" ? raw.catatan.trim() : undefined,
      items: Array.isArray(raw.items) ? (raw.items as ReceiptItem[]) : [],
      idempotencyKey:
        typeof raw.idempotencyKey === "string" ? raw.idempotencyKey.trim() : undefined,
    },
  };
}

/**
 * Validasi payload pembuatan rekaman hasil scan
 */
export function validateCreateScanRecord(input: unknown): {
  valid: boolean;
  errors: string[];
  data?: Partial<ReceiptScanRecord>;
} {
  const errors: string[] = [];

  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Data hasil pindai tidak valid."] };
  }

  const raw = input as Record<string, unknown>;

  if (!raw.namaToko || typeof raw.namaToko !== "string") {
    errors.push("Nama toko wajib disertakan.");
  }

  const total = Number(raw.total);
  if (isNaN(total) || total < 0) {
    errors.push("Total belanja tidak valid.");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: raw as Partial<ReceiptScanRecord>,
  };
}
