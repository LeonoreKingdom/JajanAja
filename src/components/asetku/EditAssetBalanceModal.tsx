"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Wallet, AlertCircle } from "lucide-react";
import { Asset } from "@/types/finance";
import { formatRupiah } from "@/lib/utils";

interface EditAssetBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  onSave: (assetId: string, newBalance: number, recordAdjustment?: boolean) => void;
}

export default function EditAssetBalanceModal({
  isOpen,
  onClose,
  asset,
  onSave,
}: EditAssetBalanceModalProps) {
  const [rawAmount, setRawAmount] = useState("");
  const [recordAdjustment, setRecordAdjustment] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (asset) {
      setRawAmount(new Intl.NumberFormat("id-ID").format(asset.saldo));
      setRecordAdjustment(true);
      setError(null);
    }
  }, [asset]);

  if (!isOpen || !asset) return null;

  const parsedAmount = parseInt(rawAmount.replace(/\D/g, ""), 10) || 0;
  const diff = parsedAmount - asset.saldo;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setRawAmount(val ? new Intl.NumberFormat("id-ID").format(parseInt(val, 10)) : "");
    setError(null);
  };

  const addPreset = (amt: number) => {
    const next = parsedAmount + amt;
    setRawAmount(new Intl.NumberFormat("id-ID").format(next));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount < 0) {
      setError("Saldo tidak boleh bernilai negatif.");
      return;
    }

    onSave(asset.id, parsedAmount, recordAdjustment && diff !== 0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-slate-850 rounded-3xl p-5 space-y-4 shadow-2xl border dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Wallet size={17} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Sesuaikan Saldo {asset.nama}
              </h3>
              <p className="text-[11px] text-slate-400 capitalize">{asset.jenis}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Saldo Tercatat Saat Ini:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {formatRupiah(asset.saldo)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Saldo Baru Sebenarnya (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                value={rawAmount}
                onChange={handleAmountChange}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xl font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                autoFocus
              />
            </div>

            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 no-scrollbar">
              {[50000, 100000, 500000, 1000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => addPreset(amt)}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
                >
                  +{formatRupiah(amt).replace("Rp", "").trim()}
                </button>
              ))}
            </div>
          </div>

          {/* Selisih Indicator */}
          <div
            className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
              diff > 0
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300"
                : diff < 0
                ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-300"
                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
            }`}
          >
            <span className="font-medium">Selisih Penyesuaian:</span>
            <span className="font-black">
              {diff > 0 ? `+${formatRupiah(diff)}` : diff < 0 ? `-${formatRupiah(Math.abs(diff))}` : "Rp 0 (Sama)"}
            </span>
          </div>

          {/* Opsi Catat Riwayat Transaksi Penyesuaian */}
          {diff !== 0 && (
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={recordAdjustment}
                onChange={(e) => setRecordAdjustment(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Catat selisih sebagai transaksi penyesuaian
                </span>
                <span className="text-slate-500 dark:text-slate-400 block leading-tight">
                  {diff > 0
                    ? `Akan mencatat pemasukan sebesar ${formatRupiah(diff)} pada riwayat.`
                    : `Akan mencatat pengeluaran sebesar ${formatRupiah(Math.abs(diff))} pada riwayat.`}
                </span>
              </div>
            </label>
          )}

          {error && (
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-800">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-200 dark:shadow-none transition"
            >
              <Check size={16} />
              <span>Simpan Saldo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
