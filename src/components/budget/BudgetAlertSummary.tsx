"use client";

import React from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Flame, Info } from "lucide-react";
import { Budget, Category } from "@/types/finance";
import { formatRupiah } from "@/lib/utils";

interface BudgetAlertSummaryProps {
  budgets: (Budget & { kategori: Category })[];
}

export default function BudgetAlertSummary({ budgets }: BudgetAlertSummaryProps) {
  const overbudgetItems = budgets.filter((b) => b.terpakai > b.batasJumlah);
  const warningItems = budgets.filter((b) => {
    const pct = b.batasJumlah > 0 ? (b.terpakai / b.batasJumlah) * 100 : 0;
    return pct >= 80 && pct <= 100;
  });
  const safeItems = budgets.filter((b) => {
    const pct = b.batasJumlah > 0 ? (b.terpakai / b.batasJumlah) * 100 : 0;
    return pct < 80;
  });

  if (overbudgetItems.length === 0 && warningItems.length === 0) {
    return (
      <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center gap-3 shadow-2xs">
        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <CheckCircle2 size={18} />
        </div>
        <div className="text-xs">
          <span className="font-extrabold text-emerald-950 block">
            Semua Pos Anggaran Aman! 🎉
          </span>
          <span className="text-emerald-700">
            Total {safeItems.length} pos berada dalam batas pagu yang direncanakan.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Alert Overbudget jika ada */}
      {overbudgetItems.length > 0 && (
        <div className="bg-rose-50/95 border border-rose-200 rounded-2xl p-3.5 flex items-start gap-3 shadow-xs animate-in fade-in">
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
            <Flame size={18} />
          </div>
          <div className="text-xs space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-black text-rose-950">
                {overbudgetItems.length} Pos Melebihi Pagu!
              </span>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-rose-200/80 text-rose-800">
                Peringatan
              </span>
            </div>
            <p className="text-rose-800 leading-relaxed">
              Pos:{" "}
              {overbudgetItems.map((item, idx) => (
                <strong key={item.id}>
                  {item.kategori.nama} (+{formatRupiah(item.terpakai - item.batasJumlah)})
                  {idx < overbudgetItems.length - 1 ? ", " : ""}
                </strong>
              ))}
              . Disarankan evaluasi pengeluaran pos ini.
            </p>
          </div>
        </div>
      )}

      {/* Alert Warning Pos Mendekati Batas jika ada */}
      {warningItems.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-3 shadow-xs animate-in fade-in">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle size={18} />
          </div>
          <div className="text-xs space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-black text-amber-950">
                {warningItems.length} Pos Mendekati Batas (≥80%)
              </span>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-800">
                Perhatian
              </span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              Pos:{" "}
              {warningItems.map((item, idx) => (
                <strong key={item.id}>
                  {item.kategori.nama} (Sisa {formatRupiah(item.batasJumlah - item.terpakai)})
                  {idx < warningItems.length - 1 ? ", " : ""}
                </strong>
              ))}
              . Rem pengeluaran sekunder hingga pergantian bulan.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
