"use client";

import React from "react";
import { Building2, ChevronRight, Coins, CreditCard, Smartphone } from "lucide-react";
import { Asset } from "@/types/finance";
import { formatRupiah } from "@/lib/utils";

interface AssetSummaryProps {
  assets: Asset[];
  onManageAssets?: () => void;
}

export default function AssetSummary({
  assets,
  onManageAssets,
}: AssetSummaryProps) {
  const getAssetIcon = (jenis: string) => {
    switch (jenis) {
      case "bank":
        return <Building2 size={16} />;
      case "e-wallet":
        return <Smartphone size={16} />;
      case "tunai":
        return <Coins size={16} />;
      default:
        return <CreditCard size={16} />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/80 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Asetku</h2>
          <p className="text-[11px] text-slate-400 dark:text-slate-400">
            {assets.length} Akun Terhubung
          </p>
        </div>

        <button
          onClick={onManageAssets}
          type="button"
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-0.5"
        >
          <span>Semua Aset</span>
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 hover:border-slate-200 dark:hover:border-slate-600 transition bg-slate-50/50 dark:bg-slate-900/40 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 shadow-2xs border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300">
                  {getAssetIcon(asset.jenis)}
                </div>
                <div className="truncate">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {asset.nama}
                  </h3>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-medium">
                    {asset.jenis}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                {formatRupiah(asset.saldo)}
              </p>
              {asset.nomorRekening && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  {asset.nomorRekening}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
