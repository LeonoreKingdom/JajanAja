"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Store,
  CheckCircle2,
  Clock,
  Share2,
  Trash2,
  Users,
  Check,
  Send,
  AlertTriangle,
  Receipt,
  RotateCcw,
} from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import { SplitBillGroup, SplitParticipant } from "@/types/split-bill";
import {
  getSplitBillById,
  updatePesertaStatusApi,
  deleteSplitBillApi,
} from "@/lib/split-bill-storage";
import { formatRupiah } from "@/lib/utils";

export default function DetailBagiTagihanPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [bill, setBill] = useState<SplitBillGroup | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      getSplitBillById(id).then((found) => {
        if (found) {
          setBill(found);
        }
        setIsLoaded(true);
      });
    }
  }, [id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  if (isLoaded && !bill) {
    return (
      <div className="flex-1 flex flex-col p-4 pb-28 space-y-4 max-w-lg mx-auto w-full text-center">
        <div className="pt-12 space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto text-2xl">
            ⚠️
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Tagihan Tidak Ditemukan
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Data Bagi Tagihan dengan ID ini tidak tersedia atau sudah dihapus dari database.
          </p>
          <Link
            href="/bagi-tagihan"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-200 dark:shadow-none"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Daftar Tagihan</span>
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Agregasi pelunasan
  const totalPeserta = bill.peserta.length;
  const lunasPeserta = bill.peserta.filter((p) => p.sudahBayar).length;
  const totalTerkumpul = bill.peserta
    .filter((p) => p.sudahBayar)
    .reduce((sum, p) => sum + p.bagian, 0);
  const sisaBelumTerkumpul = bill.totalTagihan - totalTerkumpul;
  const percentLunas = Math.round((totalTerkumpul / bill.totalTagihan) * 100);

  // Toggle status bayar peserta
  const handleTogglePayment = async (participantId: string) => {
    const targetPeserta = bill.peserta.find((p) => p.id === participantId);
    if (!targetPeserta) return;

    const nextStatus = !targetPeserta.sudahBayar;
    const updatedPeserta = bill.peserta.map((p) => {
      if (p.id !== participantId) return p;
      return { ...p, sudahBayar: nextStatus };
    });

    const isAllPaid = updatedPeserta.every((p) => p.sudahBayar);

    const updated: SplitBillGroup = {
      ...bill,
      peserta: updatedPeserta,
      status: (isAllPaid ? "selesai" : "aktif") as "aktif" | "selesai",
      updatedAt: new Date().toISOString(),
    };

    setBill(updated);
    showToast("Status pembayaran diperbarui!");

    try {
      const res = await updatePesertaStatusApi(bill.id, participantId, nextStatus);
      if (res) setBill(res);
    } catch (e) {
      console.warn("Gagal update status di API:", e);
    }
  };

  // Tandai semua lunas
  const handleMarkAllPaid = async () => {
    const updatedPeserta = bill.peserta.map((p) => ({ ...p, sudahBayar: true }));
    const updated: SplitBillGroup = {
      ...bill,
      peserta: updatedPeserta,
      status: "selesai",
      updatedAt: new Date().toISOString(),
    };
    setBill(updated);
    showToast("Semua peserta berhasil ditandai Lunas!");

    for (const p of bill.peserta) {
      if (!p.sudahBayar) {
        try {
          await updatePesertaStatusApi(bill.id, p.id, true);
        } catch {}
      }
    }
  };

  // Bagikan WhatsApp
  const handleShareWhatsApp = () => {
    const textLines = [
      `🧾 *Bagi Tagihan: ${bill.judul}*`,
      bill.namaToko ? `📍 Lokasi: ${bill.namaToko}` : "",
      `📅 Tanggal: ${bill.tanggal}`,
      `💰 Total: ${formatRupiah(bill.totalTagihan)}`,
      "",
      `*Rincian Bagian Teman:*`,
      ...bill.peserta.map(
        (p) =>
          `• ${p.nama}: ${formatRupiah(p.bagian)} ${
            p.sudahBayar ? "✅ (Lunas)" : "⏳ (Belum Bayar)"
          }`
      ),
      "",
      `Transfer ke rekening BCA / GoPay / OVO ya. Terima kasih! 🙏`,
    ].filter(Boolean);

    navigator.clipboard.writeText(textLines.join("\n"));
    setCopiedId("all");
    showToast("✓ Rincian tagihan disalin! Siap dikirim via WhatsApp.");
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Hapus Tagihan
  const handleDeleteBill = async () => {
    try {
      await deleteSplitBillApi(bill.id);
    } catch {}
    router.push("/bagi-tagihan");
  };

  return (
    <div className="flex-1 flex flex-col p-4 pb-28 space-y-4 max-w-lg mx-auto w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg border border-slate-700 animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-3xl p-5 space-y-4 shadow-2xl text-center border border-slate-100 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto text-xl">
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Hapus Bagi Tagihan Ini?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Riwayat pembagian tagihan &quot;{bill.judul}&quot; akan dihapus permanen dari database.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteBill}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-md shadow-rose-200 dark:shadow-none cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Halaman */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-base font-black text-slate-900 dark:text-white">
              Rincian Tagihan
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              Kelola status pelunasan teman
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsDeleteModalOpen(true)}
          className="w-9 h-9 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition cursor-pointer"
          title="Hapus tagihan"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Hero Banner Kartu Tagihan */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-5 space-y-4 shadow-lg shadow-blue-200 dark:shadow-none">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                bill.status === "selesai"
                  ? "bg-emerald-400/30 text-emerald-100 border border-emerald-300/40"
                  : "bg-amber-400/30 text-amber-100 border border-amber-300/40"
              }`}
            >
              {bill.status === "selesai" ? "✓ Lunas Semua" : "⏳ Sedang Berjalan"}
            </span>
            <h2 className="text-lg font-black leading-tight pt-1">
              {bill.judul}
            </h2>
            <div className="flex items-center gap-3 text-xs text-blue-100">
              {bill.namaToko && (
                <span className="flex items-center gap-1">
                  <Store size={12} />
                  <span>{bill.namaToko}</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                <span>{bill.tanggal}</span>
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-blue-200 uppercase font-semibold">
              Total Tagihan
            </span>
            <p className="text-xl font-black">{formatRupiah(bill.totalTagihan)}</p>
          </div>
        </div>

        {/* Progress Bar Pelunasan */}
        <div className="space-y-1.5 pt-2 border-t border-white/20">
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-100">
              Terkumpul: <strong>{formatRupiah(totalTerkumpul)}</strong>
            </span>
            <span className="font-extrabold text-white">{percentLunas}% Lunas</span>
          </div>
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${percentLunas}%` }}
            />
          </div>
        </div>

        {/* Breakdown Terkumpul & Belum */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1 text-blue-100">
          <div>
            <span className="text-[10px] text-blue-200 block">Lunas</span>
            <span className="font-bold text-white">
              {lunasPeserta} dari {totalPeserta} teman
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-blue-200 block">Belum Ditagih</span>
            <span className="font-bold text-amber-300">
              {formatRupiah(sisaBelumTerkumpul)}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action: Tandai Semua Lunas */}
      {bill.status !== "selesai" && (
        <button
          type="button"
          onClick={handleMarkAllPaid}
          className="w-full py-2.5 px-4 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition border border-emerald-200 dark:border-emerald-800/60 shadow-2xs active:scale-95 cursor-pointer"
        >
          <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
          <span>Tandai Semua Teman Sudah Lunas</span>
        </button>
      )}

      {/* Daftar Rincian Peserta */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Daftar Peserta ({totalPeserta})
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 italic">
            {bill.metode === "sama_rata" ? "Sama Rata" : "Nominal Bebas"}
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-1">
          {bill.peserta.map((peserta) => {
            const isUser = peserta.nama.toLowerCase().includes("kamu");

            return (
              <div
                key={peserta.id}
                className="pt-2 first:pt-0 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      peserta.sudahBayar
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                        : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                    }`}
                  >
                    {peserta.nama.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate flex items-center gap-1">
                      <span>{peserta.nama}</span>
                      {isUser && (
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                          (Kamu)
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] font-black text-slate-900 dark:text-white">
                      {formatRupiah(peserta.bagian)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleTogglePayment(peserta.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer ${
                      peserta.sudahBayar
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60"
                        : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/60"
                    }`}
                  >
                    {peserta.sudahBayar ? (
                      <>
                        <CheckCircle2 size={13} className="text-emerald-700 dark:text-emerald-400" />
                        <span>Lunas</span>
                      </>
                    ) : (
                      <>
                        <Clock size={13} className="text-amber-700 dark:text-amber-400" />
                        <span>Belum</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Catatan Tambahan */}
      {bill.catatan && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Catatan Tambahan
          </span>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{bill.catatan}</p>
        </div>
      )}

      {/* Bagikan Tagihan via WhatsApp */}
      <button
        type="button"
        onClick={handleShareWhatsApp}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none active:scale-95 transition cursor-pointer"
      >
        {copiedId === "all" ? (
          <>
            <Check size={16} />
            <span>Format Pesan Tagihan Tersalin!</span>
          </>
        ) : (
          <>
            <Share2 size={16} />
            <span>Bagikan Rincian Patungan ke WhatsApp</span>
          </>
        )}
      </button>

      <BottomNav />
    </div>
  );
}
