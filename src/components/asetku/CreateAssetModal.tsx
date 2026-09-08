"use client";

import React, { useState } from "react";
import {
  X,
  Check,
  Building2,
  Smartphone,
  Coins,
  Wallet,
  AlertCircle,
} from "lucide-react";
import { Asset, AssetType } from "@/types/finance";
import { formatRupiah } from "@/lib/utils";

interface CreateAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assetData: {
    nama: string;
    jenis: AssetType;
    saldo: number;
    nomorRekening?: string;
    warna?: string;
  }) => void;
}

export default function CreateAssetModal({
  isOpen,
  onClose,
  onSave,
}: CreateAssetModalProps) {
  const [nama, setNama] = useState("");
  const [jenis, setJenis] = useState<AssetType>("bank");
  const [rawSaldo, setRawSaldo] = useState("");
  const [nomorRekening, setNomorRekening] = useState("");
  const [warnaTema, setWarnaTema] = useState("from-blue-600 to-indigo-700");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const parsedSaldo = parseInt(rawSaldo.replace(/\D/g, ""), 10) || 0;

  const handleSaldoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setRawSaldo(val ? new Intl.NumberFormat("id-ID").format(parseInt(val, 10)) : "");
    setError(null);
  };

  const addPreset = (amt: number) => {
    const next = parsedSaldo + amt;
    setRawSaldo(new Intl.NumberFormat("id-ID").format(next));
    setError(null);
  };

  const colorOptions = [
    { label: "Biru", val: "from-blue-600 to-indigo-700" },
    { label: "Hijau", val: "from-emerald-600 to-teal-700" },
    { label: "Ungu", val: "from-purple-600 to-violet-800" },
    { label: "Emas", val: "from-amber-600 to-yellow-700" },
    { label: "Gelap", val: "from-slate-800 to-slate-950" },
    { label: "Merah", val: "from-rose-600 to-pink-700" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setError("Nama dompet / rekening wajib diisi.");
      return;
    }

    onSave({
      nama: nama.trim(),
      jenis,
      saldo: parsedSaldo,
      nomorRekening: nomorRekening.trim() || undefined,
      warna: warnaTema,
    });

    setNama("");
    setRawSaldo("");
    setNomorRekening("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto border border-slate-100 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Wallet size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Tambah Akun Aset Baru
              </h3>
              <p className="text-[11px] text-slate-400">Rekening, e-wallet, atau tunai</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pilihan Jenis Aset */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Jenis Aset
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "bank", label: "Bank", icon: Building2 },
                  { id: "e-wallet", label: "E-Wallet", icon: Smartphone },
                  { id: "tunai", label: "Tunai", icon: Coins },
                ] as const
              ).map((type) => {
                const Icon = type.icon;
                const isSelected = jenis === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      setJenis(type.id);
                      if (type.id === "bank") setWarnaTema("from-blue-600 to-indigo-700");
                      if (type.id === "e-wallet") setWarnaTema("from-emerald-600 to-teal-700");
                      if (type.id === "tunai") setWarnaTema("from-amber-600 to-yellow-700");
                    }}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1.5 transition ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 ring-2 ring-blue-500"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nama Aset */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Nama Rekening / Dompet
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: BCA Prioritas, GoPay Utama, Dompet Saku"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Saldo Awal */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Saldo Awal (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                placeholder="0"
                value={rawSaldo}
                onChange={handleSaldoChange}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xl font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 no-scrollbar">
              {[100000, 500000, 1000000, 5000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => addPreset(amt)}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
                >
                  +{formatRupiah(amt).replace("Rp", "").trim()}
                </button>
              ))}
            </div>
          </div>

          {/* Nomor Rekening / Akun (Opsional) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Nomor Rekening / HP (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: •••• 8921 atau 0812••••7890"
              value={nomorRekening}
              onChange={(e) => setNomorRekening(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Pilihan Warna Tema Kartu */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Warna Tema Kartu
            </label>
            <div className="flex items-center gap-2">
              {colorOptions.map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setWarnaTema(opt.val)}
                  className={`w-7 h-7 rounded-full bg-gradient-to-br ${opt.val} transition-transform ${
                    warnaTema === opt.val ? "scale-125 ring-2 ring-slate-900 dark:ring-white" : ""
                  }`}
                  title={opt.label}
                />
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-800">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-200 dark:shadow-none transition active:scale-95"
            >
              <Check size={16} />
              <span>Simpan Aset</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
