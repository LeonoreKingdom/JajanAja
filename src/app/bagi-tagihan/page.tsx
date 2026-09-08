"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Plus,
  CheckCircle2,
  Clock,
  Share2,
  ChevronRight,
  Store,
  Calendar,
  DollarSign,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import { SplitBillGroup, SplitParticipant } from "@/types/split-bill";
import { formatRupiah } from "@/lib/utils";
import SplitBillDetailModal from "@/components/bagi-tagihan/SplitBillDetailModal";
import {
  fetchSplitBillsFromApi,
  getLocalSplitBills,
  updatePesertaStatusApi,
} from "@/lib/split-bill-storage";

export default function BagiTagihanPage() {
  const router = useRouter();

  const [splitBills, setSplitBills] = useState<SplitBillGroup[]>([]);
  const [activeFilter, setActiveFilter] = useState<"semua" | "aktif" | "selesai">("semua");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedBillForDetail, setSelectedBillForDetail] = useState<SplitBillGroup | null>(null);

  // Inisialisasi data dari API (libSQL Turso) dengan fallback local
  useEffect(() => {
    fetchSplitBillsFromApi().then((data) => setSplitBills(data));
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Toggle status pelunasan teman dan simpan ke database
  const handleTogglePayment = async (billId: string, participantId: string) => {
    const currentBill = splitBills.find((b) => b.id === billId);
    const targetPeserta = currentBill?.peserta.find((p) => p.id === participantId);
    if (!targetPeserta) return;

    const nextStatus = !targetPeserta.sudahBayar;

    // Optimistic update state
    setSplitBills((prev) =>
      prev.map((bill) => {
        if (bill.id !== billId) return bill;
        const updatedPeserta = bill.peserta.map((p) =>
          p.id === participantId ? { ...p, sudahBayar: nextStatus } : p
        );
        const allPaid = updatedPeserta.every((p) => p.sudahBayar);
        return {
          ...bill,
          peserta: updatedPeserta,
          status: (allPaid ? "selesai" : "aktif") as "aktif" | "selesai",
          updatedAt: new Date().toISOString(),
        };
      })
    );
    showToast("Status pembayaran peserta berhasil diperbarui!");

    try {
      const res = await updatePesertaStatusApi(billId, participantId, nextStatus);
      if (res) {
        setSplitBills((prev) => prev.map((b) => (b.id === billId ? res : b)));
      }
    } catch (e) {
      console.warn("Gagal simpan status peserta ke API:", e);
    }
  };

  // Salin teks rincian patungan untuk dibagikan ke WhatsApp
  const handleShareWhatsApp = (bill: SplitBillGroup) => {
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

    const shareText = textLines.join("\n");
    navigator.clipboard.writeText(shareText);
    setCopiedId(bill.id);
    showToast("✓ Rincian tagihan disalin! Siap dikirim via WhatsApp.");
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filter bills
  const filteredBills = splitBills.filter((bill) => {
    if (activeFilter === "aktif") return bill.status === "aktif";
    if (activeFilter === "selesai") return bill.status === "selesai";
    return true;
  });

  // Belum tertagih: bagian peserta (selain 'Kamu') yang belum bayar
  const belumTertagih = splitBills.reduce((acc, b) => {
    const unpaidOthers = b.peserta
      .filter((p) => !p.nama.toLowerCase().includes("kamu") && !p.sudahBayar)
      .reduce((sum, p) => sum + p.bagian, 0);
    return acc + unpaidOthers;
  }, 0);

  // Sudah lunas diterima
  const sudahLunasDiterima = splitBills.reduce((acc, b) => {
    const paidOthers = b.peserta
      .filter((p) => !p.nama.toLowerCase().includes("kamu") && p.sudahBayar)
      .reduce((sum, p) => sum + p.bagian, 0);
    return acc + paidOthers;
  }, 0);

  return (
    <div className="flex-1 flex flex-col p-4 pb-28 space-y-4 max-w-lg mx-auto w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg border border-slate-700 animate-in fade-in slide-in-from-top-2">
          {toastMessage}
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
            <h1 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Bagi Tagihan</span>
              <span className="text-blue-600 dark:text-blue-400">👥</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              Hitung split bill & tagih patungan teman
            </p>
          </div>
        </div>

        <Link
          href="/bagi-tagihan/baru"
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-md shadow-blue-200 dark:shadow-none active:scale-95 transition"
        >
          <Plus size={14} />
          <span>Bagi Baru</span>
        </Link>
      </div>

      {/* Ringkasan Status Tagihan */}
      <div className="grid grid-cols-2 gap-3">
        {/* Belum Tertagih */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 text-xs font-semibold">
            <span>Belum Tertagih</span>
            <Clock size={14} />
          </div>
          <p className="text-lg font-black text-amber-900 dark:text-amber-200">
            {formatRupiah(belumTertagih)}
          </p>
          <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80">
            Piutang dari teman yang belum bayar
          </p>
        </div>

        {/* Sudah Lunas Diterima */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <span>Sudah Lunas</span>
            <CheckCircle2 size={14} />
          </div>
          <p className="text-lg font-black text-emerald-900 dark:text-emerald-200">
            {formatRupiah(sudahLunasDiterima)}
          </p>
          <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80">
            Patungan teman yang sudah diterima
          </p>
        </div>
      </div>

      {/* Filter Tab */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1 text-xs font-bold text-slate-600 dark:text-slate-300">
        <button
          type="button"
          onClick={() => setActiveFilter("semua")}
          className={`flex-1 py-1.5 rounded-lg transition ${
            activeFilter === "semua"
              ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs"
              : "hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Semua ({splitBills.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("aktif")}
          className={`flex-1 py-1.5 rounded-lg transition ${
            activeFilter === "aktif"
              ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs"
              : "hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Belum Lunas ({splitBills.filter((b) => b.status === "aktif").length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("selesai")}
          className={`flex-1 py-1.5 rounded-lg transition ${
            activeFilter === "selesai"
              ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs"
              : "hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Selesai ({splitBills.filter((b) => b.status === "selesai").length})
        </button>
      </div>

      {/* Daftar Kartu Bagi Tagihan */}
      {filteredBills.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto text-2xl">
            👥
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">
              Belum Ada Tagihan di Kategori Ini
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Bagi tagihan makan atau belanja bareng teman dengan menekan tombol Bagi Baru di atas.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBills.map((bill) => {
            const totalPaidPeserta = bill.peserta.filter((p) => p.sudahBayar).length;
            const totalPeserta = bill.peserta.length;
            const percentPaid = Math.round((totalPaidPeserta / totalPeserta) * 100);

            return (
              <div
                key={bill.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 space-y-3 shadow-2xs hover:border-blue-200 dark:hover:border-blue-600/60 transition"
              >
                {/* Header Kartu */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          bill.status === "selesai"
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                            : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                        }`}
                      >
                        {bill.status === "selesai" ? "✓ Lunas Semua" : "⏳ Sedang Berjalan"}
                      </span>
                      {bill.namaToko && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Store size={11} />
                          <span>{bill.namaToko}</span>
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                      {bill.judul}
                    </h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar size={11} />
                      <span>{bill.tanggal}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400">Total Tagihan</span>
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {formatRupiah(bill.totalTagihan)}
                    </p>
                  </div>
                </div>

                {/* Progress Pelunasan */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      Status Pelunasan:{" "}
                      <strong className="text-slate-800 dark:text-slate-200">
                        {totalPaidPeserta}/{totalPeserta} Teman
                      </strong>
                    </span>
                    <span
                      className={`font-bold ${
                        percentPaid === 100 ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {percentPaid}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        percentPaid === 100 ? "bg-emerald-500" : "bg-blue-600"
                      }`}
                      style={{ width: `${percentPaid}%` }}
                    />
                  </div>
                </div>

                {/* Daftar Peserta */}
                <div className="bg-slate-50 dark:bg-slate-800/70 rounded-xl p-2.5 divide-y divide-slate-100 dark:divide-slate-700 space-y-1 text-xs">
                  {bill.peserta.map((p) => {
                    const isUser = p.nama.toLowerCase().includes("kamu");

                    return (
                      <div
                        key={p.id}
                        className="pt-1.5 first:pt-0 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] font-black text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                            {p.nama.charAt(0)}
                          </div>
                          <div className="truncate">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                              {p.nama}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 dark:text-white">
                            {formatRupiah(p.bagian)}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleTogglePayment(bill.id, p.id)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 active:scale-95 cursor-pointer ${
                              p.sudahBayar
                                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60"
                                : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/60"
                            }`}
                            title="Klik untuk ubah status lunas"
                          >
                            {p.sudahBayar ? (
                              <>
                                <Check size={11} />
                                <span>Lunas</span>
                              </>
                            ) : (
                              <>
                                <Clock size={11} />
                                <span>Belum</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Action Bar per Kartu */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedBillForDetail(bill)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer py-1"
                  >
                    <span>Detail & Pelunasan</span>
                    <ChevronRight size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShareWhatsApp(bill)}
                    className="flex items-center gap-1.5 py-1 px-2.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold rounded-lg transition active:scale-95 cursor-pointer"
                  >
                    {copiedId === bill.id ? (
                      <>
                        <Check size={12} />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={12} />
                        <span>Bagikan Tagihan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detail & Ringkasan Pelunasan */}
      {selectedBillForDetail && (
        <SplitBillDetailModal
          bill={selectedBillForDetail}
          isOpen={Boolean(selectedBillForDetail)}
          onClose={() => setSelectedBillForDetail(null)}
          onUpdateBill={(updated) => {
            const newBills = splitBills.map((b) => (b.id === updated.id ? updated : b));
            setSplitBills(newBills);
            setSelectedBillForDetail(updated);
          }}
        />
      )}

      <BottomNav />
    </div>
  );
}
