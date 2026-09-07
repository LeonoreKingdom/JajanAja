"use client";

import React from "react";
import { formatRupiah } from "@/lib/utils";
import { PieChart, ShieldCheck, Sparkles, TrendingUp, AlertTriangle } from "lucide-react";

interface BudgetOverviewCardProps {
  totalBudget: number;
  totalTerpakai: number;
  sisaBudget: number;
  persentaseTerpakai: number;
  periode: string;
}

export default function BudgetOverviewCard({
  totalBudget,
  totalTerpakai,
  sisaBudget,
  persentaseTerpakai,
  periode,
}: BudgetOverviewCardProps) {
  const isOver = totalTerpakai > totalBudget;

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-850 to-slate-900 rounded-3xl p-5 text-white shadow-xl space-y-4 relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
      <div className="absolute top-2 right-4 text-indigo-300/20 font-black text-6xl select-none pointer-events-none">
        50/30/20
      </div>

      {/* Header Info */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <PieChart size={18} />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-indigo-200">
              Pagu Anggaran Bulanan
            </span>
            <h2 className="text-xs text-indigo-300/80 font-medium">{periode}</h2>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
            isOver
              ? "bg-rose-500/20 border-rose-400/30 text-rose-300"
              : persentaseTerpakai >= 80
              ? "bg-amber-500/20 border-amber-400/30 text-amber-300"
              : "bg-emerald-500/20 border-emerald-400/30 text-emerald-300"
          }`}
        >
          {isOver ? (
            <>
              <AlertTriangle size={13} />
              <span>Overbudget</span>
            </>
          ) : (
            <>
              <ShieldCheck size={13} />
              <span>{persentaseTerpakai}% Terpakai</span>
            </>
          )}
        </span>
      </div>

      {/* Nilai Utama */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div>
          <span className="text-xs text-indigo-200/80 block">Total Pagu Budget</span>
          <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {formatRupiah(totalBudget)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-indigo-200/80 block">Sisa Anggaran</span>
          <span
            className={`text-xl sm:text-2xl font-black tracking-tight ${
              isOver ? "text-rose-400" : "text-emerald-400"
            }`}
          >
            {formatRupiah(sisaBudget)}
          </span>
        </div>
      </div>

      {/* Progress Bar Keseluruhan */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-indigo-200/90 font-semibold">
          <span>Terpakai: {formatRupiah(totalTerpakai)}</span>
          <span>{persentaseTerpakai}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-800/80 overflow-hidden p-0.5 border border-indigo-500/20">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOver
                ? "bg-rose-500"
                : persentaseTerpakai >= 80
                ? "bg-gradient-to-r from-amber-500 to-rose-500"
                : "bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-400"
            }`}
            style={{ width: `${Math.min(100, persentaseTerpakai)}%` }}
          />
        </div>
      </div>

      {/* Rekomendasi Alokasi 50/30/20 */}
      <div className="pt-2 border-t border-indigo-800/50 flex items-center justify-between text-[11px] text-indigo-200">
        <span className="flex items-center gap-1 font-semibold">
          <Sparkles size={13} className="text-amber-300" />
          <span>Panduan Cerdas:</span>
        </span>
        <div className="flex items-center gap-2">
          <span className="bg-indigo-800/60 px-2 py-0.5 rounded-md">50% Pokok</span>
          <span className="bg-indigo-800/60 px-2 py-0.5 rounded-md">30% Gaya Hidup</span>
          <span className="bg-indigo-800/60 px-2 py-0.5 rounded-md">20% Tabungan</span>
        </div>
      </div>
    </div>
  );
}
