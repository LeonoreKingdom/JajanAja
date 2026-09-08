"use client";

import React from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { Budget, Category } from "@/types/finance";
import IconHelper from "@/components/common/IconHelper";
import { AlertCircle, ArrowUpRight, Edit2, Plus } from "lucide-react";

interface BudgetCategoryCardProps {
  budget: Budget & { kategori: Category };
  onEdit: (budget: Budget & { kategori: Category }) => void;
}

export default function BudgetCategoryCard({
  budget,
  onEdit,
}: BudgetCategoryCardProps) {
  const { batasJumlah, terpakai, kategori } = budget;
  const sisa = Math.max(0, batasJumlah - terpakai);
  const persentase =
    batasJumlah > 0 ? Math.round((terpakai / batasJumlah) * 100) : 0;

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const remainingDays = Math.max(1, daysInMonth - now.getDate() + 1);
  const dailyLimit = Math.max(0, Math.round(sisa / remainingDays));

  const isOver = terpakai > batasJumlah;
  const isCritical = persentase >= 90 && !isOver;
  const isWarning = persentase >= 75 && persentase < 90;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md transition space-y-3">
      {/* Header Bar: Icon, Name, and Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
            style={{ backgroundColor: kategori.warna }}
          >
            <IconHelper name={kategori.ikon} size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{kategori.nama}</h3>
            <span className="text-[11px] text-slate-400">
              Sisa hari: {remainingDays} hari
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
              isOver
                ? "bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400"
                : isCritical
                ? "bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300"
                : isWarning
                ? "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
                : "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
            }`}
          >
            {isOver
              ? "Overbudget"
              : isCritical
              ? "Hampir Habis"
              : isWarning
              ? "Waspada"
              : "Aman"}
          </span>

          <button
            type="button"
            onClick={() => onEdit(budget)}
            className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
            title="Edit Pagu Budget"
          >
            <Edit2 size={13} />
          </button>
        </div>
      </div>

      {/* Rincian Angka: Terpakai vs Batas Pagu */}
      <div className="flex items-end justify-between pt-1">
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Terpakai</span>
          <span className="text-base font-extrabold text-slate-900 dark:text-white">
            {formatRupiah(terpakai)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-slate-400 block font-medium">
            {isOver ? "Kelebihan" : "Sisa Pagu"}
          </span>
          <span
            className={`text-sm font-bold ${
              isOver ? "text-rose-600 dark:text-rose-400 font-black" : "text-slate-700 dark:text-slate-300"
            }`}
          >
            {isOver
              ? `+${formatRupiah(terpakai - batasJumlah)}`
              : formatRupiah(sisa)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
          <span>Pagu: {formatRupiah(batasJumlah)}</span>
          <span
            className={
              isOver
                ? "text-rose-600 dark:text-rose-400 font-bold"
                : isWarning
                ? "text-amber-600 dark:text-amber-400 font-bold"
                : "text-slate-600 dark:text-slate-400"
            }
          >
            {persentase}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isOver
                ? "bg-rose-500"
                : isCritical
                ? "bg-orange-500"
                : isWarning
                ? "bg-amber-500"
                : "bg-emerald-500"
            }`}
            style={{ width: `${Math.min(100, persentase)}%` }}
          />
        </div>
      </div>

      {/* Batas Harian Aman per Pos */}
      {!isOver && sisa > 0 && (
        <div className="flex items-center justify-between text-[11px] bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400">
          <span>Batas jajan aman pos ini:</span>
          <span className="font-bold text-slate-900 dark:text-white">{formatRupiah(dailyLimit)} / hari</span>
        </div>
      )}

      {/* Peringatan jika melebihi batas atau kritis */}
      {isOver && (
        <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 rounded-xl border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300 font-semibold animate-in fade-in">
          <AlertCircle size={15} className="shrink-0 text-rose-600 dark:text-rose-400" />
          <span>Pengeluaran melebihi pagu sebesar {formatRupiah(terpakai - batasJumlah)}!</span>
        </div>
      )}
      {isCritical && (
        <div className="p-2 bg-orange-50 dark:bg-orange-950/50 rounded-xl border border-orange-200 dark:border-orange-800 flex items-center gap-1.5 text-[11px] text-orange-800 dark:text-orange-300 font-semibold animate-in fade-in">
          <AlertCircle size={14} className="shrink-0 text-orange-600 dark:text-orange-400" />
          <span>Pagu pos hampir habis (terpakai {persentase}%). Rem belanja!</span>
        </div>
      )}

      {/* Action footer */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <Link
          href={`/transaksi`}
          className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold flex items-center gap-1 hover:underline"
        >
          <Plus size={13} />
          <span>Catat Belanja</span>
        </Link>

        <button
          type="button"
          onClick={() => onEdit(budget)}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold flex items-center gap-0.5 hover:underline"
        >
          <span>Ubah Pagu</span>
          <ArrowUpRight size={13} />
        </button>
      </div>
    </div>
  );
}
