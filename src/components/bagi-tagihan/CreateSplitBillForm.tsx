"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Trash2,
  Receipt,
  Store,
  Calendar,
  DollarSign,
  Calculator,
  Equal,
  SlidersHorizontal,
  ArrowLeft,
  Check,
  AlertCircle,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { SplitBillGroup, SplitMethod, SplitParticipant } from "@/types/split-bill";
import { formatRupiah } from "@/lib/utils";
import { createSplitBillApi } from "@/lib/split-bill-storage";

const STORAGE_KEY = "jajanaja_split_bills";

interface CreateSplitBillFormProps {
  onSuccess?: (newBill: SplitBillGroup) => void;
  onCancel?: () => void;
}

export default function CreateSplitBillForm({
  onSuccess,
  onCancel,
}: CreateSplitBillFormProps) {
  const router = useRouter();

  const [judul, setJudul] = useState("");
  const [namaToko, setNamaToko] = useState("");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [totalTagihan, setTotalTagihan] = useState<number>(0);
  const [metode, setMetode] = useState<SplitMethod>("sama_rata");
  const [catatan, setCatatan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pesertaList, setPesertaList] = useState<
    Array<{ id: string; nama: string; bagian: number; nomorHp?: string; sudahBayar: boolean }>
  >([
    { id: "p-user", nama: "Kamu", bagian: 0, sudahBayar: true },
    { id: "p-2", nama: "Dimas", bagian: 0, sudahBayar: false },
    { id: "p-3", nama: "Sarah", bagian: 0, sudahBayar: false },
  ]);

  const [newFriendName, setNewFriendName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Otomatis hitung pembagian sama rata saat totalTagihan atau jumlah peserta berubah
  useEffect(() => {
    if (metode === "sama_rata" && pesertaList.length > 0 && totalTagihan > 0) {
      const count = pesertaList.length;
      const baseShare = Math.floor(totalTagihan / count);
      const remainder = totalTagihan - baseShare * count;

      setPesertaList((prev) =>
        prev.map((p, idx) => ({
          ...p,
          bagian: idx === 0 ? baseShare + remainder : baseShare,
        }))
      );
    }
  }, [totalTagihan, metode, pesertaList.length]);

  // Hitung total bagian yang teralokasi
  const totalAlokasi = pesertaList.reduce((acc, p) => acc + (p.bagian || 0), 0);
  const selisihAlokasi = totalTagihan - totalAlokasi;

  const handleAddFriend = () => {
    if (!newFriendName.trim()) return;
    const newId = `p-${Date.now()}`;
    const updated = [
      ...pesertaList,
      {
        id: newId,
        nama: newFriendName.trim(),
        bagian: 0,
        sudahBayar: false,
      },
    ];
    setPesertaList(updated);
    setNewFriendName("");
    setErrorMessage(null);
  };

  const handleRemoveFriend = (id: string) => {
    if (id === "p-user") return; // Jangan hapus user sendiri
    if (pesertaList.length <= 2) {
      setErrorMessage("Minimal harus ada 2 peserta untuk bagi tagihan.");
      return;
    }
    setPesertaList((prev) => prev.filter((p) => p.id !== id));
    setErrorMessage(null);
  };

  const handleUpdateCustomAmount = (id: string, amount: number) => {
    setPesertaList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, bagian: amount } : p))
    );
    setErrorMessage(null);
  };

  const handleDistributeRemainder = () => {
    if (selisihAlokasi === 0 || pesertaList.length === 0) return;
    // Bagikan sisa selisih ke peserta pertama (Kamu) atau bagi rata
    setPesertaList((prev) =>
      prev.map((p, idx) =>
        idx === 0 ? { ...p, bagian: Math.max(0, p.bagian + selisihAlokasi) } : p
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!judul.trim()) {
      setErrorMessage("Judul tagihan wajib diisi.");
      return;
    }

    if (totalTagihan <= 0) {
      setErrorMessage("Total tagihan harus lebih dari 0.");
      return;
    }

    if (pesertaList.length < 2) {
      setErrorMessage("Minimal harus ada 2 orang dalam bagi tagihan.");
      return;
    }

    if (metode === "nominal_bebas" && selisihAlokasi !== 0) {
      setErrorMessage(
        `Total alokasi (${formatRupiah(totalAlokasi)}) belum sesuai dengan total tagihan (${formatRupiah(totalTagihan)}). Selisih: ${formatRupiah(
          Math.abs(selisihAlokasi)
        )}.`
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const created = await createSplitBillApi({
        judul: judul.trim(),
        totalTagihan,
        tanggal,
        metode,
        namaToko: namaToko.trim() || undefined,
        catatan: catatan.trim() || undefined,
        peserta: pesertaList,
      });

      if (created) {
        if (onSuccess) {
          onSuccess(created);
        } else {
          router.push("/bagi-tagihan");
        }
      } else {
        // Fallback local
        const fallbackBill: SplitBillGroup = {
          id: `split-${Date.now()}`,
          judul: judul.trim(),
          namaToko: namaToko.trim() || undefined,
          tanggal,
          totalTagihan,
          metode,
          catatan: catatan.trim() || undefined,
          peserta: pesertaList,
          status: "aktif",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          const currentList: SplitBillGroup[] = saved ? JSON.parse(saved) : [];
          localStorage.setItem(STORAGE_KEY, JSON.stringify([fallbackBill, ...currentList]));
        } catch {}

        if (onSuccess) {
          onSuccess(fallbackBill);
        } else {
          router.push("/bagi-tagihan");
        }
      }
    } catch (err) {
      console.error("Gagal membuat bagi tagihan:", err);
      setErrorMessage("Gagal membuat bagi tagihan ke database. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs p-3 rounded-2xl flex items-start gap-2 animate-in fade-in">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Informasi Umum Tagihan */}
      <div className="bg-white dark:bg-slate-850 rounded-3xl p-4 border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-3.5">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <Receipt size={16} className="text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Informasi Tagihan
          </h3>
        </div>

        {/* Judul Tagihan */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Judul Tagihan *
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Makan Siang Resto Padang"
            value={judul}
            onChange={(e) => {
              setJudul(e.target.value);
              setErrorMessage(null);
            }}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Toko & Tanggal */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Nama Toko / Lokasi
            </label>
            <div className="relative">
              <Store size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Resto / Cafe"
                value={namaToko}
                onChange={(e) => setNamaToko(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Tanggal Tagihan
            </label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Total Tagihan (Rp) */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Total Tagihan Keseluruhan *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-base">
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              required
              placeholder="0"
              value={totalTagihan > 0 ? new Intl.NumberFormat("id-ID").format(totalTagihan) : ""}
              onChange={(e) => {
                const val = parseInt(e.target.value.replace(/\D/g, ""), 10) || 0;
                setTotalTagihan(val);
                setErrorMessage(null);
              }}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-lg font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Pilihan Metode Pembagian */}
      <div className="bg-white dark:bg-slate-850 rounded-3xl p-4 border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Calculator size={16} className="text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Metode Pembagian
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            {metode === "sama_rata" ? "Rata per orang" : "Atur bebas"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setMetode("sama_rata")}
            className={`p-3 rounded-2xl border text-left transition flex flex-col gap-1 ${
              metode === "sama_rata"
                ? "border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20"
                : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-1.5">
                <Equal size={14} className={metode === "sama_rata" ? "text-blue-600 dark:text-blue-400" : "text-slate-400"} />
                Sama Rata
              </span>
              {metode === "sama_rata" && (
                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
              )}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              Total tagihan otomatis dibagi rata ke semua teman.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setMetode("nominal_bebas")}
            className={`p-3 rounded-2xl border text-left transition flex flex-col gap-1 ${
              metode === "nominal_bebas"
                ? "border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20"
                : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-1.5">
                <SlidersHorizontal size={14} className={metode === "nominal_bebas" ? "text-blue-600 dark:text-blue-400" : "text-slate-400"} />
                Nominal Bebas
              </span>
              {metode === "nominal_bebas" && (
                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
              )}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              Tentukan sendiri bagian uang tiap teman secara spesifik.
            </p>
          </button>
        </div>
      </div>

      {/* Daftar Teman / Peserta & Alokasi Bagian */}
      <div className="bg-white dark:bg-slate-850 rounded-3xl p-4 border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Daftar Teman ({pesertaList.length} Orang)
            </h3>
          </div>
          {metode === "sama_rata" && totalTagihan > 0 && (
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
              @{formatRupiah(Math.floor(totalTagihan / pesertaList.length))} / org
            </span>
          )}
        </div>

        {/* List Input Peserta */}
        <div className="space-y-2.5">
          {pesertaList.map((peserta) => {
            const isUser = peserta.id === "p-user";

            return (
              <div
                key={peserta.id}
                className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {peserta.nama.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-800 dark:text-white truncate">
                      {peserta.nama} {isUser && <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">(Kamu)</span>}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {isUser ? "Penanggung awal" : "Teman patungan"}
                    </p>
                  </div>
                </div>

                {/* Input Bagian Nominal */}
                <div className="flex items-center gap-2">
                  {metode === "sama_rata" ? (
                    <span className="font-black text-xs text-slate-900 dark:text-white px-3 py-1.5 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 shadow-2xs">
                      {formatRupiah(peserta.bagian)}
                    </span>
                  ) : (
                    <div className="relative w-28">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                        Rp
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={peserta.bagian > 0 ? new Intl.NumberFormat("id-ID").format(peserta.bagian) : ""}
                        onChange={(e) => {
                          const val = parseInt(e.target.value.replace(/\D/g, ""), 10) || 0;
                          handleUpdateCustomAmount(peserta.id, val);
                        }}
                        className="w-full pl-7 pr-2 py-1.5 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                      />
                    </div>
                  )}

                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFriend(peserta.id)}
                      className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition"
                      title="Hapus peserta"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Tambah Teman Baru */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            placeholder="Tambah nama teman..."
            value={newFriendName}
            onChange={(e) => setNewFriendName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddFriend();
              }
            }}
            className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <button
            type="button"
            onClick={handleAddFriend}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-300 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
          >
            <Plus size={14} />
            <span>Tambah</span>
          </button>
        </div>

        {/* Indikator Rekapitulasi Alokasi Nominal Bebas */}
        {metode === "nominal_bebas" && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span>Total Teralokasi:</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatRupiah(totalAlokasi)}</span>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-300">Sisa Belum Dibagi:</span>
              <span
                className={`font-black ${
                  selisihAlokasi === 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : selisihAlokasi > 0
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {selisihAlokasi === 0
                  ? "✓ Pas (100%)"
                  : selisihAlokasi > 0
                  ? `${formatRupiah(selisihAlokasi)} lagi`
                  : `Kelebihan ${formatRupiah(Math.abs(selisihAlokasi))}`}
              </span>
            </div>

            {selisihAlokasi !== 0 && (
              <button
                type="button"
                onClick={handleDistributeRemainder}
                className="w-full py-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-xl transition mt-1"
              >
                ⚡ Alokasikan Sisa ke Kamu ({formatRupiah(selisihAlokasi)})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Catatan Tambahan (Opsional) */}
      <div className="bg-white dark:bg-slate-850 rounded-3xl p-4 border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-1.5">
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Catatan Tambahan (Opsional)
        </label>
        <textarea
          rows={2}
          placeholder="Tuliskan nomor rekening tujuan transfer atau rincian pesanan..."
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
      </div>

      {/* Tombol Aksi Bawah */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => (onCancel ? onCancel() : router.back())}
          className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          Batal
        </button>

        <button
          type="submit"
          disabled={isSubmitting || totalTagihan <= 0 || (metode === "nominal_bebas" && selisihAlokasi !== 0)}
          className="flex-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none transition active:scale-95 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Menyimpan ke Database...</span>
            </>
          ) : (
            <>
              <Check size={16} />
              <span>Simpan & Buat Bagi Tagihan</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
