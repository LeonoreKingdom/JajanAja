import { SplitMethod, SplitParticipant, SplitBillGroup } from "@/types/split-bill";

export interface BagiTagihanRecord {
  id: string;
  judul: string;
  totalTagihan: number;
  tanggal: string;
  metode: SplitMethod;
  namaToko?: string;
  transactionId?: string;
  status: "aktif" | "selesai" | "dibatalkan";
  catatan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PesertaBagiTagihanRecord {
  id: string;
  bagiTagihanId: string;
  nama: string;
  bagian: number;
  sudahBayar: boolean;
  nomorHp?: string;
  avatar?: string;
  waktuBayar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BagiTagihanWithPeserta extends BagiTagihanRecord {
  peserta: PesertaBagiTagihanRecord[];
}

export interface CreateBagiTagihanInput {
  judul: string;
  totalTagihan: number;
  tanggal: string;
  metode: SplitMethod;
  namaToko?: string;
  transactionId?: string;
  catatan?: string;
  peserta: Array<{
    id?: string;
    nama: string;
    bagian: number;
    sudahBayar?: boolean;
    nomorHp?: string;
    avatar?: string;
  }>;
}

export interface UpdatePesertaStatusInput {
  sudahBayar: boolean;
}

/**
 * Validasi pembuatan data bagi_tagihan dan peserta
 */
export function validateCreateBagiTagihan(input: unknown): {
  valid: boolean;
  errors: string[];
  data?: CreateBagiTagihanInput;
} {
  const errors: string[] = [];

  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Data bagi tagihan tidak valid."] };
  }

  const raw = input as Record<string, unknown>;

  if (!raw.judul || typeof raw.judul !== "string" || !raw.judul.trim()) {
    errors.push("Judul tagihan wajib diisi.");
  }

  const totalTagihan = Number(raw.totalTagihan);
  if (isNaN(totalTagihan) || totalTagihan <= 0) {
    errors.push("Total tagihan harus berupa angka lebih besar dari 0.");
  }

  if (!raw.tanggal || typeof raw.tanggal !== "string" || !raw.tanggal.trim()) {
    errors.push("Tanggal tagihan wajib diisi.");
  }

  const metode = (raw.metode as SplitMethod) || "sama_rata";
  if (metode !== "sama_rata" && metode !== "nominal_bebas") {
    errors.push("Metode bagi tagihan harus 'sama_rata' atau 'nominal_bebas'.");
  }

  if (!Array.isArray(raw.peserta) || raw.peserta.length === 0) {
    errors.push("Minimal sertakan satu teman/peserta dalam bagi tagihan.");
  } else {
    for (let i = 0; i < raw.peserta.length; i++) {
      const p = raw.peserta[i];
      if (!p || typeof p !== "object" || !p.nama || typeof p.nama !== "string" || !p.nama.trim()) {
        errors.push(`Nama peserta ke-${i + 1} wajib diisi.`);
      }
      if (typeof p.bagian !== "number" || isNaN(p.bagian) || p.bagian < 0) {
        errors.push(`Bagian nominal peserta ke-${i + 1} tidak valid.`);
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      judul: (raw.judul as string).trim(),
      totalTagihan,
      tanggal: (raw.tanggal as string).trim(),
      metode,
      namaToko: typeof raw.namaToko === "string" ? raw.namaToko.trim() : undefined,
      transactionId: typeof raw.transactionId === "string" ? raw.transactionId.trim() : undefined,
      catatan: typeof raw.catatan === "string" ? raw.catatan.trim() : undefined,
      peserta: (raw.peserta as Array<any>).map((p) => ({
        id: typeof p.id === "string" ? p.id : undefined,
        nama: p.nama.trim(),
        bagian: Number(p.bagian),
        sudahBayar: Boolean(p.sudahBayar),
        nomorHp: typeof p.nomorHp === "string" ? p.nomorHp.trim() : undefined,
        avatar: typeof p.avatar === "string" ? p.avatar.trim() : undefined,
      })),
    },
  };
}
