"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Coins,
  Plus,
  Search,
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
  const { assets, addAsset, updateAssetBalance, refreshData } = useTransaction();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"semua" | AssetType>("semua");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleEditBalance = (asset: Asset) => {
    setEditingAsset(asset);
  };

  const handleSaveBalance = async (
    assetId: string,
    newBalance: number,
    recordAdjustment?: boolean
  ) => {
    const success = await updateAssetBalance(assetId, newBalance, recordAdjustment);
    if (success) {
      showToast("✓ Saldo aset berhasil diperbarui ke database!");
    } else {
      showToast("Gagal memperbarui saldo aset.");
    }
    setEditingAsset(null);
  };

  const handleCreateAsset = async (assetData: {
    nama: string;
    jenis: AssetType;
    saldo: number;
    nomorRekening?: string;
    warna?: string;
  }) => {
    const created = await addAsset(assetData);
    if (created) {
      showToast(`✓ Akun aset '${created.nama}' berhasil disimpan ke database Turso!`);
    } else {
      showToast("Gagal menyimpan akun aset baru.");
    }
    setIsCreateModalOpen(false);
  };

  // Filter & Search
  const filteredAssets = assets.filter((a) => {
    if (filterType !== "semua" && a.jenis !== filterType) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = a.nama.toLowerCase().includes(q);
      const matchRekening = a.nomorRekening?.toLowerCase().includes(q);
      if (!matchName && !matchRekening) return false;
    }

    return true;
  });

  return (
    <div className="flex-1 flex flex-col p-4 pb-24 space-y-4 max-w-lg mx-auto w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg border border-slate-700 animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between py-2">
        <Link
          href="/"
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-2xs"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="text-center">
          <h1 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5 justify-center">
            <Wallet size={18} className="text-blue-600 dark:text-blue-400" />
            <span>Asetku</span>
          </h1>
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
            Dompet & Rekening Keuangan
          </p>
        </div>
        <div className="w-10 flex justify-end">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900 transition shadow-2xs cursor-pointer"
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
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <input
            type="text"
            placeholder="Cari rekening atau e-wallet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
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
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition text-xs cursor-pointer ${
                filterType === tab.id
                  ? "bg-slate-900 dark:bg-blue-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
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
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Daftar Akun Aset ({filteredAssets.length})
          </h2>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Tersimpan aman & tersinkron ke Turso
          </span>
        </div>

        {filteredAssets.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-slate-100 dark:border-slate-700/80 space-y-2">
            <span className="text-3xl">💳</span>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Tidak ada aset yang sesuai kriteria pencarian.
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
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
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-cyan-950/40 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/50 flex items-start gap-3 shadow-xs">
        <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl shrink-0 shadow-2xs border border-blue-200 dark:border-blue-800">
          🦊
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs font-bold text-blue-900 dark:text-blue-300">
            <Sparkles size={13} className="text-amber-500" />
            <span>Pesan LEVINA untuk Keamanan Aset</span>
          </div>
          <p className="text-xs text-blue-950 dark:text-blue-200/90 leading-relaxed">
            Diversifikasi asetmu sudah bagus! Rekening bank cocok untuk dana utama, sedangkan dompet digital
            ideal untuk transaksi mikro harian. Seluruh mutasi tersimpan secara persisten ke database cloud.
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
