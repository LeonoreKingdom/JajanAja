"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  UploadCloud,
  Sparkles,
  Receipt,
  HelpCircle,
  CheckCircle2,
  Check,
} from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import ReceiptCameraScanner from "@/components/pindai-struk/ReceiptCameraScanner";
import ReceiptUploadZone from "@/components/pindai-struk/ReceiptUploadZone";
import ReceiptPreview from "@/components/pindai-struk/ReceiptPreview";
import ReceiptVerificationView from "@/components/pindai-struk/ReceiptVerificationView";
import { ReceiptScanResult } from "@/types/receipt";
import { getMockReceiptResult } from "@/lib/mock-receipts";
import { useTransaction } from "@/context/TransactionContext";
import { formatRupiah } from "@/lib/utils";

export default function PindaiStrukPage() {
  const router = useRouter();
  const { addTransaction } = useTransaction();

  const [activeMode, setActiveMode] = useState<"kamera" | "unggah">("kamera");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [sampleTitle, setSampleTitle] = useState<string | undefined>();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ReceiptScanResult | null>(null);
  const [showTips, setShowTips] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [savedData, setSavedData] = useState<{
    namaToko: string;
    total: number;
  } | null>(null);

  const handleCaptureImage = (dataUrl: string) => {
    setSelectedImage(dataUrl);
    setSampleTitle(undefined);
    setScanResult(null);
  };

  const handleSelectUploadImage = (dataUrl: string, sampleName?: string) => {
    setSelectedImage(dataUrl);
    setSampleTitle(sampleName);
    setScanResult(null);
  };

  const handleRetake = (preferredMode?: "kamera" | "unggah") => {
    setSelectedImage(null);
    setSampleTitle(undefined);
    setIsScanning(false);
    setScanResult(null);
    if (preferredMode) {
      setActiveMode(preferredMode);
    }
  };

  const handleProceedScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch("/api/pindai-struk/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: selectedImage || undefined,
          sampleTitle: sampleTitle,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.result) {
          setScanResult(json.data.result);
          setIsScanning(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Gagal memanggil API scan, menggunakan fallback mock:", err);
    }

    setTimeout(() => {
      setIsScanning(false);
      if (sampleTitle) {
        const result = getMockReceiptResult(sampleTitle, selectedImage || undefined);
        setScanResult(result);
      } else {
        const cleanDraft: ReceiptScanResult = {
          id: `scan-${Date.now()}`,
          namaToko: "",
          tanggal: new Date().toISOString().split("T")[0],
          waktu: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
          nomorStruk: `TRX-${Math.floor(100000 + Math.random() * 900000)}`,
          items: [],
          subtotal: 0,
          pajak: 0,
          diskon: 0,
          total: 0,
          kategoriSaranId: "cat-1",
          kategoriSaranNama: "Makan & Minum",
          confidence: 70,
          fotoUrl: selectedImage || undefined,
        };
        setScanResult(cleanDraft);
      }
    }, 1200);
  };

  const handleHeaderBack = () => {
    if (selectedImage) {
      setSelectedImage(null);
      setSampleTitle(undefined);
      setIsScanning(false);
      return;
    }
    router.back();
  };

  const handleConfirmSave = async (data: {
    namaToko: string;
    tanggal: string;
    total: number;
    categoryId: string;
    assetId: string;
    catatan: string;
  }) => {
    const idempotencyKey = scanResult
      ? `idemp-scan-${scanResult.id}`
      : `idemp-tx-${Date.now()}`;

    try {
      await fetch("/api/pindai-struk/simpan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strukId: scanResult?.id,
          namaToko: data.namaToko,
          tanggal: data.tanggal,
          total: data.total,
          categoryId: data.categoryId,
          assetId: data.assetId,
          catatan: data.catatan,
          items: scanResult?.items,
          idempotencyKey,
        }),
      });
    } catch (err) {
      console.warn("Gagal menyimpan ke API /api/pindai-struk/simpan:", err);
    }

    addTransaction({
      tipe: "pengeluaran",
      jumlah: data.total,
      categoryId: data.categoryId,
      assetId: data.assetId,
      catatan: data.catatan,
      label: "Pindai Struk",
      sumber: "pindai-struk",
      tanggal: data.tanggal ? new Date(data.tanggal).toISOString() : new Date().toISOString(),
    });

    setSavedData({
      namaToko: data.namaToko,
      total: data.total,
    });
    setIsSuccessModalOpen(true);
  };

  const handleResetForNextScan = () => {
    setIsSuccessModalOpen(false);
    setScanResult(null);
    setSelectedImage(null);
    setSampleTitle(undefined);
    setSavedData(null);
  };

  return (
    <div className="flex-1 flex flex-col p-4 pb-24 space-y-4 max-w-lg mx-auto w-full">
      {/* Modal Notifikasi Sukses Simpan Transaksi Struk */}
      {isSuccessModalOpen && savedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-850 rounded-3xl p-6 text-center space-y-4 shadow-2xl border border-slate-100 dark:border-slate-700 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto text-2xl shadow-xs">
              <CheckCircle2 size={32} />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 py-1 px-3 rounded-full mx-auto w-fit">
                <Sparkles size={13} />
                <span>Transaksi Tersimpan Otomatis</span>
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Struk Berhasil Dicatat!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Pengeluaran dari <strong>{savedData.namaToko}</strong> sebesar{" "}
                <strong className="text-slate-900 dark:text-white">
                  {formatRupiah(savedData.total)}
                </strong>{" "}
                sudah berhasil dicatat dan memotong saldo rekening serta pos budget terkait.
              </p>
            </div>

            {/* Mascot Tip */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-3 text-left flex items-start gap-2.5 border border-blue-100 dark:border-blue-900/40">
              <span className="text-xl">🦊</span>
              <p className="text-[11px] text-blue-950 dark:text-blue-200 leading-relaxed">
                <strong>Hebat!</strong> Catat struk langsung begini bikin pengeluaran
                harian kamu tetap rapi dan transparan.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-200 dark:shadow-none active:scale-95 cursor-pointer"
              >
                Lihat di Dashboard
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetForNextScan}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Pindai Struk Lain
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/transaksi")}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Lihat Riwayat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* If in verification mode, show ReceiptVerificationView directly */}
      {scanResult ? (
        <ReceiptVerificationView
          scanResult={scanResult}
          onCancel={() => setScanResult(null)}
          onConfirmSave={handleConfirmSave}
        />
      ) : (
        <>
          {/* Header Navigasi */}
          <header className="flex items-center justify-between py-2">
            <button
              type="button"
              onClick={handleHeaderBack}
              className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-2xs cursor-pointer"
              title="Kembali ke Layar Sebelumnya"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="text-center">
              <h1 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5 justify-center">
                <Receipt size={18} className="text-blue-600 dark:text-blue-400" />
                <span>Pindai Struk AI</span>
              </h1>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-400">
                Catat Pengeluaran Otomatis
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowTips((prev) => !prev)}
              className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-2xs"
              title="Panduan Pindai"
            >
              <HelpCircle size={18} />
            </button>
          </header>

          {/* Panduan Pindai Collapsible */}
          {showTips && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950/60 border border-blue-200 dark:border-indigo-800 rounded-2xl p-4 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300">
                <Sparkles size={14} className="text-amber-500" />
                <span>Panduan Memindai Struk JajanAja</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-blue-950/80 dark:text-slate-300 leading-relaxed pl-1">
                <li>Letakkan struk di permukaan yang datar dengan pencahayaan terang.</li>
                <li>Pastikan tidak ada bagian struk yang terlipat atau buram.</li>
                <li>Nama toko, baris item pembelian, dan total harga harus terbaca jelas.</li>
              </ul>
            </div>
          )}

          {/* Switcher Mode (Kamera vs Unggah) jika belum ada foto terpilih */}
          {!selectedImage && (
            <div className="bg-slate-200/80 dark:bg-slate-800 p-1.5 rounded-2xl flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveMode("kamera")}
                className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                  activeMode === "kamera"
                    ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Camera size={16} />
                <span>Kamera Langsung</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode("unggah")}
                className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                  activeMode === "unggah"
                    ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <UploadCloud size={16} />
                <span>Unggah File</span>
              </button>
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col items-center justify-center">
            {selectedImage ? (
              <ReceiptPreview
                imageDataUrl={selectedImage}
                sampleTitle={sampleTitle}
                onRetake={handleRetake}
                onProceedScan={handleProceedScan}
                isScanning={isScanning}
              />
            ) : activeMode === "kamera" ? (
              <ReceiptCameraScanner
                onCapture={handleCaptureImage}
                onSwitchToUpload={() => setActiveMode("unggah")}
              />
            ) : (
              <ReceiptUploadZone
                onSelectImage={handleSelectUploadImage}
                onSwitchToCamera={() => setActiveMode("kamera")}
              />
            )}
          </main>
        </>
      )}

      {/* Bottom Nav */}
      <BottomNav activeTab="transaksi" />
    </div>
  );
}
