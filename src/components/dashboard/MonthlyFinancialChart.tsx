"use client";

import React, { useState } from "react";
import { BarChart3, PieChart, TrendingUp, ChevronRight } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface MonthlyDataPoint {
  month: string;
  pemasukan: number;
  pengeluaran: number;
}

interface CategoryBreakdown {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export default function MonthlyFinancialChart() {
  const [viewMode, setViewMode] = useState<"comparison" | "category">("comparison");
  const [hoveredMonth, setHoveredMonth] = useState<MonthlyDataPoint | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryBreakdown | null>(null);

  // Data 6 bulan terakhir
  const monthlyData: MonthlyDataPoint[] = [
    { month: "Apr", pemasukan: 10500000, pengeluaran: 5200000 },
    { month: "Mei", pemasukan: 11000000, pengeluaran: 6400000 },
    { month: "Jun", pemasukan: 12000000, pengeluaran: 5800000 },
    { month: "Jul", pemasukan: 11500000, pengeluaran: 7100000 },
    { month: "Agu", pemasukan: 13000000, pengeluaran: 6200000 },
    { month: "Sep", pemasukan: 12500000, pengeluaran: 4850000 },
  ];

  // Breakdown pengeluaran bulan September
  const categoryBreakdowns: CategoryBreakdown[] = [
    { name: "Makan & Minum", amount: 1650000, percentage: 34, color: "#f97316" },
    { name: "Belanja Bulanan", amount: 1200000, percentage: 25, color: "#ec4899" },
    { name: "Kopi & Jajan", amount: 620000, percentage: 13, color: "#8b5cf6" },
    { name: "Transportasi", amount: 550000, percentage: 11, color: "#3b82f6" },
    { name: "Tagihan & Pulsa", amount: 480000, percentage: 10, color: "#eab308" },
    { name: "Hiburan & Hobi", amount: 350000, percentage: 7, color: "#06b6d4" },
  ];

