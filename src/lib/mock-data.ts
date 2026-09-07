import {
  Asset,
  Category,
  DashboardSummary,
  Transaction,
  User,
} from "@/types/finance";

export const mockUser: User = {
  id: "user-1",
  nama: "Rian Aditya",
  email: "rian.aditya@example.com",
  nomorWhatsApp: "081234567890",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
};

export const mockCategories: Category[] = [
  // Pengeluaran
  { id: "cat-1", nama: "Makan & Minum", tipe: "pengeluaran", ikon: "Utensils", warna: "#f97316" },
  { id: "cat-2", nama: "Kopi & Jajan", tipe: "pengeluaran", ikon: "Coffee", warna: "#8b5cf6" },
  { id: "cat-3", nama: "Transportasi", tipe: "pengeluaran", ikon: "Car", warna: "#3b82f6" },
  { id: "cat-4", nama: "Belanja Bulanan", tipe: "pengeluaran", ikon: "ShoppingBag", warna: "#ec4899" },
  { id: "cat-5", nama: "Tagihan & Pulsa", tipe: "pengeluaran", ikon: "Zap", warna: "#eab308" },
  { id: "cat-6", nama: "Hiburan & Hobi", tipe: "pengeluaran", ikon: "Gamepad2", warna: "#06b6d4" },
  // Pemasukan
  { id: "cat-7", nama: "Gaji Utama", tipe: "pemasukan", ikon: "Briefcase", warna: "#10b981" },
  { id: "cat-8", nama: "Freelance", tipe: "pemasukan", ikon: "Laptop", warna: "#14b8a6" },
  { id: "cat-9", nama: "Investasi & Bonus", tipe: "pemasukan", ikon: "TrendingUp", warna: "#6366f1" },
];

export const mockAssets: Asset[] = [
  {
    id: "ast-1",
    nama: "BCA Prioritas",
    jenis: "bank",
    saldo: 14250000,
    nomorRekening: "•••• 8921",
    warna: "bg-blue-600 text-white",
    updatedAt: "2026-09-07T10:00:00Z",
  },
  {
    id: "ast-2",
    nama: "GoPay Tabungan",
    jenis: "e-wallet",
    saldo: 1850000,
    nomorRekening: "0812••••7890",
    warna: "bg-emerald-600 text-white",
    updatedAt: "2026-09-07T12:30:00Z",
  },
  {
    id: "ast-3",
    nama: "OVO Cash",
    jenis: "e-wallet",
    saldo: 420000,
    nomorRekening: "0812••••7890",
    warna: "bg-purple-600 text-white",
    updatedAt: "2026-09-06T18:00:00Z",
  },
  {
    id: "ast-4",
    nama: "Dompet Tunai",
    jenis: "tunai",
    saldo: 650000,
    warna: "bg-amber-600 text-white",
    updatedAt: "2026-09-07T08:00:00Z",
  },
];

export const mockTransactions: (Transaction & {
  kategori: Category;
  aset?: Asset;
})[] = [
  {
    id: "tx-1",
    tipe: "pengeluaran",
    jumlah: 45000,
    tanggal: "2026-09-07T13:15:00Z",
    catatan: "Kopi Kenangan Mantan + Croissant",
    label: "Nongkrong",
    sumber: "pindai-struk",
    assetId: "ast-2",
    categoryId: "cat-2",
    kategori: mockCategories[1],
    aset: mockAssets[1],
  },
  {
    id: "tx-2",
    tipe: "pengeluaran",
    jumlah: 135000,
    tanggal: "2026-09-07T09:45:00Z",
    catatan: "Belanja sayur & buah Superindo",
    label: "Dapur",
    sumber: "manual",
    assetId: "ast-1",
    categoryId: "cat-4",
    kategori: mockCategories[3],
    aset: mockAssets[0],
  },
  {
    id: "tx-3",
    tipe: "pengeluaran",
    jumlah: 32000,
    tanggal: "2026-09-06T19:20:00Z",
    catatan: "GrabBike ke stasiun MRT",
    label: "Kerja",
    sumber: "whatsapp",
    assetId: "ast-2",
    categoryId: "cat-3",
    kategori: mockCategories[2],
    aset: mockAssets[1],
  },
  {
    id: "tx-4",
    tipe: "pemasukan",
    jumlah: 2500000,
    tanggal: "2026-09-05T14:00:00Z",
    catatan: "Project Landing Page Web Client A",
    label: "Side Hustle",
    sumber: "manual",
    assetId: "ast-1",
    categoryId: "cat-8",
    kategori: mockCategories[7],
    aset: mockAssets[0],
  },
  {
    id: "tx-5",
    tipe: "pengeluaran",
    jumlah: 85000,
    tanggal: "2026-09-05T12:10:00Z",
    catatan: "Makan siang Nasi Padang Sederhana",
    label: "Makan Siang",
    sumber: "manual",
    assetId: "ast-4",
    categoryId: "cat-1",
    kategori: mockCategories[0],
    aset: mockAssets[3],
  },
  {
    id: "tx-6",
    tipe: "pengeluaran",
    jumlah: 150000,
    tanggal: "2026-09-04T16:30:00Z",
    catatan: "Paket Data & WiFi bulanan",
    label: "Tagihan Rutin",
    sumber: "manual",
    assetId: "ast-1",
    categoryId: "cat-5",
    kategori: mockCategories[4],
    aset: mockAssets[0],
  },
];

export const mockBudgets = [
  {
    id: "bdg-1",
    categoryId: "cat-1",
    periodeBulan: "2026-09",
    batasJumlah: 2000000,
    terpakai: 785000,
    kategori: mockCategories[0],
  },
  {
    id: "bdg-2",
    categoryId: "cat-2",
    periodeBulan: "2026-09",
    batasJumlah: 600000,
    terpakai: 420000, // 70% warning
    kategori: mockCategories[1],
  },
  {
    id: "bdg-3",
    categoryId: "cat-3",
    periodeBulan: "2026-09",
    batasJumlah: 800000,
    terpakai: 245000,
    kategori: mockCategories[2],
  },
  {
    id: "bdg-4",
    categoryId: "cat-4",
    periodeBulan: "2026-09",
    batasJumlah: 1500000,
    terpakai: 620000,
    kategori: mockCategories[3],
  },
];

export const mockDashboardData: DashboardSummary = {
  user: mockUser,
  totalSaldo: mockAssets.reduce((sum, item) => sum + item.saldo, 0),
  totalPemasukanBulanIni: 12500000,
  totalPengeluaranBulanIni: 4850000,
  totalBudgetBulanIni: 6000000,
  sisaBudgetBulanIni: 6000000 - 4850000,
  insightLevina: {
    sapaan: "Semangat Senin, Rian! ✨",
    pesan: "Pengeluaran kopi & jajanmu sudah mencapai 70% dari budget bulan ini. Coba bikin kopi seduh sendiri 2 hari ke depan biar budget jajanmu tetap aman sampai akhir bulan ya!",
    tips: "Trik hemat: Bawa tumbler sendiri bisa hemat rata-rata Rp 35.000/hari!",
    mood: "waspada",
  },
  transaksiTerbaru: mockTransactions,
  daftarAset: mockAssets,
  alokasiBudget: mockBudgets,
};
