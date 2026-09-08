"use client";

import React from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { Asset, AssetType } from "@/types/finance";
import {
  Building2,
  Coins,
  CreditCard,
  Edit3,
  Plus,
  Smartphone,
  Wallet,
} from "lucide-react";

interface AssetCardProps {
  asset: Asset;
  onEditBalance: (asset: Asset) => void;
}

export default function AssetCard({ asset, onEditBalance }: AssetCardProps) {
  const getAssetBadge = (jenis: AssetType) => {
    switch (jenis) {
      case "bank":
        return {
          label: "Rekening Bank",
          icon: <Building2 size={13} />,
          badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
          cardGrad: "from-blue-600 to-indigo-700",
        };
      case "e-wallet":
        return {
          label: "Dompet Digital",
          icon: <Smartphone size={13} />,
          badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
          cardGrad: "from-emerald-600 to-teal-700",
        };
      case "tunai":
        return {
          label: "Uang Fisik / Cash",
          icon: <Coins size={13} />,
          badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
          cardGrad: "from-amber-600 to-yellow-700",
        };
      default:
        return {
          label: "Aset Lainnya",
          icon: <Wallet size={13} />,
          badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
          cardGrad: "from-slate-700 to-slate-900",
        };
    }
  };

  const meta = getAssetBadge(asset.jenis);

  // Format date display
  const updatedAtDisplay = asset.updatedAt
    ? new Date(asset.updatedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Baru saja";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md transition space-y-3.5">
      {/* Visual Digital ATM Card Representation */}
      <div
        className={`rounded-2xl p-4 text-white bg-gradient-to-r ${meta.cardGrad} shadow-md space-y-3 relative overflow-hidden`}
      >
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-1.5 font-bold text-xs tracking-wide">
            {meta.icon}
            <span>{meta.label}</span>
          </div>
          <span className="text-[10px] tracking-widest font-mono opacity-80">
            JAJANAJA PAY
          </span>
        </div>

        <div className="pt-1">
          <span className="text-[10px] uppercase font-bold text-white/70 block">
            Saldo Tersedia
          </span>
          <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {formatRupiah(asset.saldo)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-white/20">
          <span className="font-bold text-white/95">{asset.nama}</span>
          <span className="font-mono text-[11px] text-white/80">
            {asset.nomorRekening || "•••• Cash"}
          </span>
        </div>
      </div>

      {/* Detail bar & Quick Action */}
      <div className="flex items-center justify-between text-xs px-1">
        <span className="text-[11px] text-slate-400">
          Terakhir: {updatedAtDisplay}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEditBalance(asset)}
            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-lg text-xs flex items-center gap-1 transition active:scale-95"
          >
            <Edit3 size={12} />
            <span>Sesuaikan</span>
          </button>

          <Link
            href={`/transaksi`}
            className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold rounded-lg text-xs flex items-center gap-1 transition active:scale-95"
          >
            <Plus size={12} />
            <span>Pakai</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
