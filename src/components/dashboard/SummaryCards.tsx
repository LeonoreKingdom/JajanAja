"use client";

import React, { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Eye,
  EyeOff,
  PiggyBank,
  Wallet,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface SummaryCardsProps {
  totalSaldo: number;
  totalPemasukan: number;
  totalPengeluaran: number;
  sisaBudget: number;
  totalBudget: number;
}

export default function SummaryCards({
  totalSaldo,
  totalPemasukan,
  totalPengeluaran,
  sisaBudget,
  totalBudget,
}: SummaryCardsProps) {
  const [showBalance, setShowBalance] = useState(true);

  const percentBudgetLeft = Math.max(
    0,
    Math.round((sisaBudget / totalBudget) * 100)
  );

  return (
    <div className="space-y-3">
      {/* Kartu Utama: Total Saldo Aset */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-5 text-white shadow-md">
        {/* Dekorasi lingkaran background */}
        <div className="absolute -right-8 -top-8 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-teal-400/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between text-slate-300">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-white/10 text-emerald-300">
                <Wallet size={16} />
              </span>
              <span className="text-xs font-medium tracking-wide uppercase">
                Total Saldo Asetku
              </span>
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition"
              title={showBalance ? "Sembunyikan Saldo" : "Tampilkan Saldo"}
              type="button"
            >
              {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {showBalance ? formatRupiah(totalSaldo) : "••••••••••"}
            </div>
          </div>

          {/* Sisa Budget Bar Mini */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <PiggyBank size={14} className="text-emerald-400" />
              <span>Sisa Budget Bulan Ini:</span>
              <span className="font-semibold text-emerald-300">
                {showBalance ? formatRupiah(sisaBudget) : "••••••"}
              </span>
            </div>
            <div className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-[11px]">
              {percentBudgetLeft}% aman
            </div>
          </div>
        </div>
      </div>

      {/* 2 Kolom: Pemasukan & Pengeluaran Bulan Ini */}
      <div className="grid grid-cols-2 gap-3">
        {/* Pemasukan */}
        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/80 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ArrowDownRight size={16} />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pemasukan</span>
          </div>
          <div className="mt-2">
            <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {showBalance ? formatRupiah(totalPemasukan) : "••••••••"}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded inline-block mt-0.5">
              NabungAja
            </span>
          </div>
        </div>

        {/* Pengeluaran */}
        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/80 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <ArrowUpRight size={16} />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pengeluaran</span>
          </div>
          <div className="mt-2">
            <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {showBalance ? formatRupiah(totalPengeluaran) : "••••••••"}
            </div>
            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded inline-block mt-0.5">
              JajanAja
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
