"use client";

import React from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  PieChart,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { useTransaction } from "@/context/TransactionContext";

interface RunningMonthSummaryProps {
  selectedCategoryId: string;
  inputAmount: number;
  flow: "pengeluaran" | "pemasukan";
}

export default function RunningMonthSummary({
  selectedCategoryId,
  inputAmount,
  flow,
}: RunningMonthSummaryProps) {
  const {
    totalPemasukanBulanIni,
    totalPengeluaranBulanIni,
    sisaBudgetBulanIni,
    totalBudgetBulanIni,
    getCategoryBudgetStatus,
  } = useTransaction();

  const isExpense = flow === "pengeluaran";
  const categoryStatus = getCategoryBudgetStatus(selectedCategoryId);

  // Proyeksi setelah transaksi
  const projectedExpense = isExpense
    ? totalPengeluaranBulanIni + inputAmount
    : totalPengeluaranBulanIni;
  const projectedIncome = !isExpense
    ? totalPemasukanBulanIni + inputAmount
    : totalPemasukanBulanIni;
  const projectedSisaBudget = Math.max(
    0,
    totalBudgetBulanIni - projectedExpense
  );

  // Proyeksi budget kategori
  const currentCategorySpent = categoryStatus ? categoryStatus.terpakai : 0;
  const categoryLimit = categoryStatus ? categoryStatus.batasJumlah : 0;
  const projectedCategorySpent =
    isExpense && categoryStatus
      ? currentCategorySpent + inputAmount
      : currentCategorySpent;

  const currentPercent =
    categoryLimit > 0
      ? Math.min(100, Math.round((currentCategorySpent / categoryLimit) * 100))
      : 0;
  const projectedPercent =
    categoryLimit > 0
      ? Math.min(100, Math.round((projectedCategorySpent / categoryLimit) * 100))
      : 0;

  const isOverBudget = categoryLimit > 0 && projectedCategorySpent > categoryLimit;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <PieChart size={16} />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Ringkasan Bulan Berjalan
            </h2>
            <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-400">
              September 2026
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-800/60">
          Live Sync
        </span>
      </div>

      {/* Grid Status Bulan Berjalan */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/80">
          <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium text-[11px]">
            <ArrowDownRight size={13} />
            <span>Pemasukan Terkumpul</span>
          </div>
          <p className="font-black text-emerald-950 dark:text-white text-xs sm:text-sm mt-0.5">
            {formatRupiah(projectedIncome)}
          </p>
          {!isExpense && inputAmount > 0 && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
              +{formatRupiah(inputAmount)} pending
            </span>
          )}
        </div>

        <div className="p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-800/80">
          <div className="flex items-center gap-1 text-rose-700 dark:text-rose-400 font-medium text-[11px]">
            <ArrowUpRight size={13} />
            <span>Pengeluaran Bulan Ini</span>
          </div>
          <p className="font-black text-rose-950 dark:text-white text-xs sm:text-sm mt-0.5">
            {formatRupiah(projectedExpense)}
          </p>
          {isExpense && inputAmount > 0 && (
            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold block mt-0.5">
              +{formatRupiah(inputAmount)} akan dicatat
            </span>
          )}
        </div>
      </div>

      {/* Detail Budget Kategori Terpilih */}
      {categoryStatus && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span>Pos {categoryStatus.kategori.nama}:</span>
              {isOverBudget ? (
                <span className="text-rose-600 dark:text-rose-400 font-extrabold flex items-center gap-0.5 text-[10px]">
                  <AlertTriangle size={11} /> Over Budget!
                </span>
              ) : (
                <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-0.5 text-[10px]">
                  <ShieldCheck size={11} /> Aman
                </span>
              )}
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">
              {formatRupiah(projectedCategorySpent)} / {formatRupiah(categoryLimit)}
            </span>
          </div>

          {/* Dual Progress Bar: Current vs Projected */}
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative">
            {/* Projected bar */}
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOverBudget ? "bg-rose-500" : "bg-emerald-500"
              }`}
              style={{ width: `${projectedPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
            <span>
              Sisa kuota pos:{" "}
              <strong className={isOverBudget ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-300"}>
                {formatRupiah(Math.max(0, categoryLimit - projectedCategorySpent))}
              </strong>
            </span>
            <span>{projectedPercent}% terpakai</span>
          </div>
        </div>
      )}
    </div>
  );
}
