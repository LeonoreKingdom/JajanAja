export type TransactionType = "pengeluaran" | "pemasukan";
export type AssetType = "tunai" | "bank" | "e-wallet";
export type TransactionSource = "manual" | "pindai-struk" | "whatsapp";

export interface User {
  id: string;
  nama: string;
  email: string;
  password?: string;
  nomorWhatsApp?: string;
  avatarUrl?: string;
  role?: string;
}

export interface Asset {
  id: string;
  nama: string;
  jenis: AssetType;
  saldo: number;
  nomorRekening?: string;
  warna?: string;
  ikon?: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  nama: string;
  tipe: TransactionType;
  ikon: string; // Lucide icon name or emoji
  warna: string;
}

export interface Transaction {
  id: string;
  tipe: TransactionType;
  jumlah: number;
  tanggal: string;
  catatan?: string;
  label?: string;
  sumber: TransactionSource;
  assetId?: string;
  categoryId: string;
  receiptScanId?: string;
  splitBillId?: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  periodeBulan: string; // YYYY-MM
  batasJumlah: number;
  terpakai: number;
  warna?: string;
  updatedAt?: string;
}

export interface LevinaInsight {
  sapaan: string;
  pesan: string;
  tips: string;
  mood: "senang" | "waspada" | "bangga" | "santai";
}

export interface DashboardSummary {
  user: User;
  totalSaldo: number;
  totalPemasukanBulanIni: number;
  totalPengeluaranBulanIni: number;
  sisaBudgetBulanIni: number;
  totalBudgetBulanIni: number;
  insightLevina: LevinaInsight;
  transaksiTerbaru: (Transaction & {
    kategori: Category;
    aset?: Asset;
  })[];
  daftarAset: Asset[];
  alokasiBudget: (Budget & {
    kategori: Category;
  })[];
}
