"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileImage,
  Sparkles,
  Coffee,
  ShoppingBag,
  Utensils,
  AlertCircle,
} from "lucide-react";

interface ReceiptUploadZoneProps {
  onSelectImage: (imageDataUrl: string, sampleTitle?: string) => void;
  onSwitchToCamera: () => void;
}

export default function ReceiptUploadZone({
  onSelectImage,
  onSwitchToCamera,
}: ReceiptUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Hanya file gambar (JPG, PNG, WebP) yang didukung.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Ukuran file maksimal 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onSelectImage(reader.result);
      }
    };
    reader.onerror = () => {
      setError("Gagal membaca file gambar.");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Demo receipt generator using Canvas / SVG data URL
  const generateSampleReceiptDataUrl = (
    merchant: string,
    total: number,
    items: { name: string; price: number }[]
  ): string => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 560;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    // Paper background
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, 400, 560);

    // Border & subtle fold
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 388, 548);

    // Header
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 20px monospace";
    ctx.textAlign = "center";
    ctx.fillText(merchant.toUpperCase(), 200, 50);

    ctx.font = "12px monospace";
    ctx.fillStyle = "#64748b";
    ctx.fillText("Jl. Kebon Jeruk No. 12, Jakarta", 200, 75);
    ctx.fillText("Telp: 021-555-8910", 200, 95);
    ctx.fillText("================================", 200, 120);

    // Date
    ctx.textAlign = "left";
    ctx.font = "12px monospace";
    ctx.fillText("TGL: 07/09/2026 14:32", 30, 145);
    ctx.fillText("KASIR: Levina / POS-01", 30, 165);
    ctx.fillText("--------------------------------", 30, 185);

    // Items
    let y = 215;
    items.forEach((item) => {
      ctx.textAlign = "left";
      ctx.fillStyle = "#1e293b";
      ctx.fillText(item.name, 30, y);
      ctx.textAlign = "right";
      ctx.fillText(new Intl.NumberFormat("id-ID").format(item.price), 370, y);
      y += 30;
    });

    // Subtotal & Total
    ctx.textAlign = "left";
    ctx.fillStyle = "#64748b";
    ctx.fillText("--------------------------------", 30, y + 10);
    y += 40;

    ctx.font = "bold 16px monospace";
    ctx.fillStyle = "#0f172a";
    ctx.fillText("TOTAL", 30, y);
    ctx.textAlign = "right";
    ctx.fillText(`Rp ${new Intl.NumberFormat("id-ID").format(total)}`, 370, y);

    // Footer
    y += 50;
    ctx.textAlign = "center";
    ctx.font = "11px monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("TERIMA KASIH ATAS KUNJUNGANNYA", 200, y);
    ctx.fillText("*** STRUK RESMI JAJANAJA ***", 200, y + 20);

    return canvas.toDataURL("image/png");
  };

  const sampleReceipts = [
    {
      id: "sample-coffee",
      title: "Kopi Janji Jiwa",
      total: 38000,
      icon: Coffee,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      items: [
        { name: "1x Kopi Susu Aren", price: 20000 },
        { name: "1x Toast Crunchy Choco", price: 18000 },
      ],
    },
    {
      id: "sample-mart",
      title: "Indomaret Point",
      total: 75500,
      icon: ShoppingBag,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      items: [
        { name: "1x Susu UHT 1000ml", price: 21500 },
        { name: "2x Roti Gandum Kupas", price: 32000 },
        { name: "1x Air Mineral 1.5L", price: 7000 },
        { name: "1x Snack Keripik Kentang", price: 15000 },
      ],
    },
    {
      id: "sample-resto",
      title: "Resto Padang Sederhana",
      total: 125000,
      icon: Utensils,
      color: "text-rose-600 bg-rose-50 border-rose-200",
      items: [
        { name: "2x Nasi Rendang Daging", price: 68000 },
        { name: "1x Ayam Gulai Spesial", price: 27000 },
        { name: "2x Es Teh Manis Jumbo", price: 16000 },
        { name: "2x Kerupuk Kulit Kuah", price: 14000 },
      ],
    },
  ];

  const handleSelectSample = (sample: typeof sampleReceipts[0]) => {
    const dataUrl = generateSampleReceiptDataUrl(
      sample.title,
      sample.total,
      sample.items
    );
    onSelectImage(dataUrl, sample.title);
  };

  return (
    <div className="w-full space-y-5">
      {/* File Upload Box */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
          isDragging
            ? "border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 scale-[0.99]"
            : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-700 shadow-md border border-slate-100 dark:border-slate-600 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <UploadCloud size={32} />
        </div>

        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Unggah Foto Struk Belanja
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-400">
            Tarik & taruh gambar ke sini, atau klik untuk memilih file
          </p>
        </div>

        <span className="inline-block px-3 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 rounded-full text-[11px] font-semibold">
          JPG, PNG, WebP • Maks. 10MB
        </span>
      </div>

      {error && (
        <p className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-800">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Try with Demo Samples */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 px-1">
          <Sparkles size={14} className="text-amber-500" />
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Belum ada struk fisik? Coba Struk Demo
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {sampleReceipts.map((sample) => {
            const Icon = sample.icon;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className="p-3 rounded-2xl border bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-xs text-left transition flex items-center gap-3 group"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${sample.color}`}
                >
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {sample.title}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Rp {new Intl.NumberFormat("id-ID").format(sample.total)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
