"use client";

import React, { useState } from "react";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Info,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface FinancialConditionSummaryProps {
  totalPemasukan: number;
  totalPengeluaran: number;
  sisaBudget: number;
  totalBudget: number;
}

export default function FinancialConditionSummary({
  totalPemasukan,
  totalPengeluaran,
  sisaBudget,
  totalBudget,
}: FinancialConditionSummaryProps) {
  const [showDetail, setShowDetail] = useState(false);

  // Kalkulasi finansial bulan ini
  const cashflowBersih = totalPemasukan - totalPengeluaran;
  const savingRate =
    totalPemasukan > 0
      ? Math.max(0, Math.round((cashflowBersih / totalPemasukan) * 100))
      : 0;

  // Hitung sisa hari dalam bulan berjalan (asumsi September = 30 hari, hari ke-7)
  const now = new Date();
  const dayOfMonth = now.getDate(); // hari ke-7
  const totalDaysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();
  const remainingDays = Math.max(1, totalDaysInMonth - dayOfMonth);

  // Batas jajan harian aman
  const batasAmanPerHari = Math.max(0, Math.round(sisaBudget / remainingDays));

  // Rata-rata pengeluaran aktual per hari
  const rataRataPengeluaranPerHari = Math.round(
    totalPengeluaran / Math.max(1, dayOfMonth)
  );

  // Status kesehatan keuangan
  let statusBadge = {
    title: "Kondisi Keuangan Sehat",
    desc: "Arus kas surplus & alokasi budget masih dalam batas kendali.",
    color: "bg-emerald-500",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    level: "sehat",
  };

  const budgetUsedPercent =
    totalBudget > 0 ? (totalPengeluaran / totalBudget) * 100 : 0;

  if (budgetUsedPercent > 85 || savingRate < 5) {
    statusBadge = {
      title: "Waspada Pengeluaran",
      desc: "Pengeluaran mendekati batas budget bulanan. Rem pengeluaran jajan!",
      color: "bg-rose-500",
      badgeBg: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
      level: "waspada",
    };
  } else if (budgetUsedPercent > 65 || savingRate < 20) {
    statusBadge = {
      title: "Cukup Stabil",
      desc: "Arus kas positif, tetapi perhatikan pos jajan agar tidak bocor halus.",
      color: "bg-amber-500",
      badgeBg: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      level: "stabil",
    };
  }

  // Data mini tren 7 hari terakhir (dummy realistis)
  const weeklyTrends = [
    { day: "Sen", amount: 85000, height: "45%" },
    { day: "Sel", amount: 45000, height: "25%" },
    { day: "Rab", amount: 120000, height: "65%" },
    { day: "Kam", amount: 65000, height: "35%" },
    { day: "Jum", amount: 180000, height: "90%" },
    { day: "Sab", amount: 145000, height: "75%" },
    { day: "Min", amount: 55000, height: "30%", isToday: true },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs space-y-3.5">
      {/* Header Widget */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Activity size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Ringkasan Kondisi Uang
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-400">
              Evaluasi kesehatan finansial bulan ini
            </p>
          </div>
        </div>

        {/* Badge Status */}
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusBadge.badgeBg}`}
        >
          <span
            className={`w-2 h-2 rounded-full ${statusBadge.color} animate-pulse`}
          />
          {statusBadge.level === "sehat"
            ? "Sehat"
            : statusBadge.level === "stabil"
            ? "Stabil"
            : "Waspada"}
        </span>
      </div>

      {/* Hero Card: Batas Jajan Harian Aman */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-teal-50 via-emerald-50/60 to-cyan-50 dark:from-teal-950/80 dark:via-emerald-950/70 dark:to-teal-950/80 border border-teal-100 dark:border-teal-800/80">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wide flex items-center gap-1">
              <Zap size={13} className="text-teal-600 dark:text-teal-400" />
              Batas Jajan Aman Harian
            </span>
            <div className="text-xl font-extrabold text-teal-950 dark:text-white mt-0.5">
              {formatRupiah(batasAmanPerHari)}
              <span className="text-xs font-semibold text-teal-700 dark:text-teal-300"> / hari</span>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-200 bg-white/80 dark:bg-teal-900/60 px-2 py-0.5 rounded-full border border-teal-200/60 dark:border-teal-700/60">
              <CalendarDays size={12} />
              Sisa {remainingDays} hari
            </span>
            <p className="text-[10px] text-teal-600 dark:text-teal-300/80 mt-1">hingga akhir bulan</p>
          </div>
        </div>

        <p className="text-xs text-teal-900/90 dark:text-teal-100/90 mt-2 font-medium">
          💡 Bila kamu belanja maksimal {formatRupiah(batasAmanPerHari)} per hari,
          budget bulananmu dipastikan tidak akan boncos!
        </p>
      </div>

      {/* 3 Metrik Utama (Grid) */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {/* Arus Kas Bersih */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/80">
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-400 block truncate">
            Surplus Kas
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white block mt-0.5 truncate">
            {formatRupiah(cashflowBersih)}
          </span>
          <div className="flex items-center justify-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
            <TrendingUp size={11} />
            <span>Positif</span>
          </div>
        </div>

        {/* Rasio Tabungan */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/80">
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-400 block truncate">
            Tingkat Tabungan
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white block mt-0.5">
            {savingRate}%
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block mt-1">
            dari income
          </span>
        </div>

        {/* Rata-rata Harian */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/80">
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-400 block truncate">
            Pengeluaran/Hari
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white block mt-0.5 truncate">
            {formatRupiah(rataRataPengeluaranPerHari)}
          </span>
          <div className="flex items-center justify-center gap-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
            <span>aktual</span>
          </div>
        </div>
      </div>

      {/* Mini Bar Chart: Tren Pengeluaran Mingguan */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
            Tren Pengeluaran 7 Hari Terakhir
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-400">Rata-rata Rp 99rb/hari</span>
        </div>

        <div className="flex items-end justify-between gap-1.5 h-20 pt-2 px-1">
          {weeklyTrends.map((item, idx) => (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center gap-1 group relative cursor-pointer"
            >
              {/* Tooltip on hover */}
              <div className="absolute -top-7 hidden group-hover:flex bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap z-20">
                {formatRupiah(item.amount)}
              </div>

              {/* Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-md h-14 flex items-end overflow-hidden">
                <div
                  className={`w-full rounded-t-md transition-all ${
                    item.isToday
                      ? "bg-teal-500 shadow-sm shadow-teal-500/40"
                      : "bg-slate-300 dark:bg-slate-600 group-hover:bg-teal-400"
                  }`}
                  style={{ height: item.height }}
                />
              </div>

              {/* Label Hari */}
              <span
                className={`text-[10px] font-semibold ${
                  item.isToday ? "text-teal-700 dark:text-teal-400 font-bold" : "text-slate-400 dark:text-slate-400"
                }`}
              >
                {item.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Toggle Rincian Edukasi Finansial */}
      <div className="pt-1">
        <button
          onClick={() => setShowDetail(!showDetail)}
          type="button"
          className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-between transition border border-slate-200 dark:border-slate-700 cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Info size={14} className="text-slate-500 dark:text-slate-400" />
            <span>Bagaimana kondisi uangmu dihitung?</span>
          </span>
          {showDetail ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showDetail && (
          <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/90 rounded-xl text-xs text-slate-600 dark:text-slate-300 space-y-1.5 border border-slate-100 dark:border-slate-700 animate-in fade-in">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <span>
                <strong>Surplus Arus Kas:</strong> Pemasukanmu bulan ini (
                {formatRupiah(totalPemasukan)}) melampaui pengeluaran (
                {formatRupiah(totalPengeluaran)}).
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <span>
                <strong>Saving Ratio 61%:</strong> Melebihi standar sehat ideal 20%
                dari pendapatan!
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <span>
                <strong>Sisa Budget:</strong> Dari total alokasi budget{" "}
                {formatRupiah(totalBudget)}, kamu masih menyisakan{" "}
                {formatRupiah(sisaBudget)} untuk {remainingDays} hari ke depan.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
