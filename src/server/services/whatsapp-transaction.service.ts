import { serverStore } from "../db/store";
import { TransactionRecord } from "../schemas/transaction.schema";
import {
  parseWhatsAppMessage,
  ParsedWhatsAppTransaction,
} from "./whatsapp-parser.service";
import { formatRupiah } from "@/lib/utils";

export interface SaveWhatsAppTransactionParams {
  from: string;
  text: string;
  assetId?: string;
  timestamp?: string;
}

export interface SaveWhatsAppTransactionResult {
  success: boolean;
  message: string;
  replyText: string;
  parsed: ParsedWhatsAppTransaction;
  transaction?: TransactionRecord;
  remainingBudget?: number;
}

/**
 * Layanan utama untuk memproses teks pesan WhatsApp, memparsingnya, dan menyimpannya menjadi transaksi keuangan
 */
export function saveTransactionFromWhatsAppMessage(
  params: SaveWhatsAppTransactionParams
): SaveWhatsAppTransactionResult {
  const { from, text } = params;
  const parsed = parseWhatsAppMessage(text);
  const now = params.timestamp || new Date().toISOString();

  const userConn = serverStore.getWhatsAppByNumber(from) || serverStore.getWhatsAppConnection("usr-1");

  // Kasus 1: Permintaan cek sisa budget
  if (parsed.intent === "budget_query") {
    const budgets = serverStore.getBudgets();
    let reply = "📊 Sisa Budget Bulan Ini:\n";

    if (budgets.length === 0) {
      reply += "• Belum ada batas budget yang diatur. Atur di menu Budgetin ya! 🎯";
    } else {
      budgets.slice(0, 4).forEach((b) => {
        const sisa = Math.max(0, b.batasJumlah - b.terpakai);
        const percentSisa = b.batasJumlah > 0 ? Math.round((sisa / b.batasJumlah) * 100) : 0;
        reply += `• ${b.kategori.nama}: ${formatRupiah(sisa)} (Sisa ${percentSisa}%)\n`;
      });
      reply += "\nSemangat mengontrol pengeluaran tanpa bikin hidup kaku! 🦊✨";
    }

    serverStore.addWhatsAppMessageLog({
      whatsappId: userConn?.id,
      nomorPengirim: from,
      pesanMentah: text,
      tipeTerdeteksi: "tidak_dikenal",
      statusProses: "berhasil",
      balasanBot: reply,
    });

    return {
      success: true,
      message: "Berhasil memberikan informasi sisa budget.",
      replyText: reply,
      parsed,
    };
  }

  // Kasus 2: Sapaan atau Bantuan
  if (parsed.intent === "help") {
    const reply = `Halo kak ${userConn?.namaProfil || "Teman Jajan"}! 🦊✨ Aku bot pencatat keuangan instan JajanAja.\n\nContoh cara mencatat:\n• Pengeluaran: "kopi 25rb", "makan siang 35000", "grab 28k"\n• Pemasukan: "gaji 8500000", "freelance 1.5jt"\n• Cek Budget: "sisa budget", "rekap hari ini"`;

    serverStore.addWhatsAppMessageLog({
      whatsappId: userConn?.id,
      nomorPengirim: from,
      pesanMentah: text,
      statusProses: "berhasil",
      balasanBot: reply,
    });

    return {
      success: true,
      message: "Berhasil memberikan panduan format pesan.",
      replyText: reply,
      parsed,
    };
  }

  // Kasus 3: Pesan tidak dikenali format transaksinya
  if (!parsed.isValidTransaction || !parsed.nominal) {
    const reply = `Maaf, format pesan belum dikenali. Coba ketik nama jajan diikuti nominal, contoh: 'kopi 25rb' atau 'makan siang 35000'. Ketik 'bantuan' untuk info lengkap. 💡`;

    serverStore.addWhatsAppMessageLog({
      whatsappId: userConn?.id,
      nomorPengirim: from,
      pesanMentah: text,
      statusProses: "gagal",
      balasanBot: reply,
    });

    return {
      success: false,
      message: "Format transaksi tidak dikenali.",
      replyText: reply,
      parsed,
    };
  }

  // Kasus 4: Transaksi valid -> Simpan ke database
  const targetAssetId = params.assetId || userConn?.defaultAssetId || "ast-1";
  const assets = serverStore.getAssets();
  const targetAsset = assets.find((a) => a.id === targetAssetId) || assets[0];

  const newTx: TransactionRecord = {
    id: `tx-wa-${Date.now()}`,
    tipe: parsed.tipe || "pengeluaran",
    jumlah: parsed.nominal,
    tanggal: now,
    categoryId: parsed.kategoriId || "cat-1",
    assetId: targetAsset ? targetAsset.id : "ast-1",
    catatan: parsed.deskripsi || text,
    label: ["WhatsApp"],
    sumber: "whatsapp",
    reimbursable: false,
    createdAt: now,
    updatedAt: now,
  };

  // Simpan transaksi & mutasi saldo/budget otomatis
  serverStore.addTransaction(newTx);

  // Ambil sisa budget terkait
  let sisaBudget: number | undefined;
  if (parsed.tipe === "pengeluaran" && parsed.kategoriId) {
    const budget = serverStore.getBudgets().find((b) => b.categoryId === parsed.kategoriId);
    if (budget) {
      sisaBudget = Math.max(0, budget.batasJumlah - budget.terpakai);
    }
  }

  // Bangun balasan cerdas bot
  let replyText = `✅ Berhasil dicatat otomatis!\n• Tipe: ${
    parsed.tipe === "pemasukan" ? "Pemasukan (NabungAja)" : "Pengeluaran (JajanAja)"
  }\n• Pos: ${parsed.kategoriNama || "Lainnya"}\n• Nominal: ${formatRupiah(
    parsed.nominal
  )}\n• Catatan: ${newTx.catatan}\n• Dompet: ${targetAsset ? targetAsset.nama : "Kas Tunai"}`;

  if (sisaBudget !== undefined) {
    replyText += `\n\nSisa budget ${parsed.kategoriNama}: ${formatRupiah(sisaBudget)} lagi ya! 🎯`;
  } else {
    replyText += `\n\nTransaksi sudah langsung tampil di Dashboard JajanAja! 🎉`;
  }

  // Catat ke log pesan WhatsApp
  serverStore.addWhatsAppMessageLog({
    whatsappId: userConn?.id,
    nomorPengirim: from,
    pesanMentah: text,
    tipeTerdeteksi: parsed.tipe,
    jumlah: parsed.nominal,
    deskripsi: newTx.catatan,
    kategoriId: parsed.kategoriId,
    statusProses: "berhasil",
    transaksiId: newTx.id,
    balasanBot: replyText,
  });

  return {
    success: true,
    message: "Transaksi berhasil dicatat dan disimpan ke database!",
    replyText,
    parsed,
    transaction: newTx,
    remainingBudget: sisaBudget,
  };
}
