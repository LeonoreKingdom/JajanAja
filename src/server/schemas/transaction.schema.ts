import {
  TransactionType,
  TransactionSource,
  AssetType,
  Category,
  Asset,
} from "@/types/finance";

export interface TransactionRecord {
  id: string;
  tipe: TransactionType;
  jumlah: number;
  tanggal: string; // ISO 8601
  categoryId: string;
  assetId: string;
  catatan?: string;
  merchant?: string;
  label?: string[];
  sumber: TransactionSource;
  reimbursable?: boolean;
  photoUrl?: string;
  receiptScanId?: string;
  splitBillId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionDTO {
  tipe: TransactionType;
  jumlah: number;
  tanggal?: string;
  categoryId: string;
  assetId: string;
  catatan?: string;
  merchant?: string;
  label?: string[] | string;
  sumber?: TransactionSource;
  reimbursable?: boolean;
  photoUrl?: string;
}

export interface UpdateTransactionDTO {
  jumlah?: number;
  tanggal?: string;
  categoryId?: string;
  assetId?: string;
  catatan?: string;
  merchant?: string;
  label?: string[] | string;
  reimbursable?: boolean;
}

export interface TransactionValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors?: Record<string, string>;
}

/**
 * Validasi pembuatan transaksi baru (pemasukan atau pengeluaran)
 */
export function validateCreateTransaction(
  payload: unknown
): TransactionValidationResult<CreateTransactionDTO> {
  const errors: Record<string, string> = {};

  if (!payload || typeof payload !== "object") {
    return {
      isValid: false,
      errors: { root: "Payload transaksi harus berupa object yang valid." },
    };
  }

  const raw = payload as Record<string, unknown>;

  // 1. Validasi Tipe
  if (!raw.tipe || (raw.tipe !== "pengeluaran" && raw.tipe !== "pemasukan")) {
    errors.tipe = "Tipe transaksi harus bernilai 'pengeluaran' atau 'pemasukan'.";
  }

  // 2. Validasi Jumlah
  const jumlah = typeof raw.jumlah === "number" ? raw.jumlah : Number(raw.jumlah);
  if (isNaN(jumlah) || !Number.isFinite(jumlah) || jumlah < 500) {
    errors.jumlah = "Nominal transaksi wajib angka positif minimal Rp 500.";
  }

  // 3. Validasi Kategori
  if (!raw.categoryId || typeof raw.categoryId !== "string" || !raw.categoryId.trim()) {
    errors.categoryId = "Kategori transaksi wajib diisi.";
  }

  // 4. Validasi Aset
  if (!raw.assetId || typeof raw.assetId !== "string" || !raw.assetId.trim()) {
    errors.assetId = "Aset sumber/tujuan transaksi wajib diisi.";
  }

  // 5. Validasi Tanggal (jika ada)
  let tanggal = new Date().toISOString();
  if (raw.tanggal) {
    if (typeof raw.tanggal !== "string" || isNaN(Date.parse(raw.tanggal))) {
      errors.tanggal = "Format tanggal tidak valid, gunakan format ISO atau YYYY-MM-DD.";
    } else {
      tanggal = new Date(raw.tanggal).toISOString();
    }
  }

  // 6. Validasi Sumber
  const validSources: TransactionSource[] = ["manual", "pindai-struk", "whatsapp"];
  const sumber: TransactionSource =
    raw.sumber && validSources.includes(raw.sumber as TransactionSource)
      ? (raw.sumber as TransactionSource)
      : "manual";

  // 7. Format label / tags
  let label: string[] = [];
  if (Array.isArray(raw.label)) {
    label = raw.label.filter((l): l is string => typeof l === "string" && Boolean(l.trim()));
  } else if (typeof raw.label === "string" && raw.label.trim()) {
    label = raw.label.split(",").map((l) => l.trim()).filter(Boolean);
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    data: {
      tipe: raw.tipe as TransactionType,
      jumlah,
      tanggal,
      categoryId: (raw.categoryId as string).trim(),
      assetId: (raw.assetId as string).trim(),
      catatan: typeof raw.catatan === "string" ? raw.catatan.trim() : undefined,
      merchant: typeof raw.merchant === "string" ? raw.merchant.trim() : undefined,
      label,
      sumber,
      reimbursable: Boolean(raw.reimbursable),
      photoUrl: typeof raw.photoUrl === "string" ? raw.photoUrl.trim() : undefined,
    },
  };
}

/**
 * Filter query untuk pencarian & filtering data transaksi
 */
export interface TransactionFilterQuery {
  tipe?: TransactionType | "semua";
  sumber?: TransactionSource | "semua";
  categoryId?: string;
  assetId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;
  offset?: number;
}
