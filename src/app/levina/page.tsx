"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Sparkles,
  RotateCcw,
  HelpCircle,
  TrendingDown,
  Target,
  Compass,
  Check,
  Bot,
  Info,
} from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import { LevinaChatMessage } from "@/types/levina";
import {
  loadStoredLevinaMessages,
  saveStoredLevinaMessages,
  resetStoredLevinaMessages,
  clearStoredLevinaMessages,
  simulateLevinaReply,
} from "@/lib/levina-chat-service";

export default function LevinaChatPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<LevinaChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Load chat history from localStorage or fallback to mock data
  useEffect(() => {
    setMessages(loadStoredLevinaMessages());
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const saveMessages = (updated: LevinaChatMessage[]) => {
    setMessages(updated);
    saveStoredLevinaMessages(updated);
  };

  const handleResetToInitial = () => {
    const fresh = resetStoredLevinaMessages();
    setMessages(fresh);
    setShowResetModal(false);
  };

  const handleClearAll = () => {
    const empty = clearStoredLevinaMessages();
    setMessages(empty);
    setShowResetModal(false);
  };

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim()) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    const userMsg: LevinaChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: promptText.trim(),
      timestamp: timeStr,
      tipe: "text",
    };

    const updatedWithUser = [...messages, userMsg];
    saveMessages(updatedWithUser);
    setInputValue("");
    setIsTyping(true);

    try {
      const reply = await simulateLevinaReply(promptText);

      const botMsg: LevinaChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "levina",
        text: reply.text,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        tipe: reply.tipe,
        budgetData: reply.budgetData,
        savingTips: reply.savingTips,
        featureGuide: reply.featureGuide,
      };

      setIsTyping(false);
      saveMessages([...updatedWithUser, botMsg]);
    } catch {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendPrompt(inputValue);
  };

  const promptSuggestions = [
    { label: "📊 Cek Sisa Budget", text: "Berapa sisa budget makan dan jajanku bulan ini?" },
    { label: "💡 Tips Hemat", text: "Kasih saran hemat berdasarkan jajanku minggu ini dong" },
    { label: "👥 Cara Bagi Tagihan", text: "Bagaimana cara pakai fitur Bagi Tagihan?" },
    { label: "🧾 Panduan Pindai Struk", text: "Gimana cara mencatat pengeluaran lewat scan struk?" },
  ];

  return (
    <div className="flex-1 flex flex-col h-screen lg:h-[85vh] max-w-lg lg:max-w-4xl mx-auto w-full bg-slate-50 dark:bg-slate-900 lg:rounded-3xl lg:border lg:border-slate-200/80 lg:dark:border-slate-800 lg:shadow-lg relative pb-20 lg:pb-4 overflow-hidden">
      {/* Modal Info Maskot LEVINA */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center mx-auto text-3xl">
              🦊
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Tentang LEVINA
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                LEVINA adalah maskot rubah pintar sekaligus asisten teman finansial pribadimu di JajanAja.
                LEVINA siap membantumu mengontrol bocor halus, menganalisis budget, dan memberikan panduan fitur.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowInfoModal(false)}
              className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      {/* Modal Pengaturan & Reset Riwayat Chat Lokal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto text-xl">
              💾
            </div>
            <div className="space-y-1.5 text-center">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Penyimpanan Riwayat Chat
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Semua pesan obrolan disimpan secara otomatis di penyimpanan lokal perangkatmu (localStorage browser).
              </p>
            </div>
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleResetToInitial}
                className="w-full py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold text-xs hover:bg-purple-100 dark:hover:bg-purple-900/40 transition cursor-pointer"
              >
                Kembalikan Contoh Awal
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="w-full py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-bold text-xs hover:bg-rose-100 dark:hover:bg-rose-900/40 transition cursor-pointer"
              >
                Hapus Bersih Semua Pesan
              </button>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="w-full py-2 rounded-xl text-slate-400 dark:text-slate-400 font-semibold text-xs hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Halaman LEVINA */}
      <header className="p-3.5 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition active:scale-95 cursor-pointer text-white"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-xl shadow-inner">
              🦊
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-sm leading-tight">LEVINA</h1>
                <span className="text-[9px] font-bold bg-emerald-500/30 text-emerald-200 px-1.5 py-0.2 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-[10px] text-purple-200">
                Teman Finansial Pribadimu
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowInfoModal(true)}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-purple-100 transition"
            title="Tentang LEVINA"
          >
            <Info size={16} />
          </button>
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-purple-100 transition"
            title="Kelola riwayat chat lokal"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </header>

      {/* Area Pesan Chat (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";

          return (
            <div
              key={msg.id}
              className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"} animate-in fade-in`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-sm shrink-0 mt-1 shadow-2xs">
                  🦊
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed ${
                  isUser
                    ? "bg-purple-600 text-white rounded-br-xs shadow-xs"
                    : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-bl-xs shadow-2xs"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {msg.budgetData && msg.budgetData.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700 space-y-2">
                    {msg.budgetData.map((b, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-2 space-y-1 text-[11px]">
                        <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                          <span>{b.kategori}</span>
                          <span
                            className={
                              b.status === "waspada" ? "text-amber-600 dark:text-amber-400 font-extrabold" : "text-emerald-600 dark:text-emerald-400 font-extrabold"
                            }
                          >
                            Sisa Rp {new Intl.NumberFormat("id-ID").format(b.sisa)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              b.persentase > 80
                                ? "bg-rose-500"
                                : b.persentase > 60
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(100, b.persentase)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    <Link
                      href="/budgetin"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 pt-0.5"
                    >
                      <span>Kelola di Menu Budgetin</span>
                      <span>→</span>
                    </Link>
                  </div>
                )}

                {msg.savingTips && msg.savingTips.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 dark:text-slate-200 bg-purple-50 dark:bg-purple-950/40 p-2 rounded-xl border border-purple-100 dark:border-purple-800/60">
                      <span>Total Potensi Hemat:</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-black">
                        +{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
                          msg.savingTips.reduce((sum, t) => sum + t.potensiHemat, 0)
                        )}/bln
                      </span>
                    </div>

                    {msg.savingTips.map((tip) => (
                      <div
                        key={tip.id}
                        className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-2.5 space-y-1 text-[11px] border border-slate-100 dark:border-slate-700/60"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                          <span className="flex items-center gap-1.5">
                            <span>{tip.ikon || "💡"}</span>
                            <span>{tip.judul}</span>
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                            +{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(tip.potensiHemat)}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {tip.deskripsi}
                        </p>
                      </div>
                    ))}

                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        href="/budgetin"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
                      >
                        <span>Sesuaikan Target di Budgetin</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                )}

                {msg.featureGuide && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700 space-y-2.5">
                    <div className="bg-purple-50/80 dark:bg-purple-950/30 rounded-xl p-3 border border-purple-100 dark:border-purple-800/60 space-y-2.5">
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs">
                        <span className="text-base">{msg.featureGuide.icon || "🧭"}</span>
                        <span>{msg.featureGuide.featureName}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        {msg.featureGuide.description}
                      </p>

                      <div className="space-y-1.5 pt-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 block">
                          Langkah Penggunaan:
                        </span>
                        <div className="space-y-1.5">
                          {msg.featureGuide.steps.map((step, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                              <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5 shadow-2xs">
                                {sIdx + 1}
                              </span>
                              <span className="leading-snug">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-1.5">
                        <Link
                          href={msg.featureGuide.actionHref}
                          className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
                        >
                          <span>{msg.featureGuide.actionLabel}</span>
                          <span>→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                <span
                  className={`block text-[9px] mt-1.5 ${
                    isUser ? "text-purple-200 text-right" : "text-slate-400 dark:text-slate-400 text-left"
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-2 justify-start animate-in fade-in">
            <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-sm shrink-0 mt-1">
              🦊
            </div>
            <div className="bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-xs px-3 py-2 text-xs flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce [animation-delay:0.4s]" />
              <span className="text-[10px] text-slate-400 ml-1">LEVINA sedang mengetik...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Prompt Suggestions */}
      <div className="px-3 py-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs border-t border-slate-200/70 dark:border-slate-800 overflow-x-auto flex items-center gap-1.5 shrink-0 text-xs">
        {promptSuggestions.map((sug, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendPrompt(sug.text)}
            className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold rounded-xl whitespace-nowrap transition active:scale-95 text-[11px] shrink-0 border border-purple-200/60 dark:border-purple-800/60 cursor-pointer"
          >
            {sug.label}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Tanya LEVINA tentang budget, tips hemat, atau panduan..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="w-10 h-10 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center transition active:scale-95 shrink-0 shadow-md shadow-purple-200 dark:shadow-none cursor-pointer"
          >
            <Send size={15} />
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}
