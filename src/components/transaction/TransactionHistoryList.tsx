"use client";

import React, { useState } from "react";
import {
  Calendar,
  Camera,
  Check,
  MessageSquare,
  ReceiptText,
  Trash2,
  X,
} from "lucide-react";
import { formatRupiah, formatDateIndo } from "@/lib/utils";
import { useTransaction, TransactionWithDetails } from "@/context/TransactionContext";
import IconHelper from "@/components/common/IconHelper";
import TransactionDetailModal from "./TransactionDetailModal";

interface TransactionHistoryListProps {
  onSelectTransaction?: (tx: TransactionWithDetails) => void;
}

export default function TransactionHistoryList({
  onSelectTransaction,
}: TransactionHistoryListProps) {
  const {
    transactions,
    totalPemasukanBulanIni,
    totalPengeluaranBulanIni,
    deleteTransaction,
  } = useTransaction();

  const [filter, setFilter] = useState<"semua" | "pengeluaran" | "pemasukan">("semua");
  const [deleteIdConfirm, setDeleteIdConfirm] = useState<string | null>(null);
  const [selectedTxDetail, setSelectedTxDetail] =
    useState<TransactionWithDetails | null>(null);

  const filtered = transactions.filter((t) => {
    if (filter === "semua") return true;
    return t.tipe === filter;
  });

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    setDeleteIdConfirm(null);
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3.5">
      {/* Header & Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ReceiptText size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Riwayat Transaksi Bulan Ini
            </h2>
            <p className="text-[11px] text-slate-400">
              {filtered.length} Transaksi Tercatat
            </p>
          </div>
        </div>

        {/* Filter Switcher */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded-xl text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setFilter("semua")}
            className={`px-2 py-0.5 rounded-lg transition ${
              filter === "semua"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-500"
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setFilter("pengeluaran")}
            className={`px-2 py-0.5 rounded-lg transition ${
              filter === "pengeluaran"
                ? "bg-white text-rose-700 shadow-2xs font-bold"
                : "text-slate-500"
            }`}
          >
            Keluar
          </button>
          <button
            type="button"
            onClick={() => setFilter("pemasukan")}
            className={`px-2 py-0.5 rounded-lg transition ${
              filter === "pemasukan"
                ? "bg-white text-emerald-700 shadow-2xs font-bold"
                : "text-slate-500"
            }`}
          >
            Masuk
          </button>
        </div>
      </div>

      {/* Ringkasan Header Mini */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] text-slate-400 font-medium">
            Total Pemasukan
          </span>
          <p className="text-xs font-bold text-emerald-600 mt-0.5">
            +{formatRupiah(totalPemasukanBulanIni)}
          </p>
        </div>
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] text-slate-400 font-medium">
            Total Pengeluaran
          </span>
          <p className="text-xs font-bold text-rose-600 mt-0.5">
            -{formatRupiah(totalPengeluaranBulanIni)}
          </p>
        </div>
      </div>

      {/* List Item Transaksi */}
      {filtered.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-xs">
          Tidak ada transaksi pada filter ini.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filtered.map((tx) => {
            const isExpense = tx.tipe === "pengeluaran";
            const isConfirming = deleteIdConfirm === tx.id;

            return (
              <div
                key={tx.id}
                className="py-3 flex items-center justify-between gap-2.5 group"
              >
                {/* Left: Icon & Title */}
                <div
                  onClick={() => {
                    setSelectedTxDetail(tx);
                    onSelectTransaction?.(tx);
                  }}
                  className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                    style={{ backgroundColor: tx.kategori.warna }}
                  >
                    <IconHelper name={tx.kategori.ikon} size={16} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {tx.catatan || tx.kategori.nama}
                      </p>
                      {tx.sumber === "whatsapp" && (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-200">
                          WA
                        </span>
                      )}
                      {tx.sumber === "pindai-struk" && (
                        <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1 rounded border border-indigo-200">
                          Struk
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {tx.kategori.nama} • {tx.aset?.nama || "Aset"} •{" "}
                      {formatDateIndo(tx.tanggal)}
                    </p>
                  </div>
                </div>

                {/* Right: Nominal & Delete Action */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-xs font-bold block ${
                        isExpense ? "text-rose-600" : "text-emerald-600"
                      }`}
                    >
                      {isExpense ? "-" : "+"}
                      {formatRupiah(tx.jumlah)}
                    </span>
                    {tx.label && (
                      <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded font-medium inline-block">
                        #{tx.label}
                      </span>
                    )}
                  </div>

                  {/* Tombol Hapus */}
                  {isConfirming ? (
                    <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-200 animate-in fade-in">
                      <button
                        type="button"
                        onClick={() => handleDelete(tx.id)}
                        className="w-6 h-6 rounded bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 transition shadow-xs"
                        title="Ya, hapus transaksi"
                      >
                        <Check size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteIdConfirm(null)}
                        className="w-6 h-6 rounded bg-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-300 transition"
                        title="Batal"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteIdConfirm(tx.id)}
                      className="w-7 h-7 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition"
                      title="Hapus transaksi"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detail Transaksi & Resi Digital */}
      <TransactionDetailModal
        transaction={selectedTxDetail}
        isOpen={!!selectedTxDetail}
        onClose={() => setSelectedTxDetail(null)}
        onDelete={(id) => deleteTransaction(id)}
      />
    </div>
  );
}
