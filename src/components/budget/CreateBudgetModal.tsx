"use client";

import React, { useState } from "react";
import { X, Check, Plus, Target, AlertCircle, Palette } from "lucide-react";
import { Budget, Category } from "@/types/finance";
import { formatRupiah } from "@/lib/utils";
import IconHelper from "../common/IconHelper";
import { defaultExpenseCategories } from "@/server/db/seeds/category.seed";

interface CreateBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingBudgets: (Budget & { kategori: Category })[];
  onSave: (newBudget: Budget & { kategori: Category }) => void;
}

export default function CreateBudgetModal({
  isOpen,
  onClose,
  existingBudgets,
  onSave,
}: CreateBudgetModalProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    defaultExpenseCategories[0]?.id || "cat-1"
  );
  const [rawAmount, setRawAmount] = useState<string>("");
  const [periodeBulan, setPeriodeBulan] = useState<string>(
    new Date().toISOString().slice(0, 7)
  ); // YYYY-MM
  const [error, setError] = useState<string | null>(null);

  // Custom Category creation
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customIcon, setCustomIcon] = useState("Target");
  const [customColor, setCustomColor] = useState("#6366f1");

  if (!isOpen) return null;

  const parsedAmount = parseInt(rawAmount.replace(/\D/g, ""), 10) || 0;

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

  const existingCategoryIds = new Set(existingBudgets.map((b) => b.categoryId));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!parsedAmount || parsedAmount < 10000) {
      setError("Pagu budget minimal Rp 10.000.");
      return;
    }

    let categoryToUse: Category;

    if (isCreatingCustom) {
      if (!customName.trim()) {
        setError("Nama pos kategori wajib diisi.");
        return;
      }
      categoryToUse = {
        id: `custom-cat-${Date.now()}`,
        nama: customName.trim(),
        tipe: "pengeluaran",
        ikon: customIcon,
        warna: customColor,
      };
    } else {
      const found = defaultExpenseCategories.find((c) => c.id === selectedCategoryId);
      if (!found) {
        setError("Kategori wajib dipilih.");
        return;
      }
      if (existingCategoryIds.has(found.id)) {
        setError(`Pos budget untuk '${found.nama}' sudah ada. Silakan edit pos yang sudah ada.`);
        return;
      }
      categoryToUse = found;
    }

    const newBudgetItem: Budget & { kategori: Category } = {
      id: `budget-${Date.now()}`,
      categoryId: categoryToUse.id,
      periodeBulan,
      batasJumlah: parsedAmount,
      terpakai: 0,
      warna: categoryToUse.warna,
      updatedAt: new Date().toISOString(),
      kategori: categoryToUse,
    };

    onSave(newBudgetItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-slate-850 rounded-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto border dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Target size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Tambah Pos Budget Baru
              </h3>
              <p className="text-[11px] text-slate-400">Atur pagu bulanan Budgetin</p>
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
          {/* Toggle Pilih Kategori vs Kustom */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Pilih Pos Kategori
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingCustom(!isCreatingCustom)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                {isCreatingCustom ? "Pilih yang ada" : "+ Buat Kustom"}
              </button>
            </div>

            {!isCreatingCustom ? (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {defaultExpenseCategories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  const alreadyExists = existingCategoryIds.has(cat.id);

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      disabled={alreadyExists}
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        setError(null);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                        alreadyExists
                          ? "opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-700"
                          : isSelected
                          ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 ring-1 ring-indigo-500 shadow-2xs"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750"
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
                        style={{ backgroundColor: cat.warna }}
                      >
                        <IconHelper name={cat.ikon} size={13} />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {cat.nama}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2.5 p-3 rounded-2xl bg-indigo-50/50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 animate-in fade-in">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Nama Pos Kustom
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: Skincare & Perawatan, Gym..."
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Pilih Warna
                  </label>
                  <div className="flex items-center gap-2">
                    {["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#8b5cf6"].map(
                      (color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setCustomColor(color)}
                          className={`w-6 h-6 rounded-full transition-transform ${
                            customColor === color ? "scale-125 ring-2 ring-slate-800 dark:ring-white" : ""
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Nominal Pagu */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Batas Pagu Anggaran (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                placeholder="0"
                value={rawAmount}
                onChange={handleAmountChange}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xl font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 no-scrollbar">
              {[250000, 500000, 1000000, 2000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => addPreset(amt)}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
                >
                  +{formatRupiah(amt).replace("Rp", "").trim()}
                </button>
              ))}
            </div>
          </div>

          {/* Periode Bulan */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Periode Bulan
            </label>
            <input
              type="month"
              value={periodeBulan}
              onChange={(e) => setPeriodeBulan(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-800 animate-in fade-in">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </p>
          )}

          {/* Submit Action */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-200 dark:shadow-none transition"
            >
              <Check size={16} />
              <span>Tambah Pos</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
