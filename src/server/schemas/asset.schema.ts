import { AssetType } from "@/types/finance";

export interface AssetRecord {
  id: string;
  nama: string;
  jenis: AssetType;
  saldo: number;
  nomorRekening?: string;
  warna?: string;
  ikon?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt: string;
}

export interface CreateAssetInput {
  nama: string;
  jenis: AssetType;
  saldo: number;
  nomorRekening?: string;
  warna?: string;
  ikon?: string;
}

export interface UpdateAssetInput {
  nama?: string;
  jenis?: AssetType;
  saldo?: number;
  nomorRekening?: string;
  warna?: string;
  ikon?: string;
}

export interface UpdateAssetBalanceInput {
  saldo: number;
  catatPenyesuaian?: boolean;
}

const validAssetTypes: AssetType[] = ["bank", "e-wallet", "tunai"];

export function validateCreateAsset(input: unknown): {
  valid: boolean;
  errors: string[];
  data?: CreateAssetInput;
} {
  const errors: string[] = [];

  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Data input akun aset tidak valid."] };
  }

  const raw = input as Record<string, unknown>;

  if (!raw.nama || typeof raw.nama !== "string" || !raw.nama.trim()) {
    errors.push("Nama dompet / rekening wajib diisi.");
  }

  if (
    !raw.jenis ||
    typeof raw.jenis !== "string" ||
    !validAssetTypes.includes(raw.jenis as AssetType)
  ) {
    errors.push("Jenis aset tidak valid. Pilihan: 'bank', 'e-wallet', atau 'tunai'.");
  }

  const saldo = Number(raw.saldo);
  if (isNaN(saldo) || saldo < 0) {
    errors.push("Saldo awal aset harus berupa angka dan tidak boleh bernilai negatif.");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      nama: (raw.nama as string).trim(),
      jenis: raw.jenis as AssetType,
      saldo: saldo,
      nomorRekening:
        typeof raw.nomorRekening === "string" ? raw.nomorRekening.trim() : undefined,
      warna: typeof raw.warna === "string" ? raw.warna : undefined,
      ikon: typeof raw.ikon === "string" ? raw.ikon : undefined,
    },
  };
}

export function validateUpdateAsset(input: unknown): {
  valid: boolean;
  errors: string[];
  data?: UpdateAssetInput;
} {
  const errors: string[] = [];

  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Data input pembaruan tidak valid."] };
  }

  const raw = input as Record<string, unknown>;
  const data: UpdateAssetInput = {};

  if (raw.nama !== undefined) {
    if (typeof raw.nama !== "string" || !raw.nama.trim()) {
      errors.push("Nama aset tidak boleh kosong.");
    } else {
      data.nama = raw.nama.trim();
    }
  }

  if (raw.jenis !== undefined) {
    if (
      typeof raw.jenis !== "string" ||
      !validAssetTypes.includes(raw.jenis as AssetType)
    ) {
      errors.push("Jenis aset tidak valid. Pilihan: 'bank', 'e-wallet', atau 'tunai'.");
    } else {
      data.jenis = raw.jenis as AssetType;
    }
  }

  if (raw.saldo !== undefined) {
    const saldo = Number(raw.saldo);
    if (isNaN(saldo) || saldo < 0) {
      errors.push("Saldo aset tidak boleh bernilai negatif.");
    } else {
      data.saldo = saldo;
    }
  }

  if (raw.nomorRekening !== undefined) {
    data.nomorRekening =
      typeof raw.nomorRekening === "string" ? raw.nomorRekening.trim() : undefined;
  }

  if (raw.warna !== undefined && typeof raw.warna === "string") {
    data.warna = raw.warna;
  }

  if (raw.ikon !== undefined && typeof raw.ikon === "string") {
    data.ikon = raw.ikon;
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

export function validateUpdateAssetBalance(input: unknown): {
  valid: boolean;
  errors: string[];
  data?: UpdateAssetBalanceInput;
} {
  const errors: string[] = [];

  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Data input saldo tidak valid."] };
  }

  const raw = input as Record<string, unknown>;

  if (raw.saldo === undefined || raw.saldo === null) {
    errors.push("Field 'saldo' wajib diisi.");
  }

  const saldo = Number(raw.saldo);
  if (isNaN(saldo) || saldo < 0) {
    errors.push("Saldo baru harus berupa angka dan tidak boleh negatif.");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      saldo,
      catatPenyesuaian: Boolean(raw.catatPenyesuaian),
    },
  };
}
