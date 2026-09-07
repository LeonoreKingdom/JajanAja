import { Category } from "@/types/finance";

export const defaultExpenseCategories: Category[] = [
  {
    id: "cat-1",
    nama: "Makan & Minum",
    tipe: "pengeluaran",
    ikon: "Utensils",
    warna: "#f97316",
  },
  {
    id: "cat-2",
    nama: "Kopi & Jajan",
    tipe: "pengeluaran",
    ikon: "Coffee",
    warna: "#8b5cf6",
  },
  {
    id: "cat-3",
    nama: "Transportasi",
    tipe: "pengeluaran",
    ikon: "Car",
    warna: "#3b82f6",
  },
  {
    id: "cat-4",
    nama: "Belanja Bulanan",
    tipe: "pengeluaran",
    ikon: "ShoppingBag",
    warna: "#ec4899",
  },
  {
    id: "cat-5",
    nama: "Tagihan & Pulsa",
    tipe: "pengeluaran",
    ikon: "Zap",
    warna: "#eab308",
  },
  {
    id: "cat-6",
    nama: "Hiburan & Hobi",
    tipe: "pengeluaran",
    ikon: "Gamepad2",
    warna: "#06b6d4",
  },
  {
    id: "cat-13",
    nama: "Kesehatan & Medis",
    tipe: "pengeluaran",
    ikon: "HeartPulse",
    warna: "#ef4444",
  },
  {
    id: "cat-14",
    nama: "Belanja Online",
    tipe: "pengeluaran",
    ikon: "Package",
    warna: "#a855f7",
  },
  {
    id: "cat-15",
    nama: "Pendidikan & Buku",
    tipe: "pengeluaran",
    ikon: "BookOpen",
    warna: "#3b82f6",
  },
  {
    id: "cat-16",
    nama: "Sedekah & Hadiah",
    tipe: "pengeluaran",
    ikon: "HeartHandshake",
    warna: "#10b981",
  },
];

export const defaultIncomeCategories: Category[] = [
  {
    id: "cat-7",
    nama: "Gaji Utama",
    tipe: "pemasukan",
    ikon: "Briefcase",
    warna: "#10b981",
  },
  {
    id: "cat-8",
    nama: "Freelance & Side Project",
    tipe: "pemasukan",
    ikon: "Laptop",
    warna: "#14b8a6",
  },
  {
    id: "cat-9",
    nama: "Investasi & Dividen",
    tipe: "pemasukan",
    ikon: "TrendingUp",
    warna: "#6366f1",
  },
  {
    id: "cat-10",
    nama: "Bonus & THR",
    tipe: "pemasukan",
    ikon: "Award",
    warna: "#f59e0b",
  },
  {
    id: "cat-11",
    nama: "Hadiah & Hibah",
    tipe: "pemasukan",
    ikon: "Gift",
    warna: "#ec4899",
  },
  {
    id: "cat-12",
    nama: "Cashback & Reward",
    tipe: "pemasukan",
    ikon: "Coins",
    warna: "#06b6d4",
  },
  {
    id: "cat-17",
    nama: "Penjualan Barang Bekas",
    tipe: "pemasukan",
    ikon: "Store",
    warna: "#84cc16",
  },
  {
    id: "cat-18",
    nama: "Pemasukan Lainnya",
    tipe: "pemasukan",
    ikon: "Wallet",
    warna: "#64748b",
  },
];

export const allSeedCategories: Category[] = [
  ...defaultExpenseCategories,
  ...defaultIncomeCategories,
];

/**
 * Helper function to get seeded categories
 */
export function getSeededCategories(tipe?: "pengeluaran" | "pemasukan"): Category[] {
  if (tipe === "pengeluaran") return [...defaultExpenseCategories];
  if (tipe === "pemasukan") return [...defaultIncomeCategories];
  return [...allSeedCategories];
}
