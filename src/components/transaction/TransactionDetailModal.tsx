"use client";

import React, { useState } from "react";
import {
  Calendar,
  Camera,
  Check,
  Clock,
  Copy,
  CreditCard,
  ExternalLink,
  MapPin,
  MessageSquare,
  Share2,
  Tag,
  Trash2,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { formatRupiah, formatDateIndo } from "@/lib/utils";
import { TransactionWithDetails } from "@/context/TransactionContext";
import IconHelper from "@/components/common/IconHelper";

interface TransactionDetailModalProps {
  transaction: TransactionWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onSplitBill?: (tx: TransactionWithDetails) => void;
}

export default function TransactionDetailModal({
  transaction,
  isOpen,
  onClose,
  onDelete,
  onSplitBill,
}: TransactionDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen || !transaction) return null;

  const isExpense = transaction.tipe === "pengeluaran";

  const handleCopySummary = () => {
    const summaryText = `[JajanAja Resi Digital]
${isExpense ? "Pengeluaran (JajanAja)" : "Pemasukan (NabungAja)"}: ${formatRupiah(transaction.jumlah)}
Kategori: ${transaction.kategori.nama}
Akun: ${transaction.aset?.nama || "-"}
Waktu: ${formatDateIndo(transaction.tanggal)}
Catatan: ${transaction.catatan || "-"}
Dicatat via JajanAja Teman Finansial`;

    navigator.clipboard?.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(transaction.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100 dark:border-slate-800">
        {/* Header Resi Digital */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
              Resi Transaksi
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content Resi */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Nominal & Kategori Banner */}
          <div className="text-center py-2">
            <div
              className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-white mb-2 shadow-md"
              style={{ backgroundColor: transaction.kategori.warna }}
            >
              <IconHelper name={transaction.kategori.ikon} size={28} />
            </div>

            <span
              className={`inline-block text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full mb-1 ${
                isExpense
                  ? "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                  : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              }`}
            >
              {isExpense ? "JajanAja (Pengeluaran)" : "NabungAja (Pemasukan)"}
            </span>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isExpense ? "-" : "+"}
              {formatRupiah(transaction.jumlah)}
            </h3>

            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
              {transaction.catatan || transaction.kategori.nama}
            </p>
          </div>

          {/* Rincian Spesifikasi Transaksi (Struk Layout) */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Kategori:</span>
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: transaction.kategori.warna }}
                />
                <span>{transaction.kategori.nama}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">
                {isExpense ? "Sumber Aset:" : "Masuk Ke Aset:"}
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Wallet size={12} className="text-slate-400" />
                <span>{transaction.aset?.nama || "Dompet Utama"}</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Waktu Transaksi:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar size={12} className="text-slate-400" />
                <span>{formatDateIndo(transaction.tanggal)}</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Metode Input:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                {transaction.sumber === "whatsapp" && (
                  <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded text-[10px] border border-emerald-200 dark:border-emerald-800">
                    <MessageSquare size={10} />
                    WhatsApp
                  </span>
                )}
                {transaction.sumber === "pindai-struk" && (
                  <span className="inline-flex items-center gap-1 text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.2 rounded text-[10px] border border-indigo-200 dark:border-indigo-800">
                    <Camera size={10} />
                    Pindai Struk AI
                  </span>
                )}
                {transaction.sumber === "manual" && (
                  <span className="text-slate-600 dark:text-slate-300 font-medium text-[11px]">
                    Input Manual
                  </span>
                )}
              </span>
            </div>

            {transaction.label && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-400 font-medium">Label / Tag:</span>
                <span className="font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded text-[10px]">
                  #{transaction.label}
                </span>
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopySummary}
              className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-600" />
                  <span className="text-emerald-700 dark:text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Salin Resi</span>
                </>
              )}
            </button>

            {isExpense && onSplitBill ? (
              <button
                type="button"
                onClick={() => onSplitBill(transaction)}
                className="py-2.5 px-3 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 border border-amber-200 dark:border-amber-800"
              >
                <Users size={14} />
                <span>Split Bill</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-3 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-blue-700 transition active:scale-95"
              >
                Selesai
              </button>
            )}
          </div>

          {/* Delete Action Section */}
          {onDelete && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              {confirmDelete ? (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 rounded-xl border border-rose-200 dark:border-rose-800 text-center space-y-2 animate-in fade-in">
                  <p className="text-xs font-bold text-rose-800 dark:text-rose-300">
                    Yakin ingin menghapus transaksi ini?
                  </p>
                  <p className="text-[10px] text-rose-600 dark:text-rose-400">
                    Saldo aset dan alokasi budget akan dikembalikan (rollback).
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex-1 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition"
                    >
                      Ya, Hapus
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="w-full py-2 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Trash2 size={13} />
                  <span>Hapus Transaksi Ini</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
