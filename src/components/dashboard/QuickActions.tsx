"use client";

import React from "react";
import { Camera, MessageSquare, MinusCircle, PlusCircle, Users } from "lucide-react";

interface QuickActionsProps {
  onAddExpense?: () => void;
  onAddIncome?: () => void;
  onScanReceipt?: () => void;
  onSplitBill?: () => void;
  onWhatsApp?: () => void;
}

export default function QuickActions({
  onAddExpense,
  onAddIncome,
  onScanReceipt,
  onSplitBill,
  onWhatsApp,
}: QuickActionsProps) {
  const actions = [
    {
      id: "expense",
      label: "JajanAja",
      sublabel: "Pengeluaran",
      icon: MinusCircle,
      bg: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 border-rose-100 dark:border-rose-900/30",
      onClick: onAddExpense,
    },
    {
      id: "income",
      label: "NabungAja",
      sublabel: "Pemasukan",
      icon: PlusCircle,
      bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border-emerald-100 dark:border-emerald-900/30",
      onClick: onAddIncome,
    },
    {
      id: "receipt",
      label: "Scan Struk",
      sublabel: "Otomatis AI",
      icon: Camera,
      bg: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border-indigo-100 dark:border-indigo-900/30",
      onClick: onScanReceipt,
    },
    {
      id: "split",
      label: "Split Bill",
      sublabel: "Bagi Tagihan",
      icon: Users,
      bg: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 border-amber-100 dark:border-amber-900/30",
      onClick: onSplitBill,
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      sublabel: "Bot Chat",
      icon: MessageSquare,
      bg: "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/40 border-teal-100 dark:border-teal-900/30",
      onClick: onWhatsApp,
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 sm:p-4 border border-slate-100 dark:border-slate-700/80 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Aksi Cepat
        </h2>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Sekali Tap</span>
      </div>

      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={act.onClick}
              type="button"
              className="flex flex-col items-center justify-center p-1.5 sm:p-2.5 rounded-xl border border-slate-100/80 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all active:scale-95 group text-center cursor-pointer"
            >
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-1 transition-transform group-hover:scale-105 ${act.bg}`}
              >
                <Icon size={20} strokeWidth={2.2} />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight truncate w-full">
                {act.label}
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-400 font-medium truncate w-full hidden xs:block">
                {act.sublabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
