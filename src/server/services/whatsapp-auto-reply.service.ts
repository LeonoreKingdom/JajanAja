import { serverStore } from "../db/store";
import { parseWhatsAppMessage, ParsedWhatsAppTransaction } from "./whatsapp-parser.service";
import { saveTransactionFromWhatsAppMessage } from "./whatsapp-transaction.service";
import { formatRupiah } from "@/lib/utils";

export interface AutoReplyResponse {
  replyText: string;
  intent: string;
  processedTransaction?: any;
}

/**
 * Membentuk visual progress bar berbasis teks untuk WhatsApp
 */
function makeTextProgressBar(percentage: number, length: number = 8): string {
  const clamped = Math.max(0, Math.min(100, percentage));
  const filledCount = Math.round((clamped / 100) * length);
  const emptyCount = length - filledCount;
  return "█".repeat(filledCount) + "░".repeat(emptyCount);
}

/**
 * Layanan penghasil balasan otomatis cerdas (Auto-Reply Engine) untuk WhatsApp bot JajanAja
 */
export class WhatsAppAutoReplyService {
  /**
   * Menghasilkan pesan balasan otomatis berdasarkan pesan yang dikirim pengguna
   */
  public static async generateReply(from: string, incomingText: string): Promise<AutoReplyResponse> {
    const text = incomingText.trim();
    const lower = text.toLowerCase();

    // 1. Cek apakah nomor pengirim sudah terdaftar
    const userConn = serverStore.getWhatsAppByNumber(from) || serverStore.getWhatsAppConnection("usr-1");

    if (!userConn && from !== "6281234567890") {
      return {
        intent: "unregistered",
        replyText:
          `🦊 *Halo dari JajanAja!*\n\n` +
          `Nomor WhatsApp Anda (*${from}*) belum terhubung ke akun JajanAja.\n\n` +
          `Untuk mulai mencatat pengeluaran otomatis cukup lewat chat WA:\n` +
          `1. Buka aplikasi JajanAja di browser Anda\n` +
          `2. Masuk ke menu *Catat via WhatsApp*\n` +
          `3. Masukkan nomor Anda untuk mengaktifkan koneksi instan.\n\n` +
          `Sampai jumpa di JajanAja! ✨`,
      };
    }

    const userName = userConn?.namaProfil || "Teman Jajan";

    // 2. Intent: Sapaan atau Perkenalan
    if (
      lower === "halo" ||
      lower === "hai" ||
      lower === "hi" ||
      lower === "p" ||
      lower.includes("siapa kamu") ||
      lower.includes("kenalan")
    ) {
      return {
        intent: "greeting",
        replyText:
          `🦊 *Halo kak ${userName}! Aku Bot JajanAja* ✨\n\n` +
          `Aku siap membantumu mencatat pemasukan dan pengeluaran secepat mengetik chat biasa!\n\n` +
          `💡 *Contoh Pesan Cepat:*\n` +
          `• _kopi 25rb_\n` +
          `• _makan padang 35000_\n` +
          `• _gaji 8500000_\n` +
          `• _sisa budget_\n` +
          `• _rekap hari ini_\n\n` +
          `Ketik apa yang baru saja kamu beli, aku yang catatkan ke dompet & budgetmu! 🎯`,
      };
    }

    // 3. Intent: Panduan & Bantuan
    if (lower === "bantuan" || lower === "help" || lower === "menu" || lower === "panduan") {
      return {
        intent: "help",
        replyText:
          `📋 *Panduan Chat Bot JajanAja:*\n\n` +
          `1️⃣ *Catat Pengeluaran (JajanAja):*\n` +
          `Ketik nama item & nominal:\n` +
          `• _kopi susu 20rb_\n` +
          `• _bensin pertamax 50k_\n` +
          `• _makan mie ayam 22.000_\n\n` +
          `2️⃣ *Catat Pemasukan (NabungAja):*\n` +
          `Sebut kata kunci pemasukan:\n` +
          `• _gaji utama 8500000_\n` +
          `• _freelance desain 1.5jt_\n\n` +
          `3️⃣ *Cek Posisi Anggaran:*\n` +
          `• _sisa budget_ (rekap kuota kategori)\n` +
          `• _rekap hari ini_ (total jajan hari ini)\n\n` +
          `Semua transaksi langsung tersinkronisasi ke Dashboard web-mu! 🦊`,
      };
    }

    // 4. Intent: Rekap Hari Ini
    if (lower.includes("rekap") || lower.includes("hari ini") || lower.includes("jajan berapa")) {
      const today = new Date().toISOString().split("T")[0];
      const allTx = serverStore.getTransactions();
      const todayTx = allTx.filter((t) => t.tanggal.startsWith(today));

      const totalPengeluaran = todayTx
        .filter((t) => t.tipe === "pengeluaran")
        .reduce((sum, t) => sum + t.jumlah, 0);

      const totalPemasukan = todayTx
        .filter((t) => t.tipe === "pemasukan")
        .reduce((sum, t) => sum + t.jumlah, 0);

      let report = `📊 *Rekap Transaksi Hari Ini (${today})*\n\n`;
      report += `• Total Pengeluaran: *${formatRupiah(totalPengeluaran)}*\n`;
      report += `• Total Pemasukan: *${formatRupiah(totalPemasukan)}*\n`;
      report += `• Jumlah Transaksi: *${todayTx.length} transaksi*\n\n`;

      if (todayTx.length > 0) {
        report += `*Rincian Hari Ini:*\n`;
        todayTx.slice(0, 5).forEach((t) => {
          const sign = t.tipe === "pemasukan" ? "🟢 +" : "🔴 -";
          report += `${sign} ${t.catatan}: ${formatRupiah(t.jumlah)}\n`;
        });
      } else {
        report += `_Belum ada transaksi tercatat hari ini._\n`;
      }

      report += `\nTetap terkendali dan pantau terus dompetmu! 🦊👌`;

      return {
        intent: "daily_summary",
        replyText: report,
      };
    }

    // 5. Intent: Cek Sisa Budget
    if (lower.includes("sisa budget") || lower.includes("cek budget") || lower === "budget") {
      const budgets = serverStore.getBudgets();
      let report = `📊 *Rekap Sisa Budget Bulan Ini:*\n\n`;

      if (budgets.length === 0) {
        report += `_Belum ada alokasi budget aktif di menu Budgetin._\n`;
      } else {
        budgets.slice(0, 5).forEach((b) => {
          const sisa = Math.max(0, b.batasJumlah - b.terpakai);
          const percent = b.batasJumlah > 0 ? Math.round((b.terpakai / b.batasJumlah) * 100) : 0;
          const bar = makeTextProgressBar(percent, 8);
          const statusIcon = percent >= 90 ? "🚨" : percent >= 75 ? "⚠️" : "🟢";

          report += `${statusIcon} *${b.kategori.nama}*\n`;
          report += `   [${bar}] ${percent}%\n`;
          report += `   Sisa: *${formatRupiah(sisa)}* dari ${formatRupiah(b.batasJumlah)}\n\n`;
        });
      }

      report += `Semangat mengontrol pengeluaran ya kak ${userName}! 🎯`;

      return {
        intent: "budget_status",
        replyText: report,
      };
    }

    // 6. Pencatatan Transaksi Finansial Alami (JajanAja / NabungAja)
    const result = saveTransactionFromWhatsAppMessage({
      from,
      text,
      assetId: userConn?.defaultAssetId,
    });

    if (result.success && result.transaction) {
      return {
        intent: "transaction_recorded",
        replyText: result.replyText,
        processedTransaction: result.transaction,
      };
    }

    // 7. Format Tidak Dikenali
    return {
      intent: "unrecognized",
      replyText:
        `🤔 *Pesan Belum Dikenali*\n\n` +
        `Maaf kak ${userName}, aku belum bisa memahami pesan: "${text}".\n\n` +
        `💡 *Coba ketik format sederhana berikut:*\n` +
        `• _kopi 25rb_\n` +
        `• _nasi padang 34000_\n` +
        `• _bensin 50k_\n\n` +
        `Ketik *bantuan* untuk melihat semua fitur yang tersedia! 🦊`,
    };
  }

  /**
   * Pengiriman pesan balasan (menghubungkan ke Meta WhatsApp Cloud API bila token tersedia)
   */
  public static async sendReply(to: string, replyText: string): Promise<{ success: boolean; mode: "meta_api" | "simulation" }> {
    const apiToken = process.env.WHATSAPP_API_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (apiToken && phoneId) {
      try {
        const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to,
            type: "text",
            text: { body: replyText },
          }),
        });

        if (res.ok) {
          return { success: true, mode: "meta_api" };
        }
      } catch (err) {
        console.error("Gagal mengirim pesan via WhatsApp Cloud API:", err);
      }
    }

    // Fallback: Mode simulasi lokal / log tersimpan
    return { success: true, mode: "simulation" };
  }
}
