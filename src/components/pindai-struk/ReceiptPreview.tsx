"use client";

import React, { useState } from "react";
import {
  RotateCcw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Camera,
  UploadCloud,
  X,
  Maximize2,
  Minimize2,
  FileCheck,
} from "lucide-react";

interface ReceiptPreviewProps {
  imageDataUrl: string;
  sampleTitle?: string;
  onRetake: (preferredMode?: "kamera" | "unggah") => void;
  onProceedScan: () => void;
  isScanning?: boolean;
}

export default function ReceiptPreview({
  imageDataUrl,
  sampleTitle,
  onRetake,
  onProceedScan,
  isScanning = false,
}: ReceiptPreviewProps) {
  const [rotation, setRotation] = useState(0);
  const [zoomLevel, setZoomLevel] = useState<1 | 1.5 | 2>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRetakeModalOpen, setIsRetakeModalOpen] = useState(false);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleToggleZoom = () => {
    setZoomLevel((prev) => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1));
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in">
      {/* Retake Selection Modal */}
      {isRetakeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xs bg-white dark:bg-slate-850 rounded-3xl p-5 space-y-4 shadow-2xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Ambil Ulang Struk
              </h3>
              <button
                type="button"
                onClick={() => setIsRetakeModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <X size={15} />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Pilih metode untuk mengambil atau mengunggah ulang foto struk baru:
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsRetakeModalOpen(false);
                  onRetake("kamera");
                }}
                className="w-full p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center gap-3 transition"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Camera size={16} />
                </div>
                <div className="text-left">
                  <span>Foto Ulang via Kamera</span>
                  <span className="block text-[10px] font-normal text-blue-600/80 dark:text-blue-400">
                    Buka kamera langsung
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRetakeModalOpen(false);
                  onRetake("unggah");
                }}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-3 transition"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0">
                  <UploadCloud size={16} />
                </div>
                <div className="text-left">
                  <span>Pilih dari Galeri / File</span>
                  <span className="block text-[10px] font-normal text-slate-500 dark:text-slate-400">
                    Cari foto lain atau struk demo
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Container */}
      <div
        className={`relative w-full max-w-sm mx-auto bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center group ${
          isFullscreen ? "fixed inset-4 z-50 max-w-none aspect-auto bg-black/95" : "aspect-[3/4]"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageDataUrl}
          alt="Preview Struk Belanja"
          style={{
            transform: `rotate(${rotation}deg) scale(${zoomLevel})`,
            transition: "transform 0.3s ease",
          }}
          className="w-full h-full object-contain p-2 origin-center"
        />

        {/* Top Badges & Retake */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-auto">
          <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-white text-xs font-semibold shadow-xs">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>{sampleTitle ? `Struk: ${sampleTitle}` : "Foto Struk Siap"}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsRetakeModalOpen(true)}
            disabled={isScanning}
            className="px-3 py-1.5 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md text-white flex items-center gap-1.5 text-xs font-bold transition shadow-xs disabled:opacity-50"
            title="Ambil Ulang"
          >
            <RotateCcw size={14} />
            <span>Ambil Ulang</span>
          </button>
        </div>

        {/* Bottom Floating Control Bar (Rotate, Zoom, Fullscreen) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-2xl flex items-center gap-3 text-white z-20 shadow-md">
          <button
            type="button"
            onClick={handleRotate}
            disabled={isScanning}
            className="p-1 hover:text-blue-400 transition"
            title="Putar 90°"
          >
            <RotateCw size={16} />
          </button>
          <div className="w-px h-4 bg-white/20" />
          <button
            type="button"
            onClick={handleToggleZoom}
            disabled={isScanning}
            className="p-1 hover:text-blue-400 transition flex items-center gap-1 text-[11px] font-bold"
            title="Perbesar / Perkecil"
          >
            {zoomLevel > 1 ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
            <span>{zoomLevel}x</span>
          </button>
          <div className="w-px h-4 bg-white/20" />
          <button
            type="button"
            onClick={() => setIsFullscreen((prev) => !prev)}
            disabled={isScanning}
            className="p-1 hover:text-blue-400 transition"
            title={isFullscreen ? "Kecilkan" : "Layar Penuh"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>

        {/* Scanning Overlay Animation */}
        {isScanning && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3 z-30">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-blue-400/30 border-t-blue-500 animate-spin" />
              <Sparkles
                size={22}
                className="absolute inset-0 m-auto text-amber-400 animate-bounce"
              />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">
                LEVINA sedang memindai struk...
              </p>
              <p className="text-xs text-slate-300">
                Membaca merchant, rincian barang, dan total tagihan
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quality Check Card */}
      <div className="bg-white dark:bg-slate-850 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-2 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <FileCheck size={15} className="text-blue-600 dark:text-blue-400" />
            <span>Kualitas Foto Siap Pindai</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
            Optimal
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 dark:text-slate-400 pt-1">
          <div className="flex items-center gap-1">
            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
            <span>Pencahayaan terang</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
            <span>Total terlihat</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
            <span>Teks tidak kabur</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => setIsRetakeModalOpen(true)}
          disabled={isScanning}
          className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
        >
          <RotateCcw size={15} />
          <span>Ambil Ulang</span>
        </button>

        <button
          type="button"
          onClick={onProceedScan}
          disabled={isScanning}
          className="flex-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none transition active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <Sparkles size={16} className="text-amber-300" />
          <span>Mulai Analisis AI</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
