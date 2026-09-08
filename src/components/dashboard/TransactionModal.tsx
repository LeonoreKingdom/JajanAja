"use client";

import React, { useState } from "react";
import { X, Check, AlertCircle } from "lucide-react";
import { Asset, Category, Transaction, TransactionType } from "@/types/finance";
import IconHelper from "@/components/common/IconHelper";
import { formatRupiah } from "@/lib/utils";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: TransactionType;
  categories: Category[];
  assets: Asset[];
  onSave: (transaction: {
    tipe: TransactionType;
    jumlah: number;
    categoryId: string;
    assetId: string;
    catatan: string;
  }) => void;
}

export default function TransactionModal({
  isOpen,
  onClose,
  type,
  categories,
  assets,
  onSave,
}: TransactionModalProps) {
  const [jumlah, setJumlah] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>(
    categories.find((c) => c.tipe === type)?.id || categories[0]?.id || ""
  );
  const [assetId, setAssetId] = useState<string>(assets[0]?.id || "");
  const [catatan, setCatatan] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isExpense = type === "pengeluaran";
  const filteredCategories = categories.filter((c) => c.tipe === type);
  const selectedAsset = assets.find((a) => a.id === assetId) || assets[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseInt(jumlah.replace(/\D/g, ""), 10) || 0;

    if (!parsedAmount || parsedAmount < 500) {
      setError("Nominal wajib diisi minimal Rp 500.");
      return;
    }

    if (!categoryId) {
      setError("Kategori wajib dipilih.");
      return;
    }

    if (!assetId) {
      setError("Aset sumber/tujuan wajib dipilih.");
      return;
    }

    if (isExpense && selectedAsset && parsedAmount > selectedAsset.saldo) {
      setError(`Saldo ${selectedAsset.nama} tidak mencukupi (Tersisa ${formatRupiah(selectedAsset.saldo)}).`);
      return;
    }

    onSave({
      tipe: type,
      jumlah: parsedAmount,
      categoryId,
      assetId,
      catatan: catatan.trim(),
    });

    setJumlah("");
    setCatatan("");
    setError(null);
    onClose();
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    if (!rawVal) {
      setJumlah("");
      setError(null);
      return;
    }
    const formatted = new Intl.NumberFormat("id-ID").format(parseInt(rawVal, 10));
    setJumlah(formatted);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-100 dark:border-slate-800">
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isExpense ? "bg-rose-500" : "bg-emerald-500"
              }`}
            />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {isExpense ? "Catat JajanAja (Pengeluaran)" : "Catat NabungAja (Pemasukan)"}
            </h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
          {/* Nominal Input */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Nominal (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                placeholder="0"
                value={jumlah}
                onChange={handleAmountChange}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-2xl font-black text-slate-900 dark:text-white tracking-tight"
                autoFocus
              />
            </div>
          </div>

          {/* Kategori Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Pilih Kategori
            </label>
            <div className="grid grid-cols-3 gap-2">
              {filteredCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition text-left ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 ring-1 ring-emerald-500"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: cat.warna }}
                    >
                      <IconHelper name={cat.ikon} size={14} />
                    </div>
                    <span className="truncate">{cat.nama}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sumber Aset / Dompet */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              {isExpense ? "Bayar Dari Aset" : "Masuk Ke Aset"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {assets.map((ast) => {
                const isSelected = assetId === ast.id;
                return (
                  <button
                    key={ast.id}
                    type="button"
                    onClick={() => setAssetId(ast.id)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 ring-1 ring-emerald-500"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <div className="font-bold truncate">{ast.nama}</div>
                    <div className="text-[10px] text-slate-400 capitalize">
                      {ast.jenis}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Catatan / Keterangan */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Catatan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Kopi bareng tim, Makan siang padang..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Pesan Validasi Error */}
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 animate-in fade-in">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Tombol Simpan */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-[0.99] ${
                isExpense
                  ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200 dark:shadow-none"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 dark:shadow-none"
              }`}
            >
              <Check size={18} />
              <span>Simpan Transaksi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
