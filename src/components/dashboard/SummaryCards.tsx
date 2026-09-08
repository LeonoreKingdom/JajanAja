"use client";

import React, { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Eye,
  EyeOff,
  PiggyBank,
  Wallet,
  CheckCircle2,
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

  const percentBudgetLeft = totalBudget > 0
    ? Math.max(0, Math.round((sisaBudget / totalBudget) * 100))
    : 100;

  return (
    <>
      {/* ===== TAMPILAN MOBILE (< lg) ===== */}
      <div className="space-y-3 lg:hidden">
        {/* Kartu Utama: Total Saldo Aset */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-5 text-white shadow-md">
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
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition cursor-pointer"
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

        {/* 2 Kolom: Pemasukan & Pengeluaran */}
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

      {/* ===== TAMPILAN DESKTOP (lg:) - 4 METRIC CARDS ROW ===== */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-4">
        {/* Card 1: Total Saldo Asetku */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-5 text-white shadow-md flex flex-col justify-between">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-300">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-white/10 text-emerald-300">
                <Wallet size={18} />
              </span>
              <span className="text-xs font-bold tracking-wide uppercase">
                Total Saldo Aset
              </span>
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition cursor-pointer"
              title={showBalance ? "Sembunyikan Saldo" : "Tampilkan Saldo"}
              type="button"
            >
              {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black tracking-tight">
              {showBalance ? formatRupiah(totalSaldo) : "••••••••••"}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Akumulasi seluruh akun dompet & bank</p>
          </div>
        </div>

        {/* Card 2: Sisa Budget Bulan Ini */}
        <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                <PiggyBank size={18} />
              </div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Sisa Budget
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              {percentBudgetLeft}% Sisa
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {showBalance ? formatRupiah(sisaBudget) : "••••••••"}
            </div>
            <div className="mt-2 w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  percentBudgetLeft < 20
                    ? "bg-rose-500"
                    : percentBudgetLeft < 40
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${percentBudgetLeft}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Pemasukan Bulan Ini */}
        <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <ArrowDownRight size={18} />
              </div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Pemasukan
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
              NabungAja
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {showBalance ? formatRupiah(totalPemasukan) : "••••••••"}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-500" />
              <span>Gaji & pendapatan masuk</span>
            </p>
          </div>
        </div>

        {/* Card 4: Pengeluaran Bulan Ini */}
        <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                <ArrowUpRight size={18} />
              </div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Pengeluaran
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400">
              JajanAja
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {showBalance ? formatRupiah(totalPengeluaran) : "••••••••"}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Total konsumsi & tagihan keluar</p>
          </div>
        </div>
      </div>
    </>
  );
}
