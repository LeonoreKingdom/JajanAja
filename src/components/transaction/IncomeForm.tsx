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
  TrendingUp,
  Coins,
  Building2,
  Smartphone,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { Category, Asset, AssetType } from "@/types/finance";
import { useTransaction } from "@/context/TransactionContext";
import IconHelper from "@/components/common/IconHelper";
import OptionalDetailsSection from "./OptionalDetailsSection";

interface IncomeFormProps {
  onSuccess?: () => void;
  onFormChange?: (data: { amount: number; categoryId: string }) => void;
}

export default function IncomeForm({ onSuccess, onFormChange }: IncomeFormProps) {
  const { assets, addTransaction } = useTransaction();

  // State form
  const [rawAmount, setRawAmount] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("cat-7");
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || "ast-1");
  const [assetFilter, setAssetFilter] = useState<"semua" | AssetType>("semua");
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

  interface FormErrors {
    nominal?: string;
    category?: string;
    asset?: string;
    tanggal?: string;
  }
  const [errors, setErrors] = useState<FormErrors>({});

  const handleToggleTag = (tag: string) => {
    setOptionalTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Kategori pemasukan
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([
    { id: "cat-7", nama: "Gaji Utama", tipe: "pemasukan", ikon: "Briefcase", warna: "#10b981" },
    { id: "cat-8", nama: "Freelance / Side Project", tipe: "pemasukan", ikon: "Laptop", warna: "#14b8a6" },
    { id: "cat-9", nama: "Investasi & Dividen", tipe: "pemasukan", ikon: "TrendingUp", warna: "#6366f1" },
    { id: "cat-10", nama: "Bonus & THR", tipe: "pemasukan", ikon: "Award", warna: "#f59e0b" },
    { id: "cat-11", nama: "Hadiah / Hibah", tipe: "pemasukan", ikon: "Gift", warna: "#ec4899" },
    { id: "cat-12", nama: "Pemasukan Lainnya", tipe: "pemasukan", ikon: "Coins", warna: "#06b6d4" },
  ]);

  // Modal Tambah Kategori
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("PlusCircle");
  const [newCatColor, setNewCatColor] = useState("#10b981");

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

  const filteredAssets = assets.filter((ast) => {
    if (assetFilter === "semua") return true;
    return ast.jenis === assetFilter;
  });

  const selectedAsset = assets.find((a) => a.id === selectedAssetId) || assets[0];
  const selectedCategory =
    incomeCategories.find((c) => c.id === selectedCategoryId) || incomeCategories[0];

  const getAssetIcon = (jenis: AssetType) => {
    switch (jenis) {
      case "bank":
        return <Building2 size={16} />;
      case "e-wallet":
        return <Smartphone size={16} />;
      case "tunai":
        return <Coins size={16} />;
      default:
        return <Wallet size={16} />;
    }
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat: Category = {
      id: `income-cat-${Date.now()}`,
      nama: newCatName.trim(),
      tipe: "pemasukan",
      ikon: newCatIcon,
      warna: newCatColor,
    };

    setIncomeCategories((prev) => [...prev, newCat]);
    setSelectedCategoryId(newCat.id);
    if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
    setNewCatName("");
    setIsAddCatModalOpen(false);
  };

  const validateForm = (): boolean => {
    const errs: FormErrors = {};

    if (!parsedAmount || parsedAmount < 500) {
      errs.nominal = "Nominal pemasukan wajib diisi minimal Rp 500.";
    }

    if (!selectedCategoryId) {
      errs.category = "Kategori pemasukan wajib dipilih.";
    }

    if (!selectedAssetId) {
      errs.asset = "Aset tujuan penerimaan dana wajib dipilih.";
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
      merchant.trim() ? `dari ${merchant.trim()}` : "",
      catatanDetail.trim() ? `(${catatanDetail.trim()})` : "",
    ].filter(Boolean).join(" ");

    const allTags = [selectedTag, ...optionalTags].filter(Boolean).join(", ");

    addTransaction({
      tipe: "pemasukan",
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
    setErrors({});
    onSuccess?.();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Nominal Pemasukan */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-cyan-50/30 border border-emerald-100 shadow-2xs">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Nominal NabungAja (Pemasukan)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-2xl text-emerald-600">
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              required
              placeholder="0"
              value={rawAmount}
              onChange={handleAmountChange}
              className="w-full pl-14 pr-4 py-3 bg-white rounded-xl border border-emerald-200/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight shadow-xs"
              autoFocus
            />
          </div>

          {/* Quick Preset Nominal Pemasukan */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 no-scrollbar">
            {[500000, 1000000, 2500000, 5000000, 10000000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => addPreset(amt)}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 whitespace-nowrap shadow-2xs transition active:scale-95"
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

        {/* Pilihan Kategori Pemasukan */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pilih Kategori Pemasukan
            </label>
            <button
              type="button"
              onClick={() => setIsAddCatModalOpen(true)}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md transition"
            >
              <Plus size={13} />
              <span>Tambah Kategori</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {incomeCategories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId(cat.id);
                    if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
                  }}
                  className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between active:scale-95 ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500"
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
                  <span className="text-[10px] text-emerald-700 font-semibold mt-2 block">
                    Pemasukan
                  </span>
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

        {/* Pilihan Aset Tujuan Masuk dengan Filter & Live Proyeksi Saldo */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pilih Aset Tujuan Pemasukan
              </label>
              <p className="text-[11px] text-slate-400">
                Pilih rekening atau dompet tempat dana masuk
              </p>
            </div>

            {/* Filter Jenis Aset */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-[10px] font-semibold">
              {(["semua", "bank", "e-wallet", "tunai"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAssetFilter(type)}
                  className={`px-2 py-0.5 rounded-md capitalize transition ${
                    assetFilter === type
                      ? "bg-white text-emerald-800 shadow-2xs font-bold"
                      : "text-slate-500"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredAssets.map((ast) => {
              const isSelected = selectedAssetId === ast.id;
              const projectedSaldo = ast.saldo + parsedAmount;

              return (
                <button
                  key={ast.id}
                  type="button"
                  onClick={() => {
                    setSelectedAssetId(ast.id);
                    if (errors.asset) setErrors((prev) => ({ ...prev, asset: undefined }));
                  }}
                  className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between active:scale-[0.99] ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500 shadow-2xs"
                      : "border-slate-200 bg-slate-50/40 hover:bg-slate-100/70 text-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
                        {getAssetIcon(ast.jenis)}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {ast.nama}
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-slate-400">
                          {ast.jenis}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] shadow-xs">
                        ✓
                      </span>
                    )}
                  </div>

                  {/* Saldo Saat ini vs Proyeksi */}
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">
                        Saldo saat ini:
                      </span>
                      <span className="font-bold text-slate-800">
                        {formatRupiah(ast.saldo)}
                      </span>
                    </div>

                    {parsedAmount > 0 && isSelected && (
                      <div className="text-right">
                        <span className="text-[10px] text-emerald-600 font-bold block flex items-center gap-0.5 justify-end">
                          <ArrowRight size={10} /> Menjadi:
                        </span>
                        <span className="font-extrabold text-emerald-700">
                          {formatRupiah(projectedSaldo)}
                        </span>
                      </div>
                    )}
                  </div>
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
              Tanggal Diterima
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
                className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            {errors.tanggal && (
              <p className="text-xs font-bold text-rose-600 flex items-center gap-1.5 mt-1 bg-rose-50/90 p-2 rounded-lg border border-rose-200 animate-in fade-in">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errors.tanggal}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Catatan Pemasukan
            </label>
            <input
              type="text"
              placeholder="Contoh: Gaji bulan September, DP Project Website..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Quick Label Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Tag size={12} />
              <span>Label Cepat</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {["Gaji Bulanan", "Project Side", "Bonus", "Investasi", "Cashback", "Reward"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    selectedTag === tag
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bagian Opsional: Lengkapi Transaksi Pemasukan */}
        <OptionalDetailsSection
          merchant={merchant}
          setMerchant={setMerchant}
          catatanDetail={catatanDetail}
          setCatatanDetail={setCatatanDetail}
          selectedTags={optionalTags}
          onToggleTag={handleToggleTag}
          photoUrl={photoUrl}
          setPhotoUrl={setPhotoUrl}
          availableTags={["Gaji", "Side Project", "Dividen", "Bonus", "THR", "Keluarga"]}
          type="pemasukan"
        />

        {/* Live Simulation Banner NabungAja */}
        {parsedAmount > 0 && (
          <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs space-y-1 animate-in fade-in">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400">
              <Sparkles size={14} />
              <span>Simulasi Pemasukan NabungAja:</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Saldo <strong>{selectedAsset.nama}</strong> akan bertambah sebesar{" "}
              <strong>{formatRupiah(parsedAmount)}</strong> menjadi{" "}
              <span className="text-emerald-300 font-bold">
                {formatRupiah(selectedAsset.saldo + parsedAmount)}
              </span>
              . Selamat atas tambahan tabunganmu! 🎉
            </p>
          </div>
        )}

        {/* Tombol Simpan NabungAja */}
        <button
          type="submit"
          className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 transition active:scale-[0.99]"
        >
          <Check size={18} />
          <span>
            Simpan NabungAja ({rawAmount ? `Rp ${rawAmount}` : "Rp 0"})
          </span>
        </button>
      </form>

      {/* Modal Tambah Kategori Kustom */}
      {isAddCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">
                Tambah Kategori Pemasukan
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
                  Nama Kategori Pemasukan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Royalti, Jual Barang Bekas..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Pilih Warna
                </label>
                <div className="flex items-center gap-2">
                  {["#10b981", "#14b8a6", "#3b82f6", "#6366f1", "#f59e0b", "#06b6d4"].map((c) => (
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
                  className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
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
