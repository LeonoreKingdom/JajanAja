import { Category } from "@/types/finance";

export interface BudgetRecord {
  id: string;
  categoryId: string;
  periodeBulan: string; // Format YYYY-MM
  batasJumlah: number;
  terpakai: number;
  warna?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetWithCategory extends BudgetRecord {
  kategori: Category;
  sisa: number;
  persentase: number;
  status: "aman" | "waspada" | "kritis" | "habis";
}

export interface CreateBudgetInput {
  categoryId: string;
  periodeBulan: string;
  batasJumlah: number;
  warna?: string;
}

export interface UpdateBudgetInput {
  batasJumlah?: number;
  warna?: string;
}

export function validateCreateBudget(input: unknown): {
  valid: boolean;
  errors: string[];
  data?: CreateBudgetInput;
} {
  const errors: string[] = [];

  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Data input budget tidak valid."] };
  }

  const raw = input as Record<string, unknown>;

  if (!raw.categoryId || typeof raw.categoryId !== "string" || !raw.categoryId.trim()) {
    errors.push("ID kategori wajib diisi.");
  }

  if (
    !raw.periodeBulan ||
    typeof raw.periodeBulan !== "string" ||
    !/^\d{4}-(0[1-9]|1[0-2])$/.test(raw.periodeBulan)
  ) {
    errors.push("Periode bulan tidak valid. Gunakan format YYYY-MM (misal: 2026-09).");
  }

  const batas = Number(raw.batasJumlah);
  if (isNaN(batas) || batas <= 0) {
    errors.push("Batas budget harus berupa angka lebih besar dari Rp 0.");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      categoryId: (raw.categoryId as string).trim(),
      periodeBulan: raw.periodeBulan as string,
      batasJumlah: batas,
      warna: typeof raw.warna === "string" ? raw.warna : undefined,
    },
  };
}

export function validateUpdateBudget(input: unknown): {
  valid: boolean;
  errors: string[];
  data?: UpdateBudgetInput;
} {
  const errors: string[] = [];

  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Data input update tidak valid."] };
  }

  const raw = input as Record<string, unknown>;
  const data: UpdateBudgetInput = {};

  if (raw.batasJumlah !== undefined) {
    const batas = Number(raw.batasJumlah);
    if (isNaN(batas) || batas < 0) {
      errors.push("Batas budget tidak boleh bernilai negatif.");
    } else {
      data.batasJumlah = batas;
    }
  }

  if (raw.warna !== undefined && typeof raw.warna === "string") {
    data.warna = raw.warna;
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data,
  };
}
