"use client";

import React from "react";
import { ChevronRight, Target } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { Category } from "@/types/finance";
import IconHelper from "@/components/common/IconHelper";

interface BudgetItem {
  id: string;
  categoryId: string;
  periodeBulan: string;
  batasJumlah: number;
  terpakai: number;
  kategori: Category;
}

interface BudgetOverviewProps {
  budgets: BudgetItem[];
  onManageBudget?: () => void;
}

export default function BudgetOverview({
  budgets,
  onManageBudget,
}: BudgetOverviewProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/80 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Target size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Budgetin (Pos Bulanan)
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-400">Pantau batas belanja</p>
          </div>
        </div>

        <button
          onClick={onManageBudget}
          type="button"
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-0.5"
        >
          <span>Kelola</span>
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="space-y-3.5">
        {budgets.map((item) => {
          const percentage = Math.min(
            100,
            Math.round((item.terpakai / item.batasJumlah) * 100)
          );

          // Tentukan warna progress bar
          let barColor = "bg-emerald-500";
          let badgeColor = "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60";

          if (percentage >= 80) {
            barColor = "bg-rose-500";
            badgeColor = "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60";
          } else if (percentage >= 65) {
            barColor = "bg-amber-500";
            badgeColor = "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60";
          }

          return (
            <div key={item.id} className="group">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: item.kategori.warna }}
                  >
                    <IconHelper name={item.kategori.ikon} size={13} />
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {item.kategori.nama}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">
                    <strong className="text-slate-800 dark:text-slate-100">
                      {formatRupiah(item.terpakai)}
                    </strong>{" "}
                    / {formatRupiah(item.batasJumlah)}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${badgeColor}`}
                  >
                    {percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
