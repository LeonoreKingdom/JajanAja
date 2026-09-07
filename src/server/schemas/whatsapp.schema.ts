export type WhatsAppConnectionStatus = "terhubung" | "menunggu_verifikasi" | "terputus";

export interface NomorWhatsAppRecord {
  id: string;
  userId: string;
  nomorWhatsApp: string;
  namaProfil?: string;
  status: WhatsAppConnectionStatus;
  kodeVerifikasi?: string;
  defaultAssetId?: string;
  autoCategorize: boolean;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LogPesanWhatsAppRecord {
  id: string;
  whatsappId?: string;
  nomorPengirim: string;
  pesanMentah: string;
  tipeTerdeteksi?: "pengeluaran" | "pemasukan" | "tidak_dikenal" | "bantuan";
  jumlah?: number;
  deskripsi?: string;
  kategoriId?: string;
  statusProses: "berhasil" | "gagal" | "diabaikan";
  transaksiId?: string;
  balasanBot?: string;
  createdAt: string;
}

export interface ConnectWhatsAppInput {
  nomorWhatsApp: string;
  namaProfil?: string;
  defaultAssetId?: string;
  autoCategorize?: boolean;
}

/**
 * Normalisasi format nomor WhatsApp internasional (contoh: 081234 -> 6281234, +62 -> 62)
 */
export function normalizeWhatsAppNumber(raw: string): string {
  let cleaned = raw.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  }
  return cleaned;
}

/**
 * Validasi payload registrasi / koneksi nomor WhatsApp
 */
export function validateConnectWhatsApp(input: unknown): {
  valid: boolean;
  errors: string[];
  data?: ConnectWhatsAppInput;
} {
  const errors: string[] = [];

  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Data koneksi WhatsApp tidak valid."] };
  }

  const raw = input as Record<string, unknown>;

  if (!raw.nomorWhatsApp || typeof raw.nomorWhatsApp !== "string" || !raw.nomorWhatsApp.trim()) {
    errors.push("Nomor WhatsApp aktif wajib diisi.");
  } else {
    const cleaned = normalizeWhatsAppNumber(raw.nomorWhatsApp);
    if (cleaned.length < 9 || cleaned.length > 15) {
      errors.push("Format nomor WhatsApp tidak valid (panjang nomor 9-15 digit).");
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      nomorWhatsApp: normalizeWhatsAppNumber(raw.nomorWhatsApp as string),
      namaProfil: typeof raw.namaProfil === "string" ? raw.namaProfil.trim() : undefined,
      defaultAssetId: typeof raw.defaultAssetId === "string" ? raw.defaultAssetId.trim() : undefined,
      autoCategorize: typeof raw.autoCategorize === "boolean" ? raw.autoCategorize : true,
    },
  };
}
