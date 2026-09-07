"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  Edit3,
  FileText,
  HelpCircle,
  Receipt,
  RotateCcw,
  Sparkles,
  Store,
  Tag,
  Wallet,
} from "lucide-react";
import { ReceiptScanResult } from "@/types/receipt";
import { formatRupiah } from "@/lib/utils";
import { useTransaction } from "@/context/TransactionContext";
import { defaultExpenseCategories } from "@/server/db/seeds/category.seed";

interface ReceiptVerificationViewProps {
  scanResult: ReceiptScanResult;
  onCancel: () => void;
  onConfirmSave: (data: {
    namaToko: string;
    tanggal: string;
    total: number;
    categoryId: string;
    assetId: string;
    catatan: string;
  }) => void;
}

export default function ReceiptVerificationView({
  scanResult,
  onCancel,
  onConfirmSave,
}: ReceiptVerificationViewProps) {
  const { assets, budgets } = useTransaction();

  // State initialized from mock scan result
  const [namaToko, setNamaToko] = useState(scanResult.namaToko);
  const [tanggal, setTanggal] = useState(scanResult.tanggal);
  const [total, setTotal] = useState(scanResult.total);
  const [autoCategoryId, setAutoCategoryId] = useState(
    scanResult.kategoriSaranId || "cat-1"
  );
  const [autoConfidence, setAutoConfidence] = useState(
    scanResult.confidence || 95
  );
  const [autoReasoning, setAutoReasoning] = useState(
    scanResult.kategoriSaranNama
      ? `Terpilih otomatis: ${scanResult.kategoriSaranNama}`
      : "Rekomendasi AI pintar"
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    scanResult.kategoriSaranId || "cat-1"
  );
  const [selectedAssetId, setSelectedAssetId] = useState(
    assets[0]?.id || "ast-1"
  );
  const [isPhotoExpanded, setIsPhotoExpanded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  const reevaluateCategory = async (merchant: string) => {
    try {
      const res = await fetch("/api/pindai-struk/kategori-otomatis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namaToko: merchant, items: scanResult.items }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.categoryId) {
          setAutoCategoryId(json.data.categoryId);
          setAutoConfidence(json.data.confidence);
          setAutoReasoning(
            json.data.reasoning || `Terpilih otomatis: ${json.data.kategoriNama}`
          );
          setSelectedCategoryId(json.data.categoryId);
        }
      }
    } catch {
      // noop
    }
  };

  const hasUnsavedEdits =
    namaToko !== scanResult.namaToko ||
    tanggal !== scanResult.tanggal ||
    total !== scanResult.total;

  const handleCancelRequest = () => {
    if (hasUnsavedEdits) {
      setIsCancelConfirmOpen(true);
    } else {
      onCancel();
    }
  };

  const handleSave = () => {
    onConfirmSave({
      namaToko,
      tanggal,
      total,
      categoryId: selectedCategoryId,
      assetId: selectedAssetId,
      catatan: `Struk: ${namaToko} (${scanResult.items.map((i) => i.nama).join(", ")})`,
    });
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in pb-8">
      {/* Modal Konfirmasi Batal */}
      {isCancelConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xs bg-white rounded-3xl p-5 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-xl">
              ⚠️
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900">
                Batalkan Verifikasi Struk?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Perubahan data toko, tanggal, atau nominal yang sudah kamu ubah
                akan dibatalkan.
              </p>
            </div>
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={onCancel}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-rose-100"
              >
                Ya, Batalkan & Kembali
              </button>
              <button
                type="button"
                onClick={() => setIsCancelConfirmOpen(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Lanjutkan Periksa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Periksa */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleCancelRequest}
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-2xs"
          title="Kembali ke Layar Pindai"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="text-center">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5 justify-center">
            <Receipt size={17} className="text-blue-600 dark:text-blue-400" />
            <span>Periksa Hasil Pindai Struk</span>
          </h2>
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-400">
            Pastikan data yang dibaca AI sudah sesuai
          </p>
        </div>
        <div className="w-10 flex justify-end">
          <span className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-200 dark:border-emerald-800">
            ✓
          </span>
        </div>
      </div>

      {/* AI Confidence & Receipt Thumbnail Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-2.5">
          {scanResult.fotoUrl && (
            <button
              type="button"
              onClick={() => setIsPhotoExpanded((prev) => !prev)}
              className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 overflow-hidden shrink-0 hover:ring-2 hover:ring-blue-400 transition"
              title="Lihat foto struk asli"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={scanResult.fotoUrl}
                alt="Foto Struk"
                className="w-full h-full object-cover"
              />
            </button>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                OCR Berhasil Diekstrak
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Akurasi pembacaan {scanResult.confidence}%
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold rounded-lg flex items-center gap-1">
          <CheckCircle2 size={12} />
          <span>Terverifikasi</span>
        </span>
      </div>

      {/* Modal / Expanded Receipt Photo */}
      {isPhotoExpanded && scanResult.fotoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in cursor-pointer"
          onClick={() => setIsPhotoExpanded(false)}
        >
          <div className="max-w-sm max-h-[85vh] bg-white rounded-3xl p-3 shadow-2xl relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={scanResult.fotoUrl}
              alt="Foto Struk Asli"
              className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
            />
            <p className="text-center text-[11px] font-bold text-slate-500 pt-2">
              Ketuk di mana saja untuk menutup
            </p>
          </div>
        </div>
      )}

      {/* Ringkasan Merchant & Total Card (With Edit Button & Inline Editing Modal) */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-5 text-white shadow-lg space-y-4 relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 pr-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-blue-200 flex items-center gap-1">
              <Store size={13} />
              <span>Merchant / Toko</span>
            </span>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black tracking-tight">{namaToko}</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="w-6 h-6 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white text-xs transition"
                title="Edit data toko, tanggal, atau nominal"
              >
                <Edit3 size={13} />
              </button>
            </div>
            <p className="text-xs text-blue-100 flex items-center gap-1.5">
              <Calendar size={12} />
              <span>{tanggal}</span>
              {scanResult.waktu && (
                <>
                  <span>•</span>
                  <Clock size={12} />
                  <span>{scanResult.waktu}</span>
                </>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 transition border border-white/20 shrink-0"
          >
            <Edit3 size={13} />
            <span>Ubah Data</span>
          </button>
        </div>

        <div className="border-t border-white/20 pt-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-blue-200">
              <span className="text-[11px] font-medium">Total Pembayaran</span>
              {total !== scanResult.total && (
                <span className="text-[10px] bg-amber-400 text-slate-900 font-bold px-1.5 py-0.2 rounded">
                  Disesuaikan
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-black">{formatRupiah(total)}</p>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="w-6 h-6 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white text-xs transition"
                title="Edit nominal"
              >
                <Edit3 size={12} />
              </button>
            </div>
          </div>
          {scanResult.nomorStruk && (
            <div className="text-right">
              <span className="text-[10px] text-blue-200">No. Struk</span>
              <p className="text-xs font-mono text-white/90">{scanResult.nomorStruk}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Edit Nama Toko, Tanggal, & Nominal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Edit3 size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Ubah Data Struk
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-400">
                    Koreksi toko, tanggal, atau nominal
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsEditModalOpen(false);
                reevaluateCategory(namaToko);
              }}
              className="space-y-3.5"
            >
              {/* Nama Toko */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Nama Toko / Merchant
                </label>
                <div className="relative">
                  <Store
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    required
                    value={namaToko}
                    onChange={(e) => setNamaToko(e.target.value)}
                    placeholder="Nama merchant atau toko"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Tanggal Transaksi */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Tanggal Transaksi
                </label>
                <div className="relative">
                  <Calendar
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Total Nominal Pembayaran */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Total Nominal (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-base">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={new Intl.NumberFormat("id-ID").format(total)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value.replace(/\D/g, ""), 10) || 0;
                      setTotal(val);
                    }}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 text-lg font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {total !== scanResult.total && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1 font-medium">
                    <span>* OCR awal mendeteksi:</span>
                    <span className="font-bold">{formatRupiah(scanResult.total)}</span>
                  </p>
                )}
              </div>

              {/* Reset to OCR button */}
              {(namaToko !== scanResult.namaToko ||
                tanggal !== scanResult.tanggal ||
                total !== scanResult.total) && (
                <button
                  type="button"
                  onClick={() => {
                    setNamaToko(scanResult.namaToko);
                    setTanggal(scanResult.tanggal);
                    setTotal(scanResult.total);
                  }}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
                >
                  <RotateCcw size={13} />
                  <span>Kembalikan ke Hasil Baca Awal</span>
                </button>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-200 dark:shadow-none transition"
                >
                  <Check size={16} />
                  <span>Terapkan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daftar Rincian Barang yang Terbaca */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-3 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-2">
          <div className="flex items-center gap-1.5">
            <FileText size={15} className="text-blue-600 dark:text-blue-400" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Item Terbaca ({scanResult.items.length})
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">Dari struk</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {scanResult.items.map((item) => (
            <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="space-y-0.5 max-w-[65%]">
                <p className="font-bold text-slate-800 dark:text-slate-100 leading-snug">{item.nama}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-400">
                  {item.qty}x @ {formatRupiah(item.harga)}
                </p>
              </div>
              <span className="font-black text-slate-900 dark:text-white">
                {formatRupiah(item.subtotal)}
              </span>
            </div>
          ))}
        </div>

        {/* Subtotal & Total Breakdown */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Subtotal</span>
            <span>{formatRupiah(scanResult.subtotal)}</span>
          </div>
          {scanResult.diskon > 0 && (
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span>Diskon Promosi</span>
              <span>-{formatRupiah(scanResult.diskon)}</span>
            </div>
          )}
          {scanResult.pajak > 0 && (
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Pajak (PB1/PPN)</span>
              <span>+{formatRupiah(scanResult.pajak)}</span>
            </div>
          )}
          <div className="flex items-center justify-between font-black text-sm text-slate-900 dark:text-white pt-1 border-t border-dashed border-slate-200 dark:border-slate-700">
            <span>Total Akhir</span>
            <span className="text-blue-600 dark:text-blue-400">{formatRupiah(total)}</span>
          </div>
        </div>
      </div>

      {/* Rekomendasi Kategori & Pilihan Aset Dompet */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Kategori Pos */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-1.5 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Tag size={14} className="text-amber-500" />
              <span>Kategori Pos</span>
            </div>
            {selectedCategoryId === autoCategoryId ? (
              <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                <Sparkles size={10} />
                <span>Otomatis ({autoConfidence}%)</span>
              </span>
            ) : (
              <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold px-1.5 py-0.5 rounded-md">
                Dipilih Manual
              </span>
            )}
          </div>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full p-2 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {defaultExpenseCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nama} {cat.id === autoCategoryId ? "⭐ (Saran AI)" : ""}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-400 truncate">
            {autoReasoning}
          </p>
        </div>

        {/* Sumber Aset */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-1.5 transition-colors">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Wallet size={14} className="text-blue-600 dark:text-blue-400" />
            <span>Sumber Dana</span>
          </div>
          <select
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            className="w-full p-2 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {assets.map((ast) => (
              <option key={ast.id} value={ast.id}>
                {ast.nama} ({formatRupiah(ast.saldo)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* LEVINA Feedback message */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950/60 border border-blue-200 dark:border-indigo-900/50 rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs">
        <span className="text-2xl shrink-0">🦊</span>
        <div className="space-y-0.5 text-xs text-blue-950 dark:text-blue-200">
          <p className="font-bold text-blue-900 dark:text-blue-300">Catatan LEVINA:</p>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Data struk belanja dari <strong>{namaToko}</strong> berhasil dibaca dengan
            baik. Klik simpan untuk langsung mencatat transaksi ke budget bulananmu!
          </p>
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleCancelRequest}
          className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition"
        >
          Batal / Scan Lagi
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="flex-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none transition active:scale-95 cursor-pointer"
        >
          <Check size={16} />
          <span>Simpan ke Transaksi</span>
        </button>
      </div>
    </div>
  );
}
