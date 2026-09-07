import { LevinaChatMessage } from "@/types/levina";

export const initialLevinaChatHistory: LevinaChatMessage[] = [
  {
    id: "levina-m1",
    sender: "levina",
    text: "Halo Talitha! Aku LEVINA, maskot & teman finansial pribadimu 🦊✨. Ada yang mau kamu diskusikan tentang pengeluaran, sisa budget, atau tips hemat hari ini?",
    timestamp: "10:00",
    tipe: "text",
  },
  {
    id: "levina-m2",
    sender: "user",
    text: "Berapa sisa budget jajan kopi minggu ini?",
    timestamp: "10:02",
    tipe: "text",
  },
  {
    id: "levina-m3",
    sender: "levina",
    text: "Sisa budget untuk pos Kopi & Jajan masih tersisa Rp 322.000 (sekitar 64% dari batas bulananmu Rp 500.000). Minggu ini masih aman jajan 2–3 cup lagi, tapi usahakan pilih ukuran reguler yaa! ☕👌",
    timestamp: "10:02",
    tipe: "budget_summary",
  },
  {
    id: "levina-m4",
    sender: "user",
    text: "Kalau mau hemat 500rb bulan ini gimana ya?",
    timestamp: "10:05",
    tipe: "text",
  },
  {
    id: "levina-m5",
    sender: "levina",
    text: "Berdasarkan analisis riwayat pengeluaranmu:\n\n1. Pos Makan & Jajan di luar menyerap 54% total pengeluaranmu.\n2. Kurangi pesanan makanan online 2x seminggu, ganti masak simpel: potensi hemat ~Rp 280.000.\n3. Batasi jajan kopi sore jadi 2 cup/minggu: potensi hemat ~Rp 220.000.\n\nTotal potensi penghematan: Rp 500.000! Mau aku bantu sesuaikan target batas di menu Budgetin? 🎯",
    timestamp: "10:06",
    tipe: "saving_tip",
  },
];
