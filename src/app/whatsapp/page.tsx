"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Zap,
  HelpCircle,
  Copy,
  Check,
  Receipt,
  ExternalLink,
} from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import { useTransaction } from "@/context/TransactionContext";
import { mockUser } from "@/lib/mock-data";
import { formatRupiah } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  transactionData?: {
    tipe: "pengeluaran" | "pemasukan";
    jumlah: number;
    kategori: string;
    catatan: string;
  };
}

export default function KoneksiWhatsAppPage() {
  const router = useRouter();
  const { transactions, addTransaction } = useTransaction();

  const [isConnected, setIsConnected] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState(mockUser.nomorWhatsApp || "081234567890");
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [inputNumber, setInputNumber] = useState(phoneNumber);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Chat simulator state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      sender: "user",
      text: "kopi kenangan 28rb",
      timestamp: "14:20",
    },
    {
      id: "m-2",
      sender: "bot",
      text: "✅ Catatan Jajan Berhasil!\n• Tipe: Pengeluaran (JajanAja)\n• Pos: Kopi & Jajan\n• Nominal: Rp 28.000\n• Catatan: Kopi kenangan\n\nSisa budget Kopi & Jajan: Rp 322.000 lagi ya! ☕",
      timestamp: "14:20",
      transactionData: {
        tipe: "pengeluaran",
        jumlah: 28000,
        kategori: "Kopi & Jajan",
        catatan: "Kopi kenangan",
      },
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSavePhoneNumber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputNumber.trim()) return;
    setPhoneNumber(inputNumber.trim());
    setIsEditingPhone(false);
    showToast("Nomor WhatsApp berhasil diperbarui & terhubung!");
  };

  // Parser teks pesan alami WhatsApp tiruan
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const now = new Date();
    const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    const newUserMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: timeStr,
    };

    setChatMessages((prev) => [...prev, newUserMsg]);
    setChatInput("");

    // Simulate bot response after short delay
    setTimeout(() => {
      const lower = userText.toLowerCase();

      // Cek apakah tanya budget
      if (lower.includes("budget") || lower.includes("sisa")) {
        const botReply: ChatMessage = {
          id: `m-${Date.now() + 1}`,
          sender: "bot",
          text: "📊 Sisa Budget Bulan Ini:\n• Makan & Minum: Rp 850.000 (Sisa 45%)\n• Kopi & Jajan: Rp 322.000 (Sisa 64%)\n• Belanja Bulanan: Rp 450.000 (Sisa 30%)\n\nSemangat hemat minggu ini ya! 🦊",
          timestamp: timeStr,
        };
        setChatMessages((prev) => [...prev, botReply]);
        return;
      }

      // Deteksi nominal
      let amount = 0;
      const numMatch = lower.match(/\d+([.,]\d+)?/);
      if (numMatch) {
        let rawNum = parseFloat(numMatch[0].replace(",", "."));
        if (lower.includes("rb") || lower.includes("k") || lower.includes("ribu")) {
          rawNum *= 1000;
        } else if (lower.includes("jt") || lower.includes("juta")) {
          rawNum *= 1000000;
        }
        amount = Math.round(rawNum);
      }

      const isIncome =
        lower.includes("gaji") ||
        lower.includes("nabung") ||
        lower.includes("terima") ||
        lower.includes("bonus") ||
        lower.includes("freelance");

      const categoryName = isIncome
        ? lower.includes("freelance")
          ? "Freelance & Side Project"
          : "Gaji Utama"
        : lower.includes("kopi") || lower.includes("toast")
        ? "Kopi & Jajan"
        : lower.includes("bensin") || lower.includes("grab") || lower.includes("gojek")
        ? "Transportasi"
        : lower.includes("indomaret") || lower.includes("alfamart") || lower.includes("sabun")
        ? "Belanja Bulanan"
        : "Makan & Minum";

      const categoryId = isIncome
        ? "cat-7"
        : lower.includes("kopi")
        ? "cat-2"
        : lower.includes("bensin") || lower.includes("grab")
        ? "cat-3"
        : lower.includes("indomaret")
        ? "cat-4"
        : "cat-1";

      const validAmount = amount > 0 ? amount : 25000;
      const cleanNote = userText.replace(/\d+.*$/, "").trim() || userText;

      // Otomatis catat ke context transaksi aplikasi
      addTransaction({
        tipe: isIncome ? "pemasukan" : "pengeluaran",
        jumlah: validAmount,
        categoryId,
        assetId: "ast-1",
        catatan: `${userText} (via WhatsApp)`,
        label: "WhatsApp",
        sumber: "whatsapp",
        tanggal: new Date().toISOString(),
      });

      const botReply: ChatMessage = {
        id: `m-${Date.now() + 1}`,
        sender: "bot",
        text: `✅ Berhasil dicatat otomatis!\n• Tipe: ${
          isIncome ? "Pemasukan (NabungAja)" : "Pengeluaran (JajanAja)"
        }\n• Pos: ${categoryName}\n• Nominal: ${formatRupiah(
          validAmount
        )}\n• Sumber: WhatsApp Bot\n\nTransaksi sudah langsung tampil di Dashboard-mu! 🎉`,
        timestamp: timeStr,
        transactionData: {
          tipe: isIncome ? "pemasukan" : "pengeluaran",
          jumlah: validAmount,
          kategori: categoryName,
          catatan: cleanNote,
        },
      };

      setChatMessages((prev) => [...prev, botReply]);
    }, 600);
  };

  const whatsappTransactions = transactions.filter((t) => t.sumber === "whatsapp");

  return (
    <div className="flex-1 flex flex-col p-4 pb-28 space-y-4 max-w-lg mx-auto w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg border border-slate-700 animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Header Halaman */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-base font-black text-slate-900 flex items-center gap-1.5">
              <span>Catat via WhatsApp</span>
              <span className="text-emerald-600">💬</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              Ketik jajan di WhatsApp, tercatat otomatis
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Cloud API Active</span>
        </span>
      </div>

      {/* Card Status Koneksi Nomor WhatsApp */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-5 shadow-lg shadow-emerald-200/50 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-md">
              {isConnected ? "✓ Nomor Terhubung" : "Belum Terhubung"}
            </span>
            <p className="text-xs text-emerald-100 font-medium pt-1">
              Nomor WhatsApp Pengguna:
            </p>
            <p className="text-lg font-black tracking-wide font-mono">
              {phoneNumber}
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-2xl backdrop-blur-xs">
            📱
          </div>
        </div>

        {/* Edit or Connect Button */}
        <div className="pt-2 border-t border-white/20 flex items-center justify-between">
          <p className="text-[11px] text-emerald-100">
            Bot WhatsApp JajanAja: <strong>+62 821-5555-0123</strong>
          </p>

          <button
            type="button"
            onClick={() => setIsEditingPhone(!isEditingPhone)}
            className="text-xs font-bold text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl transition cursor-pointer"
          >
            {isEditingPhone ? "Tutup" : "Ganti Nomor"}
          </button>
        </div>

        {isEditingPhone && (
          <form onSubmit={handleSavePhoneNumber} className="pt-2 space-y-2 animate-in fade-in">
            <input
              type="tel"
              value={inputNumber}
              onChange={(e) => setInputNumber(e.target.value)}
              placeholder="08123456789"
              className="w-full px-3 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
              >
                Simpan & Hubungkan
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Simulator Interaktif Chat WhatsApp */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageSquare size={15} />
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-800">
                Simulasi Chat WhatsApp Bot
              </h3>
              <p className="text-[10px] text-slate-400">
                Ketik pesan seperti sedang chat di WA aslinya
              </p>
            </div>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
            Online 🟢
          </span>
        </div>

        {/* Bubble Chat Display */}
        <div className="bg-[#EFEAE2] p-3 rounded-2xl min-h-[160px] max-h-[220px] overflow-y-auto space-y-2.5 border border-slate-200/60 font-sans text-xs">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs shadow-xs space-y-1 ${
                  msg.sender === "user"
                    ? "bg-[#D9FDD3] text-slate-900 rounded-tr-none"
                    : "bg-white text-slate-900 rounded-tl-none border border-slate-200/50"
                }`}
              >
                <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                <p className="text-[9px] text-slate-400 text-right">{msg.timestamp}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Kirim Pesan */}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Coba: 'kopi 25rb' atau 'makan padang 35000'..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition active:scale-95 shrink-0 cursor-pointer shadow-md shadow-emerald-200"
            title="Kirim pesan simulasi"
          >
            <Send size={15} />
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
          <span className="text-slate-400 text-[10px] shrink-0">Contoh:</span>
          <button
            type="button"
            onClick={() => setChatInput("kopi 20rb")}
            className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg text-slate-600 whitespace-nowrap transition"
          >
            ☕ kopi 20rb
          </button>
          <button
            type="button"
            onClick={() => setChatInput("makan siang 35000")}
            className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg text-slate-600 whitespace-nowrap transition"
          >
            🍛 makan siang 35000
          </button>
          <button
            type="button"
            onClick={() => setChatInput("sisa budget")}
            className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg text-slate-600 whitespace-nowrap transition"
          >
            📊 sisa budget
          </button>
        </div>
      </div>

      {/* Panduan Format Pesan (Cheat Sheet) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <Zap size={16} className="text-amber-500" />
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
            Panduan Format Chat JajanAja
          </h3>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="font-bold text-slate-800 block text-[11px]">
              1. Catat Pengeluaran Kilat
            </span>
            <p className="text-slate-500 text-[11px]">
              Cukup ketik nama jajan diikuti nominalnya:
            </p>
            <div className="font-mono text-[11px] text-emerald-700 bg-white p-1.5 rounded-lg border border-slate-200">
              kopi 25rb <br />
              makan mie ayam 22000 <br />
              bensin pertamax 50rb
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="font-bold text-slate-800 block text-[11px]">
              2. Catat Pemasukan (NabungAja)
            </span>
            <p className="text-slate-500 text-[11px]">
              Sebutkan kata kunci seperti gaji atau freelance:
            </p>
            <div className="font-mono text-[11px] text-emerald-700 bg-white p-1.5 rounded-lg border border-slate-200">
              gaji utama 8500000 <br />
              freelance desain 1.5jt
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="font-bold text-slate-800 block text-[11px]">
              3. Cek Status Budget & Saldo
            </span>
            <div className="font-mono text-[11px] text-emerald-700 bg-white p-1.5 rounded-lg border border-slate-200">
              sisa budget <br />
              rekap hari ini
            </div>
          </div>
        </div>
      </div>

      {/* Riwayat Transaksi Tercatat dari WhatsApp */}
      {whatsappTransactions.length > 0 && (
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              Tercatat via WhatsApp ({whatsappTransactions.length})
            </h3>
            <Link
              href="/transaksi"
              className="text-[11px] text-blue-600 font-bold hover:underline"
            >
              Lihat Semua
            </Link>
          </div>

          <div className="divide-y divide-slate-100 space-y-1.5">
            {whatsappTransactions.slice(0, 3).map((tx) => (
              <div key={tx.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-800">{tx.catatan || tx.kategori?.nama || "Transaksi WhatsApp"}</p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(tx.tanggal).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span
                  className={`font-black ${
                    tx.tipe === "pemasukan" ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {tx.tipe === "pemasukan" ? "+" : "-"}
                  {formatRupiah(tx.jumlah)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
