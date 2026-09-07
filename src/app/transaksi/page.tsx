"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  MinusCircle,
  PlusCircle,
} from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import RunningMonthSummary from "@/components/transaction/RunningMonthSummary";
import TransactionHistoryList from "@/components/transaction/TransactionHistoryList";
import ExpenseForm from "@/components/transaction/ExpenseForm";
import IncomeForm from "@/components/transaction/IncomeForm";

export default function CatatTransaksiPage() {
  const router = useRouter();

  // Alur 1 (JajanAja/Pengeluaran) vs Alur 2 (NabungAja/Pemasukan)
  const [flow, setFlow] = useState<"pengeluaran" | "pemasukan">("pengeluaran");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [liveAmount, setLiveAmount] = useState(0);
  const [liveCategoryId, setLiveCategoryId] = useState("cat-1");

  const isExpense = flow === "pengeluaran";

  const handleFlowChange = (newFlow: "pengeluaran" | "pemasukan") => {
    setFlow(newFlow);
    setLiveAmount(0);
    setLiveCategoryId(newFlow === "pengeluaran" ? "cat-1" : "cat-7");
  };

  const handleSuccess = () => {
    setLiveAmount(0);
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4">
      {/* Header Navigasi */}
      <header className="flex items-center justify-between py-2">
        <Link
          href="/"
          className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition shadow-2xs"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-base font-bold text-slate-900">
          {isExpense ? "Catat JajanAja" : "Catat NabungAja"}
        </h1>
        <Link
          href="/pindai-struk"
          className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition shadow-2xs"
          title="Pindai Struk AI"
        >
          <Camera size={18} />
        </Link>
      </header>

      {/* Switcher Dua Alur (JajanAja vs NabungAja) */}
      <div className="bg-slate-200/80 p-1.5 rounded-2xl flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => handleFlowChange("pengeluaran")}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            isExpense
              ? "bg-rose-600 text-white shadow-md shadow-rose-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <MinusCircle size={16} />
          <span>JajanAja (Pengeluaran)</span>
        </button>

        <button
          type="button"
          onClick={() => handleFlowChange("pemasukan")}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            !isExpense
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <PlusCircle size={16} />
          <span>NabungAja (Pemasukan)</span>
        </button>
      </div>

      {/* Ringkasan Bulan Berjalan & Dampak Budget */}
      <RunningMonthSummary
        selectedCategoryId={liveCategoryId}
        inputAmount={liveAmount}
        flow={flow}
      />

      {/* Form Sesuai Alur yang Dipilih */}
      {isExpense ? (
        <ExpenseForm
          onSuccess={handleSuccess}
          onFormChange={({ amount, categoryId }) => {
            setLiveAmount(amount);
            setLiveCategoryId(categoryId);
          }}
        />
      ) : (
        <IncomeForm
          onSuccess={handleSuccess}
          onFormChange={({ amount, categoryId }) => {
            setLiveAmount(amount);
            setLiveCategoryId(categoryId);
          }}
        />
      )}

      {/* Riwayat Transaksi Bulan Ini */}
      <TransactionHistoryList />

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center text-3xl shadow-sm">
              🦊
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {isExpense
                  ? "JajanAja Berhasil Dicatat!"
                  : "NabungAja Berhasil Ditambah!"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Kemenangan finansial tercatat! Data telah diperbarui dan
                tersinkronisasi ke Dashboard.
              </p>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-xs text-purple-950 font-medium">
              ✨ <strong>Pesan LEVINA:</strong> &quot;Catatan yang konsisten adalah
              kunci keuangan sehat. Dompetmu semakin aman dan terkendali!&quot;
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSuccessModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
              >
                Ke Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <BottomNav activeTab="transaksi" />
    </div>
  );
}
