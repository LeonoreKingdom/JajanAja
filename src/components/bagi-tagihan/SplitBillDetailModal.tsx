"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  Clock,
  Share2,
  Calendar,
  Store,
  Check,
  Send,
  Users,
  Copy,
  Receipt,
  RotateCcw,
} from "lucide-react";
import { SplitBillGroup, SplitParticipant } from "@/types/split-bill";
import { formatRupiah } from "@/lib/utils";

interface SplitBillDetailModalProps {
  bill: SplitBillGroup;
  isOpen: boolean;
  onClose: () => void;
  onUpdateBill: (updatedBill: SplitBillGroup) => void;
}

export default function SplitBillDetailModal({
  bill,
  isOpen,
  onClose,
  onUpdateBill,
}: SplitBillDetailModalProps) {
  const [copiedParticipantId, setCopiedParticipantId] = useState<string | null>(null);
  const [toastText, setToastText] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (text: string) => {
    setToastText(text);
    setTimeout(() => setToastText(null), 2500);
  };

  // Kalkulasi ringkasan pelunasan
  const totalPeserta = bill.peserta.length;
  const lunasPeserta = bill.peserta.filter((p) => p.sudahBayar).length;
  const belumLunasPeserta = totalPeserta - lunasPeserta;

  const totalTerkumpul = bill.peserta
    .filter((p) => p.sudahBayar)
    .reduce((sum, p) => sum + p.bagian, 0);

  const sisaBelumTerkumpul = bill.totalTagihan - totalTerkumpul;
  const percentLunas = Math.round((totalTerkumpul / bill.totalTagihan) * 100);

  // Toggle pembayaran peserta
  const handleToggleParticipant = (participantId: string) => {
    const updatedPeserta = bill.peserta.map((p) => {
      if (p.id !== participantId) return p;
      return { ...p, sudahBayar: !p.sudahBayar };
    });

    const isAllPaid = updatedPeserta.every((p) => p.sudahBayar);

    const updatedBill: SplitBillGroup = {
      ...bill,
      peserta: updatedPeserta,
      status: (isAllPaid ? "selesai" : "aktif") as "aktif" | "selesai",
      updatedAt: new Date().toISOString(),
    };

    onUpdateBill(updatedBill);
    showToast("Status pembayaran diperbarui!");
  };

  // Tandai semua lunas sekaligus
  const handleMarkAllPaid = () => {
    const updatedPeserta = bill.peserta.map((p) => ({ ...p, sudahBayar: true }));
    const updatedBill: SplitBillGroup = {
      ...bill,
      peserta: updatedPeserta,
      status: "selesai",
      updatedAt: new Date().toISOString(),
    };
    onUpdateBill(updatedBill);
    showToast("Semua peserta berhasil ditandai Lunas!");
  };

  // Kirim pengingat WhatsApp ke peserta tertentu
  const handleSendReminder = (participant: SplitParticipant) => {
    const reminderMsg = `Halo ${participant.nama}! Pengingat santai untuk patungan *${bill.judul}* sebesar *${formatRupiah(participant.bagian)}*. Boleh ditransfer saat sempat yaa, terima kasih! 😊`;
    navigator.clipboard.writeText(reminderMsg);
    setCopiedParticipantId(participant.id);
    showToast(`Pesan pengingat untuk ${participant.nama} disalin!`);
    setTimeout(() => setCopiedParticipantId(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
      {/* Toast Mini */}
      {toastText && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-60 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xl">
          {toastText}
        </div>
      )}

      <div className="w-full max-w-md bg-white dark:bg-slate-850 rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border dark:border-slate-700 animate-in slide-in-from-bottom-4 sm:zoom-in-95">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/70 dark:bg-slate-800/60">
          <div className="space-y-0.5 min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  bill.status === "selesai"
                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                    : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                }`}
              >
                {bill.status === "selesai" ? "✓ Lunas Semua" : "⏳ Sedang Berjalan"}
              </span>
              <span className="text-[11px] text-slate-400">
                {bill.metode === "sama_rata" ? "Sama Rata" : "Nominal Bebas"}
              </span>
            </div>
            <h2 className="font-bold text-sm text-slate-900 dark:text-white truncate">
              {bill.judul}
            </h2>
            {bill.namaToko && (
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Store size={12} className="text-slate-400" />
                <span>{bill.namaToko}</span>
                <span>•</span>
                <Calendar size={12} className="text-slate-400" />
                <span>{bill.tanggal}</span>
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 flex items-center justify-center transition shrink-0 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Card Ringkasan Pelunasan Tagihan */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">
                Total Tagihan
              </span>
              <span className="text-lg font-black text-white">
                {formatRupiah(bill.totalTagihan)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  Terkumpul: <strong className="text-emerald-400">{formatRupiah(totalTerkumpul)}</strong>
                </span>
                <span className="font-extrabold text-emerald-400">{percentLunas}%</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${percentLunas}%` }}
                />
              </div>
            </div>

            {/* Sub-metrik Terkumpul & Sisa */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/60 text-xs">
              <div>
                <p className="text-[10px] text-slate-400">Teman Lunas</p>
                <p className="font-bold text-slate-100">
                  {lunasPeserta} dari {totalPeserta} orang
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400">Sisa Belum Lunas</p>
                <p className="font-bold text-amber-400">
                  {formatRupiah(sisaBelumTerkumpul)}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action: Tandai Semua Lunas */}
          {bill.status !== "selesai" && (
            <button
              type="button"
              onClick={handleMarkAllPaid}
              className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition border border-emerald-200 cursor-pointer"
            >
              <CheckCircle2 size={15} />
              <span>Tandai Semua Teman Sudah Lunas</span>
            </button>
          )}

          {/* Daftar Status Bayar Peserta */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Users size={14} className="text-blue-600 dark:text-blue-400" />
                <span>Rincian Peserta ({totalPeserta})</span>
              </h3>
              <span className="text-[10px] text-slate-400">
                Klik status untuk toggle lunas
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-750 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-2xs">
              {bill.peserta.map((peserta) => {
                const isUser = peserta.nama.toLowerCase().includes("kamu");

                return (
                  <div
                    key={peserta.id}
                    className="p-3 flex items-center justify-between gap-2 hover:bg-slate-50/70 dark:hover:bg-slate-750 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          peserta.sudahBayar
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                            : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                        }`}
                      >
                        {peserta.nama.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate flex items-center gap-1">
                          <span>{peserta.nama}</span>
                          {isUser && (
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">(Kamu)</span>
                          )}
                        </p>
                        <p className="text-[11px] font-black text-slate-900 dark:text-white">
                          {formatRupiah(peserta.bagian)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Tombol Reminder WhatsApp jika belum bayar dan bukan user */}
                      {!peserta.sudahBayar && !isUser && (
                        <button
                          type="button"
                          onClick={() => handleSendReminder(peserta)}
                          className="px-2 py-1 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                          title="Salin pesan tagih WhatsApp"
                        >
                          {copiedParticipantId === peserta.id ? (
                            <>
                              <Check size={11} />
                              <span>Disalin</span>
                            </>
                          ) : (
                            <>
                              <Send size={11} />
                              <span>Tagih</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Tombol Status Bayar */}
                      <button
                        type="button"
                        onClick={() => handleToggleParticipant(peserta.id)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer ${
                          peserta.sudahBayar
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60"
                            : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/60"
                        }`}
                      >
                        {peserta.sudahBayar ? (
                          <>
                            <CheckCircle2 size={13} className="text-emerald-700 dark:text-emerald-400" />
                            <span>Lunas</span>
                          </>
                        ) : (
                          <>
                            <Clock size={13} className="text-amber-700 dark:text-amber-400" />
                            <span>Belum</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Catatan Tagihan */}
          {bill.catatan && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Catatan
              </span>
              <p className="text-slate-700 dark:text-slate-300 italic">{bill.catatan}</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer shadow-md"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
