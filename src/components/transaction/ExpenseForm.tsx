"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Check,
  Plus,
  Sparkles,
  Tag,
  Wallet,
  X,
  AlertCircle,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { Category, Asset } from "@/types/finance";
import { useTransaction } from "@/context/TransactionContext";
import IconHelper from "@/components/common/IconHelper";
import OptionalDetailsSection from "./OptionalDetailsSection";

interface ExpenseFormProps {
  onSuccess?: () => void;
  onFormChange?: (data: { amount: number; categoryId: string }) => void;
}

export default function ExpenseForm({ onSuccess, onFormChange }: ExpenseFormProps) {
  const { assets, addTransaction, getCategoryBudgetStatus } = useTransaction();

  // State form
  const [rawAmount, setRawAmount] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("cat-1");
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || "ast-1");
  const [tanggal, setTanggal] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [catatan, setCatatan] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");

  // State Opsional Lengkapi Transaksi
  const [merchant, setMerchant] = useState("");
  const [catatanDetail, setCatatanDetail] = useState("");
  const [optionalTags, setOptionalTags] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isReimbursable, setIsReimbursable] = useState(false);
  const [isSplitBillShortcut, setIsSplitBillShortcut] = useState(false);

  const handleToggleTag = (tag: string) => {
    setOptionalTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Kategori kustom lokal
  const [customCategories, setCustomCategories] = useState<Category[]>([
    { id: "cat-1", nama: "Makan & Minum", tipe: "pengeluaran", ikon: "Utensils", warna: "#f97316" },
    { id: "cat-2", nama: "Kopi & Jajan", tipe: "pengeluaran", ikon: "Coffee", warna: "#8b5cf6" },
    { id: "cat-3", nama: "Transportasi", tipe: "pengeluaran", ikon: "Car", warna: "#3b82f6" },
    { id: "cat-4", nama: "Belanja Bulanan", tipe: "pengeluaran", ikon: "ShoppingBag", warna: "#ec4899" },
    { id: "cat-5", nama: "Tagihan & Pulsa", tipe: "pengeluaran", ikon: "Zap", warna: "#eab308" },
    { id: "cat-6", nama: "Hiburan & Hobi", tipe: "pengeluaran", ikon: "Gamepad2", warna: "#06b6d4" },
  ]);

  // Modal Tambah Kategori
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("ShoppingBag");
  const [newCatColor, setNewCatColor] = useState("#f43f5e");

  interface FormErrors {
    nominal?: string;
    category?: string;
    asset?: string;
    tanggal?: string;
  }
  const [errors, setErrors] = useState<FormErrors>({});

  const parsedAmount = parseInt(rawAmount.replace(/\D/g, ""), 10) || 0;

  useEffect(() => {
    onFormChange?.({ amount: parsedAmount, categoryId: selectedCategoryId });
  }, [parsedAmount, selectedCategoryId, onFormChange]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setRawAmount(val ? new Intl.NumberFormat("id-ID").format(parseInt(val, 10)) : "");
    if (errors.nominal) setErrors((prev) => ({ ...prev, nominal: undefined }));
  };

  const addPreset = (amt: number) => {
    const nextVal = parsedAmount + amt;
    setRawAmount(new Intl.NumberFormat("id-ID").format(nextVal));
    if (errors.nominal) setErrors((prev) => ({ ...prev, nominal: undefined }));
  };

  const selectedAsset = assets.find((a) => a.id === selectedAssetId) || assets[0];
  const selectedCategory =
    customCategories.find((c) => c.id === selectedCategoryId) || customCategories[0];

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat: Category = {
      id: `custom-cat-${Date.now()}`,
      nama: newCatName.trim(),
      tipe: "pengeluaran",
      ikon: newCatIcon,
      warna: newCatColor,
    };

    setCustomCategories((prev) => [...prev, newCat]);
    setSelectedCategoryId(newCat.id);
    if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
    setNewCatName("");
    setIsAddCatModalOpen(false);
  };

  const validateForm = (): boolean => {
    const errs: FormErrors = {};

    if (!parsedAmount || parsedAmount < 500) {
      errs.nominal = "Nominal pengeluaran wajib diisi minimal Rp 500.";
    }

    if (!selectedCategoryId) {
      errs.category = "Kategori pengeluaran wajib dipilih.";
    }

    if (!selectedAssetId) {
      errs.asset = "Aset sumber pembayaran wajib dipilih.";
    } else if (selectedAsset && parsedAmount > selectedAsset.saldo) {
      errs.asset = `Saldo ${selectedAsset.nama} tidak mencukupi (Tersisa ${formatRupiah(selectedAsset.saldo)}).`;
    }

    if (!tanggal) {
      errs.tanggal = "Tanggal transaksi wajib diisi.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const extraInfo = [
      catatan.trim(),
      merchant.trim() ? `@${merchant.trim()}` : "",
      catatanDetail.trim() ? `(${catatanDetail.trim()})` : "",
    ].filter(Boolean).join(" ");

    const allTags = [selectedTag, ...optionalTags].filter(Boolean).join(", ");

    addTransaction({
      tipe: "pengeluaran",
      jumlah: parsedAmount,
      categoryId: selectedCategoryId,
      category: selectedCategory,
      assetId: selectedAssetId,
      catatan: extraInfo || selectedCategory.nama,
      label: allTags || undefined,
      tanggal: new Date(tanggal).toISOString(),
      sumber: photoUrl ? "pindai-struk" : "manual",
    });

    setRawAmount("");
    setCatatan("");
    setSelectedTag("");
    setMerchant("");
    setCatatanDetail("");
    setOptionalTags([]);
    setPhotoUrl(null);
    setIsReimbursable(false);
    setIsSplitBillShortcut(false);
    setErrors({});
    onSuccess?.();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Nominal Pengeluaran */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50/80 via-orange-50/40 to-amber-50/30 border border-rose-100 shadow-2xs">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Nominal JajanAja (Pengeluaran)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-2xl text-rose-500">
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              required
              placeholder="0"
              value={rawAmount}
              onChange={handleAmountChange}
              className="w-full pl-14 pr-4 py-3 bg-white rounded-xl border border-rose-200/80 focus:outline-none focus:ring-2 focus:ring-rose-500 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight shadow-xs"
              autoFocus
            />
          </div>

          {/* Quick Preset Nominal Chips */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 no-scrollbar">
            {[10000, 20000, 50000, 100000, 250000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => addPreset(amt)}
                className="px-2.5 py-1 bg-white hover:bg-rose-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 whitespace-nowrap shadow-2xs transition active:scale-95"
              >
                +{formatRupiah(amt).replace("Rp", "").trim()}
              </button>
            ))}
          </div>

          {errors.nominal && (
            <p className="text-xs font-bold text-rose-600 flex items-center gap-1.5 mt-2.5 bg-rose-50/90 p-2 rounded-lg border border-rose-200 animate-in fade-in">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errors.nominal}</span>
            </p>
          )}
        </div>

        {/* Pilihan Kategori dengan Indikator Sisa Budget */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pilih Kategori Pengeluaran
            </label>
            <button
              type="button"
              onClick={() => setIsAddCatModalOpen(true)}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-md transition"
            >
              <Plus size={13} />
              <span>Tambah Kategori</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {customCategories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              const budgetStatus = getCategoryBudgetStatus(cat.id);

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`p-2.5 rounded-xl border text-left transition relative flex flex-col justify-between active:scale-95 ${
                    isSelected
                      ? "border-rose-500 bg-rose-50/70 ring-2 ring-rose-400"
                      : "border-slate-200 bg-slate-50/50 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: cat.warna }}
                    >
                      <IconHelper name={cat.ikon} size={15} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {cat.nama}
                    </span>
                  </div>

                  {/* Sisa Budget Tag */}
                  {budgetStatus && (
                    <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Sisa:</span>
                      <span
                        className={`font-extrabold ${
                          budgetStatus.persentase >= 80
                            ? "text-rose-600"
                            : "text-emerald-700"
                        }`}
                      >
                        {formatRupiah(budgetStatus.sisa)}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {errors.category && (
            <p className="text-xs font-bold text-rose-600 flex items-center gap-1.5 mt-2 bg-rose-50/90 p-2 rounded-lg border border-rose-200 animate-in fade-in">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errors.category}</span>
            </p>
          )}
        </div>

        {/* Pilihan Aset Sumber Dana */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
            Bayar Menggunakan Aset
          </label>
          <div className="grid grid-cols-2 gap-2">
            {assets.map((ast) => {
              const isSelected = selectedAssetId === ast.id;
              return (
                <button
                  key={ast.id}
                  type="button"
                  onClick={() => {
                    setSelectedAssetId(ast.id);
                    if (errors.asset) setErrors((prev) => ({ ...prev, asset: undefined }));
                  }}
                  className={`p-2.5 rounded-xl border text-left transition active:scale-95 ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50/80 text-emerald-950 ring-1 ring-emerald-500"
                      : "border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold truncate">{ast.nama}</span>
                    <span className="text-[9px] uppercase font-bold text-slate-400 bg-white px-1 rounded border">
                      {ast.jenis}
                    </span>
                  </div>
                  <p className="text-xs font-extrabold text-slate-900 mt-1">
                    {formatRupiah(ast.saldo)}
                  </p>
                </button>
              );
            })}
          </div>

          {errors.asset && (
            <p className="text-xs font-bold text-rose-600 flex items-center gap-1.5 mt-2 bg-rose-50/90 p-2 rounded-lg border border-rose-200 animate-in fade-in">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errors.asset}</span>
            </p>
          )}
        </div>

        {/* Tanggal & Catatan & Tag */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Tanggal Transaksi
            </label>
            <div className="relative">
              <Calendar
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="date"
                value={tanggal}
                onChange={(e) => {
                  setTanggal(e.target.value);
                  if (errors.tanggal) setErrors((prev) => ({ ...prev, tanggal: undefined }));
                }}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
            {errors.tanggal && (
              <p className="text-xs font-bold text-rose-600 flex items-center gap-1 mt-1 animate-in fade-in">
                <AlertCircle size={13} className="shrink-0" />
                <span>{errors.tanggal}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Catatan Pengeluaran
            </label>
            <input
              type="text"
              placeholder="Contoh: Kopi Kenangan Mantan + Donat"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* Quick Label Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Tag size={12} />
              <span>Label Cepat</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {["Makan Siang", "Nongkrong", "Kerja", "Dapur", "Jajan Sore", "Keluarga"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    selectedTag === tag
                      ? "bg-rose-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bagian Opsional: Lengkapi Transaksi */}
        <OptionalDetailsSection
          merchant={merchant}
          setMerchant={setMerchant}
          catatanDetail={catatanDetail}
          setCatatanDetail={setCatatanDetail}
          selectedTags={optionalTags}
          onToggleTag={handleToggleTag}
          photoUrl={photoUrl}
          setPhotoUrl={setPhotoUrl}
          isReimbursable={isReimbursable}
          setIsReimbursable={setIsReimbursable}
          isSplitBillShortcut={isSplitBillShortcut}
          setIsSplitBillShortcut={setIsSplitBillShortcut}
          type="pengeluaran"
        />

        {/* Live Simulation Banner */}
        {parsedAmount > 0 && (
          <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs space-y-1 animate-in fade-in">
            <div className="flex items-center gap-1.5 font-bold text-rose-400">
              <Sparkles size={14} />
              <span>Simulasi Pengeluaran JajanAja:</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Saldo <strong>{selectedAsset.nama}</strong> akan berkurang sebesar{" "}
              <strong>{formatRupiah(parsedAmount)}</strong> menjadi{" "}
              <span className="text-amber-300 font-bold">
                {formatRupiah(Math.max(0, selectedAsset.saldo - parsedAmount))}
              </span>
              . Kategori <strong>{selectedCategory.nama}</strong> akan dicatat di
              dashboard.
            </p>
          </div>
        )}

        {/* Tombol Simpan JajanAja */}
        <button
          type="submit"
          disabled={parsedAmount <= 0}
          className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 transition active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
        >
          <Check size={18} />
          <span>
            Simpan JajanAja ({rawAmount ? `Rp ${rawAmount}` : "Rp 0"})
          </span>
        </button>
      </form>

      {/* Modal Tambah Kategori Kustom */}
      {isAddCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">
                Tambah Kategori Pengeluaran
              </h3>
              <button
                type="button"
                onClick={() => setIsAddCatModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleAddCategorySubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Skincare, Gym, Kucing..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Pilih Warna
                </label>
                <div className="flex items-center gap-2">
                  {["#f43f5e", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#06b6d4"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewCatColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        newCatColor === c ? "scale-125 ring-2 ring-slate-900" : ""
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
