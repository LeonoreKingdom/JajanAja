"use client";

import React from "react";
import { formatRupiah } from "@/lib/utils";
import { Asset, AssetType } from "@/types/finance";
import { Building2, Coins, ShieldCheck, Smartphone, Wallet } from "lucide-react";

interface TotalAssetOverviewProps {
  assets: Asset[];
}

export default function TotalAssetOverview({ assets }: TotalAssetOverviewProps) {
  const totalSaldo = assets.reduce((sum, a) => sum + a.saldo, 0);

  const bankTotal = assets
    .filter((a) => a.jenis === "bank")
    .reduce((sum, a) => sum + a.saldo, 0);

  const ewalletTotal = assets
    .filter((a) => a.jenis === "e-wallet")
    .reduce((sum, a) => sum + a.saldo, 0);

  const tunaiTotal = assets
    .filter((a) => a.jenis === "tunai")
    .reduce((sum, a) => sum + a.saldo, 0);

  const bankPercent = totalSaldo > 0 ? Math.round((bankTotal / totalSaldo) * 100) : 0;
  const ewalletPercent = totalSaldo > 0 ? Math.round((ewalletTotal / totalSaldo) * 100) : 0;
  const tunaiPercent = Math.max(0, 100 - bankPercent - ewalletPercent);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-5 text-white shadow-xl space-y-4 relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute -right-8 -top-8 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
            <Wallet size={17} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200">
              Total Kekayaan Likuid
            </span>
            <h2 className="text-xs text-blue-300/80 font-medium">Aset Kas & Dompet</h2>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center gap-1">
          <ShieldCheck size={13} />
          <span>{assets.length} Akun Terdaftar</span>
        </span>
      </div>

      {/* Nilai Total Saldo */}
      <div className="pt-1">
        <span className="text-xs text-slate-400 block font-medium">
          Total Nilai Saldo
        </span>
        <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {formatRupiah(totalSaldo)}
        </span>
      </div>

      {/* Visual Multi-Segment Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-2.5 rounded-full bg-slate-800/80 overflow-hidden flex p-0.5 border border-slate-700/50">
          <div
            className="h-full rounded-l-full bg-blue-500 transition-all duration-500"
            style={{ width: `${bankPercent}%` }}
            title={`Bank: ${bankPercent}%`}
          />
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${ewalletPercent}%` }}
            title={`E-Wallet: ${ewalletPercent}%`}
          />
          <div
            className="h-full rounded-r-full bg-amber-400 transition-all duration-500"
            style={{ width: `${tunaiPercent}%` }}
            title={`Tunai: ${tunaiPercent}%`}
          />
        </div>
      </div>

      {/* Rincian per Jenis Aset */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 text-xs">
        <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[11px] text-blue-300 font-bold mb-1">
            <Building2 size={12} />
            <span>Bank ({bankPercent}%)</span>
          </div>
          <span className="font-extrabold text-white text-[12px] truncate">
            {formatRupiah(bankTotal)}
          </span>
        </div>

        <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[11px] text-emerald-300 font-bold mb-1">
            <Smartphone size={12} />
            <span>E-Wallet ({ewalletPercent}%)</span>
          </div>
          <span className="font-extrabold text-white text-[12px] truncate">
            {formatRupiah(ewalletTotal)}
          </span>
        </div>

        <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[11px] text-amber-300 font-bold mb-1">
            <Coins size={12} />
            <span>Tunai ({tunaiPercent}%)</span>
          </div>
          <span className="font-extrabold text-white text-[12px] truncate">
            {formatRupiah(tunaiTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
