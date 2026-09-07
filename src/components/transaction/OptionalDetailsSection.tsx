"use client";

import React, { useState, useRef } from "react";
import {
  Camera,
  ChevronDown,
  ChevronUp,
  FileText,
  Image as ImageIcon,
  MapPin,
  Receipt,
  Sparkles,
  Tag,
  Users,
  X,
} from "lucide-react";

interface OptionalDetailsSectionProps {
  merchant: string;
  setMerchant: (val: string) => void;
  catatanDetail: string;
  setCatatanDetail: (val: string) => void;
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  photoUrl: string | null;
  setPhotoUrl: (url: string | null) => void;
  isReimbursable?: boolean;
  setIsReimbursable?: (val: boolean) => void;
  isSplitBillShortcut?: boolean;
  setIsSplitBillShortcut?: (val: boolean) => void;
  availableTags?: string[];
  type?: "pengeluaran" | "pemasukan";
}

export default function OptionalDetailsSection({
  merchant,
  setMerchant,
  catatanDetail,
  setCatatanDetail,
  selectedTags,
  onToggleTag,
  photoUrl,
  setPhotoUrl,
  isReimbursable,
  setIsReimbursable,
  isSplitBillShortcut,
  setIsSplitBillShortcut,
  availableTags = [
    "Reimburse",
    "Nongkrong",
    "Kerja",
    "Keluarga",
    "Darurat",
    "Rutin Bulanan",
  ],
  type = "pengeluaran",
}: OptionalDetailsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const filledCount = [
    merchant.trim() !== "",
    catatanDetail.trim() !== "",
    selectedTags.length > 0,
    photoUrl !== null,
    isReimbursable,
    isSplitBillShortcut,
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs transition-all">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/80 transition"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shadow-2xs">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">
                Lengkapi Transaksi
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                (Opsional)
              </span>
              {filledCount > 0 && (
                <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded-full">
                  {filledCount} terisi
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Foto struk, lokasi merchant, tag & catatan detail
            </p>
          </div>
        </div>

        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
          {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </button>

      {/* Accordion Body Content */}
      {isOpen && (
        <div className="p-4 pt-1 border-t border-slate-100 space-y-4 animate-in fade-in">
          {/* 1. Merchant / Lokasi Toko */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <MapPin size={12} className="text-slate-400" />
              <span>Lokasi / Nama Merchant</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Kopi Kenangan Mall Kota Kasablanka, Indomaret..."
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* 2. Upload / Foto Struk Belanja */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Camera size={12} className="text-slate-400" />
              <span>Lampiran Foto Struk / Bukti Transfer</span>
            </label>

            {photoUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-2 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl}
                  alt="Bukti struk"
                  className="w-14 h-14 object-cover rounded-lg border border-slate-200"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-bold text-slate-800 truncate">
                    Foto Struk Terlampir
                  </p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                    ✓ Siap disimpan bersama transaksi
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPhotoUrl(null)}
                  className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition"
                  title="Hapus foto"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-xl p-3 text-center cursor-pointer bg-slate-50/50 hover:bg-purple-50/30 transition flex flex-col items-center justify-center gap-1"
              >
                <div className="w-8 h-8 rounded-lg bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-purple-600">
                  <Camera size={16} />
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  Ketuk untuk ambil foto / upload struk
                </span>
                <span className="text-[10px] text-slate-400">
                  PNG, JPG hingga 5MB
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* 3. Catatan Multi-Line Detail Barang */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <FileText size={12} className="text-slate-400" />
              <span>Rincian Catatan / Item</span>
            </label>
            <textarea
              rows={2}
              placeholder="Catat rincian barang, nomor invoice, atau pengingat transaksi..."
              value={catatanDetail}
              onChange={(e) => setCatatanDetail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* 4. Multi-Tags Pilihan */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Tag size={12} className="text-slate-400" />
              <span>Tag Tambahan</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onToggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      isSelected
                        ? "bg-purple-600 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Checkbox Tambahan: Reimburse & Split Bill */}
          {type === "pengeluaran" && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              {setIsReimbursable && (
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 font-medium select-none">
                  <input
                    type="checkbox"
                    checked={isReimbursable}
                    onChange={(e) => setIsReimbursable(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                  />
                  <span>
                    Bisa di-reimburse kantor / pihak lain (Tandai tagihan)
                  </span>
                </label>
              )}

              {setIsSplitBillShortcut && (
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 font-medium select-none">
                  <input
                    type="checkbox"
                    checked={isSplitBillShortcut}
                    onChange={(e) => setIsSplitBillShortcut(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                  />
                  <span>
                    Bagi tagihan ini dengan teman nanti (Jadikan Split Bill)
                  </span>
                </label>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