  const maxVal = Math.max(
    ...monthlyData.map((d) => Math.max(d.pemasukan, d.pengeluaran))
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/80 shadow-xs space-y-4 transition-colors">
      {/* Header & Mode Switcher */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Grafik Keuangan Bulanan
          </h2>
          <p className="text-[11px] text-slate-400 dark:text-slate-400">
            Pemasukan vs Pengeluaran 6 Bulan Terakhir
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-700 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setViewMode("comparison")}
            type="button"
            className={`px-2.5 py-1 rounded-lg transition ${
              viewMode === "comparison"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            <span className="flex items-center gap-1">
              <BarChart3 size={13} />
              <span>Tren</span>
            </span>
          </button>
          <button
            onClick={() => setViewMode("category")}
            type="button"
            className={`px-2.5 py-1 rounded-lg transition ${
              viewMode === "category"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            <span className="flex items-center gap-1">
              <PieChart size={13} />
              <span>Kategori</span>
            </span>
          </button>
        </div>
      </div>

      {viewMode === "comparison" ? (
        /* MODE 1: PERBANDINGAN PEMASUKAN VS PENGELUARAN (BAR CHART) */
        <div className="space-y-3">
          {/* Legend & Active Tooltip */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  Pemasukan
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" />
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  Pengeluaran
                </span>
              </div>
            </div>

            {/* Hovered Month Info */}
            {hoveredMonth && (
              <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-600 animate-in fade-in">
                {hoveredMonth.month}: Surplus +
                {formatRupiah(hoveredMonth.pemasukan - hoveredMonth.pengeluaran)}
              </div>
            )}
          </div>

          {/* Bar Chart Container */}
          <div className="h-44 w-full flex items-end justify-between gap-2 pt-6 pb-1 px-1 border-b border-slate-100 dark:border-slate-700/60">
            {monthlyData.map((d, index) => {
              const incomeHeight = `${Math.round((d.pemasukan / maxVal) * 100)}%`;
              const expenseHeight = `${Math.round((d.pengeluaran / maxVal) * 100)}%`;
              const isCurrentMonth = index === monthlyData.length - 1;

              return (
                <div
                  key={d.month}
                  onMouseEnter={() => setHoveredMonth(d)}
                  onMouseLeave={() => setHoveredMonth(null)}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                >
                  {/* Tooltip Float on Bar */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -translate-y-24 bg-slate-900 dark:bg-slate-950 text-white text-[10px] p-2 rounded-lg shadow-xl z-20 pointer-events-none whitespace-nowrap border border-white/10">
                    <p className="font-bold text-slate-200">{d.month} 2026</p>
                    <p className="text-emerald-400">
                      Masuk: {formatRupiah(d.pemasukan)}
                    </p>
                    <p className="text-rose-400">
                      Keluar: {formatRupiah(d.pengeluaran)}
                    </p>
                  </div>

                  {/* Dual Bars */}
                  <div className="w-full flex items-end justify-center gap-1 h-32">
                    {/* Bar Pemasukan */}
                    <div
                      className="w-1/2 max-w-[14px] bg-emerald-400/80 group-hover:bg-emerald-500 rounded-t-sm transition-all"
                      style={{ height: incomeHeight }}
                    />
                    {/* Bar Pengeluaran */}
                    <div
                      className="w-1/2 max-w-[14px] bg-rose-400/80 group-hover:bg-rose-500 rounded-t-sm transition-all"
                      style={{ height: expenseHeight }}
                    />
                  </div>

                  {/* Month Label */}
                  <span
                    className={`text-[10px] mt-2 font-medium ${
                      isCurrentMonth
                        ? "text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-1 rounded"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick Stat Summary */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div className="p-2 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-medium block">
                Rata-rata Pemasukan
              </span>
              <span className="font-extrabold text-emerald-950 dark:text-emerald-200 text-xs sm:text-sm">
                {formatRupiah(11750000)}/bln
              </span>
            </div>
            <div className="p-2 bg-rose-50/50 dark:bg-rose-950/30 rounded-xl border border-rose-100 dark:border-rose-900/40">
              <span className="text-[10px] text-rose-800 dark:text-rose-400 font-medium block">
                Rata-rata Pengeluaran
              </span>
              <span className="font-extrabold text-rose-950 dark:text-rose-200 text-xs sm:text-sm">
                {formatRupiah(5925000)}/bln
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* MODE 2: BREAKDOWN KATEGORI PENGELUARAN */
        <div className="space-y-3">
          {/* Multi-segment Horizontal Progress Bar */}
          <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex shadow-inner">
            {categoryBreakdowns.map((cat) => (
              <div
                key={cat.name}
                style={{
                  width: `${cat.percentage}%`,
                  backgroundColor: cat.color,
                }}
                className="h-full hover:opacity-80 transition cursor-pointer"
                title={`${cat.name}: ${cat.percentage}% (${formatRupiah(
                  cat.amount
                )})`}
                onClick={() => setSelectedCategory(cat)}
              />
            ))}
          </div>

          {/* Selected Category Highlight */}
          {selectedCategory && (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedCategory.color }}
                />
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedCategory.name}
                </span>
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white">
                {formatRupiah(selectedCategory.amount)} ({selectedCategory.percentage}%)
              </span>
            </div>
          )}

          {/* List Kategori Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {categoryBreakdowns.map((cat) => (
              <div
                key={cat.name}
                onClick={() => setSelectedCategory(cat)}
                className="p-2 rounded-xl border border-slate-100 dark:border-slate-700/60 hover:border-slate-200 dark:hover:border-slate-600 bg-slate-50/40 dark:bg-slate-900/40 cursor-pointer flex items-center justify-between text-xs transition"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-medium truncate text-[11px]">
                    {cat.name}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-slate-900 dark:text-white shrink-0">
                  {cat.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
