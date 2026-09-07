"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Coins,
  Plus,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wallet,
} from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import TotalAssetOverview from "@/components/asetku/TotalAssetOverview";
import AssetCard from "@/components/asetku/AssetCard";
import EditAssetBalanceModal from "@/components/asetku/EditAssetBalanceModal";
import CreateAssetModal from "@/components/asetku/CreateAssetModal";
import { useTransaction } from "@/context/TransactionContext";
import { Asset, AssetType } from "@/types/finance";

export default function AsetkuPage() {
  const { assets, addAsset, updateAssetBalance } = useTransaction();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"semua" | AssetType>("semua");

  const handleEditBalance = (asset: Asset) => {
    setEditingAsset(asset);
  };

  const handleSaveBalance = (
    assetId: string,
    newBalance: number,
    recordAdjustment?: boolean
  ) => {
    updateAssetBalance(assetId, newBalance, recordAdjustment);
  };

  const handleCreateAsset = (assetData: {
    nama: string;
    jenis: AssetType;
    saldo: number;
    nomorRekening?: string;
    warna?: string;
  }) => {
    addAsset(assetData);
  };

  // Filter & Search
  const filteredAssets = assets.filter((a) => {
    if (filterType !== "semua" && a.jenis !== filterType) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = a.nama.toLowerCase().includes(q);
      const matchNumber = a.nomorRekening?.toLowerCase().includes(q);
      if (!matchName && !matchNumber) return false;
    }

    return true;
  });

  return (
    <div className="flex-1 flex flex-col p-4 pb-24 space-y-4 max-w-lg mx-auto w-full">
      {/* Header */}
      <header className="flex items-center justify-between py-2">
        <Link
          href="/"
          className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition shadow-2xs"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="text-center">
          <h1 className="text-base font-black text-slate-900 flex items-center gap-1.5 justify-center">
            <Wallet size={18} className="text-blue-600" />
            <span>Asetku</span>
          </h1>
          <p className="text-[11px] font-bold text-slate-400">
            Dompet & Rekening Keuangan
          </p>
        </div>
        <div className="w-10 flex justify-end">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition shadow-2xs cursor-pointer"
            title="Tambah Akun Aset"
          >
            <Plus size={18} />
          </button>
        </div>
      </header>

      {/* Ringkasan Total Aset Likuid */}
      <TotalAssetOverview assets={assets} />

      {/* Search & Filter Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Cari rekening atau e-wallet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          />
        </div>

        {/* Filter Type Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: "semua", label: "Semua Aset", icon: <Wallet size={12} /> },
            { id: "bank", label: "Rekening Bank", icon: <Building2 size={12} /> },
            { id: "e-wallet", label: "Dompet Digital", icon: <Smartphone size={12} /> },
            { id: "tunai", label: "Uang Fisik", icon: <Coins size={12} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id as typeof filterType)}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition text-xs ${
                filterType === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Daftar Kartu Aset */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Daftar Akun Aset ({filteredAssets.length})
          </h2>
          <span className="text-[11px] text-slate-400">
            Tersimpan aman & tersinkron
          </span>
        </div>

        {filteredAssets.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 space-y-2">
            <span className="text-3xl">💳</span>
            <p className="text-xs font-bold text-slate-700">
              Tidak ada aset yang sesuai kriteria pencarian.
            </p>
            <p className="text-[11px] text-slate-400">
              Coba gunakan filter lain atau periksa kata kunci.
            </p>
          </div>
        ) : (
          filteredAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onEditBalance={handleEditBalance}
            />
          ))
        )}
      </div>

      {/* LEVINA Mascot Financial Asset Guidance */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 rounded-2xl p-4 border border-blue-100 flex items-start gap-3 shadow-xs">
        <div className="w-10 h-10 rounded-2xl bg-white text-blue-600 flex items-center justify-center text-xl shrink-0 shadow-2xs border border-blue-200">
          🦊
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs font-bold text-blue-900">
            <Sparkles size={13} className="text-amber-500" />
            <span>Pesan LEVINA untuk Keamanan Aset</span>
          </div>
          <p className="text-xs text-blue-950 leading-relaxed">
            Diversifikasi asetmu sudah bagus! Rekening <strong>BCA</strong> cocok untuk dana
            utama, sedangkan <strong>GoPay & OVO</strong> ideal untuk pengeluaran mikro harian.
            Jangan lupa simpan dana darurat di rekening terpisah ya!
          </p>
        </div>
      </div>

      {/* Modal Tambah Aset Baru */}
      <CreateAssetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateAsset}
      />

      {/* Modal Sesuaikan Saldo */}
      <EditAssetBalanceModal
        isOpen={Boolean(editingAsset)}
        onClose={() => setEditingAsset(null)}
        asset={editingAsset}
        onSave={handleSaveBalance}
      />

      {/* Bottom Nav */}
      <BottomNav activeTab="asetku" />
    </div>
  );
}
