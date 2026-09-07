"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Check,
  Target,
  AlertCircle,
  Sliders,
  Sparkles,
  TrendingDown,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Budget, Category } from "@/types/finance";
import { formatRupiah } from "@/lib/utils";
import IconHelper from "../common/IconHelper";

interface EditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: (Budget & { kategori: Category }) | null;
  onSave: (budgetId: string, newLimit: number) => void;
}

export default function EditBudgetModal({
  isOpen,
  onClose,
  budget,
  onSave,
}: EditBudgetModalProps) {
  const [rawLimit, setRawLimit] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (budget) {
      setRawLimit(new Intl.NumberFormat("id-ID").format(budget.batasJumlah));
      setError(null);
    }
  }, [budget]);

  if (!isOpen || !budget) return null;

  const parsedLimit = parseInt(rawLimit.replace(/\D/g, ""), 10) || 0;

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setRawLimit(val ? new Intl.NumberFormat("id-ID").format(parseInt(val, 10)) : "");
    setError(null);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setRawLimit(new Intl.NumberFormat("id-ID").format(val));
    setError(null);
  };

  const applyRecommendation = (type: "plus10" | "minus10" | "adaptive") => {
    let nextVal = budget.batasJumlah;
    if (type === "plus10") {
      nextVal = Math.round((budget.batasJumlah * 1.1) / 10000) * 10000;
    } else if (type === "minus10") {
      nextVal = Math.max(10000, Math.round((budget.batasJumlah * 0.9) / 10000) * 10000);
    } else if (type === "adaptive") {
      nextVal = Math.max(
        50000,
        Math.round(((budget.terpakai > 0 ? budget.terpakai : budget.batasJumlah) * 1.25) / 10000) *
          10000
      );
    }
    setRawLimit(new Intl.NumberFormat("id-ID").format(nextVal));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsedLimit || parsedLimit < 10000) {
      setError("Pagu budget minimal Rp 10.000.");
      return;
    }

    onSave(budget.id, parsedLimit);
    onClose();
  };

  // Kalkulasi proyeksi
  const projectedPersentase =
    parsedLimit > 0 ? Math.round((budget.terpakai / parsedLimit) * 100) : 100;
  const projectedSisa = Math.max(0, parsedLimit - budget.terpakai);
  const isProjectedOver = budget.terpakai > parsedLimit;
  const isProjectedWarning = projectedPersentase >= 80 && !isProjectedOver;

  // Range slider min and max
  const sliderMin = 50000;
  const sliderMax = Math.max(5000000, Math.ceil((budget.batasJumlah * 2) / 500000) * 500000);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
              style={{ backgroundColor: budget.kategori.warna }}
            >
              <IconHelper name={budget.kategori.ikon} size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Ubah Batas Budget
              </h3>
              <p className="text-[11px] text-slate-400">{budget.kategori.nama}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Komparasi Pagu Lama vs Baru */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Pagu Saat Ini</span>
                <span className="font-bold text-slate-700">
                  {formatRupiah(budget.batasJumlah)}
                </span>
              </div>
              <ArrowRight size={14} className="text-slate-400" />
              <div className="text-right">
                <span className="text-indigo-600 font-bold block text-[10px]">
                  Pagu Baru
                </span>
                <span className="font-black text-indigo-700">
                  {formatRupiah(parsedLimit)}
                </span>
              </div>
            </div>

            {/* Live Projected Sisa & Status */}
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Terpakai: <strong>{formatRupiah(budget.terpakai)}</strong>
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isProjectedOver
                    ? "bg-rose-100 text-rose-700"
                    : isProjectedWarning
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {isProjectedOver
                  ? "Overbudget"
                  : `Sisa ${formatRupiah(projectedSisa)} (${projectedPersentase}%)`}
              </span>
            </div>
          </div>

          {/* Input Batas Pagu Baru */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Nominal Pagu Baru (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                value={rawLimit}
                onChange={handleLimitChange}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                autoFocus
              />
            </div>

            {/* Slider Pengatur Pagu Cepat */}
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>Slider Cepat</span>
                <span>{formatRupiah(parsedLimit)}</span>
              </div>
              <input
                type="range"
                min={sliderMin}
                max={sliderMax}
                step={50000}
                value={Math.min(sliderMax, Math.max(sliderMin, parsedLimit))}
                onChange={handleSliderChange}
                className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>{formatRupiah(sliderMin)}</span>
                <span>{formatRupiah(sliderMax)}</span>
              </div>
            </div>
          </div>

          {/* Quick Recommendations */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Sparkles size={12} className="text-amber-500" />
              <span>Rekomendasi Cepat</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => applyRecommendation("minus10")}
                className="p-1.5 bg-slate-100 hover:bg-indigo-50 border border-slate-200 rounded-lg text-slate-700 font-bold text-[11px] flex items-center justify-center gap-0.5 transition"
              >
                <TrendingDown size={12} className="text-emerald-600" />
                <span>-10% Hemat</span>
              </button>
              <button
                type="button"
                onClick={() => applyRecommendation("plus10")}
                className="p-1.5 bg-slate-100 hover:bg-indigo-50 border border-slate-200 rounded-lg text-slate-700 font-bold text-[11px] flex items-center justify-center gap-0.5 transition"
              >
                <TrendingUp size={12} className="text-indigo-600" />
                <span>+10% Longgar</span>
              </button>
              <button
                type="button"
                onClick={() => applyRecommendation("adaptive")}
                className="p-1.5 bg-slate-100 hover:bg-indigo-50 border border-slate-200 rounded-lg text-slate-700 font-bold text-[11px] flex items-center justify-center gap-0.5 transition"
              >
                <Target size={12} className="text-amber-600" />
                <span>Adaptif Aman</span>
              </button>
            </div>
          </div>

          {/* Peringatan jika pagu lebih kecil dari terpakai */}
          {isProjectedOver && (
            <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 flex items-center gap-2 text-xs text-rose-700 font-medium animate-in fade-in">
              <AlertCircle size={14} className="shrink-0 text-rose-600" />
              <span>
                Pagu baru lebih kecil dari total pengeluaran pos ini yang sudah terjadi!
              </span>
            </div>
          )}

          {error && (
            <p className="text-xs font-bold text-rose-600 flex items-center gap-1 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </p>
          )}

          {/* Submit */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-200 transition active:scale-95"
            >
              <Check size={15} />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
