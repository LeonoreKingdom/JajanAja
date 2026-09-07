"use client";

import React, { useState } from "react";
import {
  Camera,
  ChevronRight,
  Filter,
  MessageSquare,
  Plus,
  Search,
  Tag,
  Wallet,
  X,
} from "lucide-react";
import { Asset, Category, Transaction, TransactionType } from "@/types/finance";
import { formatDateIndo, formatRupiah } from "@/lib/utils";
import IconHelper from "@/components/common/IconHelper";

interface TransactionItem extends Transaction {
  kategori: Category;
  aset?: Asset;
}

interface RecentTransactionsProps {
  transactions: TransactionItem[];
  onViewAll?: () => void;
  onAddTransaction?: () => void;
}

export default function RecentTransactions({
  transactions,
  onViewAll,
  onAddTransaction,
}: RecentTransactionsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"semua" | TransactionType>("semua");
  const [filterSource, setFilterSource] = useState<string>("semua");
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);

  // Filter logika transaksi
  const filteredList = transactions.filter((tx) => {
    // Filter tipe
    if (filterType !== "semua" && tx.tipe !== filterType) return false;

    // Filter sumber
    if (filterSource !== "semua" && tx.sumber !== filterSource) return false;

    // Filter search query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchCatatan = tx.catatan?.toLowerCase().includes(q);
      const matchCategory = tx.kategori.nama.toLowerCase().includes(q);
      const matchLabel = tx.label?.toLowerCase().includes(q);
      const matchAsset = tx.aset?.nama.toLowerCase().includes(q);
      if (!matchCatatan && !matchCategory && !matchLabel && !matchAsset) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/80 shadow-xs space-y-3 transition-colors">
      {/* Header & Riwayat Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Daftar Transaksi Terbaru
          </h2>
          <p className="text-[11px] text-slate-400 dark:text-slate-400">
            {filteredList.length} dari {transactions.length} transaksi ditampilkan
          </p>
        </div>

        <button
          onClick={onViewAll}
          type="button"
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-0.5"
        >
          <span>Riwayat</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Bar Pencarian & Filter Cepat */}
      <div className="space-y-2">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <input
            type="text"
            placeholder="Cari transaksi (kopi, makan, gaji...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-8 py-1.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-[11px]">
          <button
            onClick={() => setFilterType("semua")}
            type="button"
            className={`px-2.5 py-1 rounded-full font-semibold shrink-0 transition ${
              filterType === "semua"
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterType("pengeluaran")}
            type="button"
            className={`px-2.5 py-1 rounded-full font-semibold shrink-0 transition ${
              filterType === "pengeluaran"
                ? "bg-rose-600 text-white"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40"
            }`}
          >
            JajanAja (Keluar)
          </button>
          <button
            onClick={() => setFilterType("pemasukan")}
            type="button"
            className={`px-2.5 py-1 rounded-full font-semibold shrink-0 transition ${
              filterType === "pemasukan"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
            }`}
          >
            NabungAja (Masuk)
          </button>

          {/* Filter Sumber Dropdown Mini */}
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full font-semibold shrink-0 text-[11px] border-none focus:outline-none"
          >
            <option value="semua">Semua Sumber</option>
            <option value="manual">Manual</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="pindai-struk">Scan Struk</option>
          </select>
        </div>
      </div>

      {/* Konten Daftar Transaksi */}
      {filteredList.length === 0 ? (
        <div className="text-center py-7 px-4 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Tidak ada transaksi yang cocok
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Coba ubah kata kunci atau filter pencarianmu.
          </p>
          {(searchQuery || filterType !== "semua" || filterSource !== "semua") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterType("semua");
                setFilterSource("semua");
              }}
              className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {filteredList.map((tx) => {
            const isExpense = tx.tipe === "pengeluaran";

            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-50/80 dark:hover:bg-slate-700/40 rounded-xl px-2 -mx-2 transition cursor-pointer"
              >
                {/* Left: Icon & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                    style={{ backgroundColor: tx.kategori.warna }}
                  >
                    <IconHelper name={tx.kategori.ikon} size={18} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {tx.catatan || tx.kategori.nama}
                      </p>

                      {/* Source Badges */}
                      {tx.sumber === "whatsapp" && (
                        <span
                          title="Dicatat otomatis via pesan WhatsApp"
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                        >
                          <MessageSquare size={9} />
                          <span>WA</span>
                        </span>
                      )}
                      {tx.sumber === "pindai-struk" && (
                        <span
                          title="Dicatat dari foto struk belanja"
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200"
                        >
                          <Camera size={9} />
                          <span>Struk</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      <span>{tx.kategori.nama}</span>
                      {tx.aset && (
                        <>
                          <span>•</span>
                          <span>{tx.aset.nama}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{formatDateIndo(tx.tanggal)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount */}
                <div className="text-right shrink-0">
                  <span
                    className={`text-xs sm:text-sm font-bold block ${
                      isExpense ? "text-rose-600" : "text-emerald-600"
                    }`}
                  >
                    {isExpense ? "-" : "+"}
                    {formatRupiah(tx.jumlah)}
                  </span>
                  {tx.label && (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/80 px-1.5 py-0.5 rounded font-medium inline-block mt-0.5">
                      #{tx.label}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detail Transaksi */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-5 space-y-4 border border-slate-100 dark:border-slate-700/80">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Detail Transaksi
              </span>
              <button
                onClick={() => setSelectedTx(null)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white"
              >
                <X size={15} />
              </button>
            </div>

            <div className="text-center py-2">
              <div
                className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-white mb-2 shadow-sm"
                style={{ backgroundColor: selectedTx.kategori.warna }}
              >
                <IconHelper name={selectedTx.kategori.ikon} size={28} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {selectedTx.catatan || selectedTx.kategori.nama}
              </h3>
              <p
                className={`text-2xl font-black mt-1 ${
                  selectedTx.tipe === "pengeluaran"
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {selectedTx.tipe === "pengeluaran" ? "-" : "+"}
                {formatRupiah(selectedTx.jumlah)}
              </p>
            </div>

            <div className="space-y-2.5 bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl text-xs border border-slate-100 dark:border-slate-700/60">
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-400 font-medium">Kategori:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedTx.kategori.nama}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-400 font-medium">Akun / Aset:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedTx.aset?.nama || "Tidak ditentukan"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-400 font-medium">Sumber:</span>
                <span className="font-bold capitalize text-slate-800 dark:text-slate-200">
                  {selectedTx.sumber === "whatsapp"
                    ? "WhatsApp Cloud API"
                    : selectedTx.sumber === "pindai-struk"
                    ? "Pindai Struk AI"
                    : "Pencatatan Manual"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-400 font-medium">Waktu:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formatDateIndo(selectedTx.tanggal)}
                </span>
              </div>
              {selectedTx.label && (
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-slate-400 font-medium">Label:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    #{selectedTx.label}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-2.5 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-emerald-500 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
