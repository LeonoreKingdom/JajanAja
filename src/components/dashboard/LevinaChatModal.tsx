"use client";

import React, { useState } from "react";
import { X, Send, Sparkles } from "lucide-react";

interface LevinaChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "levina";
  text: string;
  time: string;
}

export default function LevinaChatModal({
  isOpen,
  onClose,
}: LevinaChatModalProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "levina",
      text: "Halo kak! Aku LEVINA, teman finansialmu 🦊. Ada yang mau kamu tanyakan tentang budget jajan atau saldo bulan ini?",
      time: "13:00",
    },
    {
      id: "2",
      sender: "user",
      text: "Berapa sisa budget makanku minggu ini?",
      time: "13:01",
    },
    {
      id: "3",
      sender: "levina",
      text: "Sisa budget makan & jajanmu masih ada Rp 1.150.000 lagi kak. Cukup aman kok, asal jangan sering-sering pesan kopi signature yaa! 😉",
      time: "13:01",
    },
  ]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: userText,
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    // Balasan simulasi LEVINA
    setTimeout(() => {
      let botResponse = "Siap kak! Pengeluaranmu selalu aku pantau biar dompetmu tetap sehat dan bebas bocor halus ya! 🦊✨";
      if (userText.toLowerCase().includes("budget") || userText.toLowerCase().includes("sisa")) {
        botResponse = "Sisa budget bulananmu secara total masih tersisa Rp 1.150.000. Masih di jalur yang tepat!";
      } else if (userText.toLowerCase().includes("hemat") || userText.toLowerCase().includes("tips")) {
        botResponse = "Tips hari ini: Kalau mau jajan kopi, coba batasi maksimal 2 kali seminggu, sisanya seduh sendiri. Kamu bisa hemat sampai Rp 250.000/bulan lho!";
      } else if (userText.toLowerCase().includes("saldo") || userText.toLowerCase().includes("uang")) {
        botResponse = "Total saldo asetmu sekarang Rp 17.170.000 yang tersebar di BCA, GoPay, OVO, dan Dompet Tunai.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "levina",
          text: botResponse,
          time: new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl h-[85vh] sm:h-[600px] flex flex-col overflow-hidden border border-slate-100 dark:border-slate-800">
        {/* Header Chat */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-xl shadow-inner">
              🦊
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm">LEVINA</h3>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-emerald-500/30 text-emerald-200 px-1.5 py-0.2 rounded-full">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  Online
                </span>
              </div>
              <p className="text-[11px] text-purple-200">
                Teman Finansial Pribadimu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Daftar Chat */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-900">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-sm shrink-0 mt-1">
                    🦊
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs ${
                    isUser
                      ? "bg-purple-600 text-white rounded-br-xs"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-bl-xs shadow-2xs"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1 ${
                      isUser ? "text-purple-200 text-right" : "text-slate-400 dark:text-slate-400 text-left"
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSend}
          className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Tanya LEVINA tentang budget atau pengeluaran..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shrink-0 transition shadow-xs"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
