"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Filter,
  Plus,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import BudgetOverviewCard from "@/components/budget/BudgetOverviewCard";
import BudgetAlertSummary from "@/components/budget/BudgetAlertSummary";
import BudgetCategoryCard from "@/components/budget/BudgetCategoryCard";
import EditBudgetModal from "@/components/budget/EditBudgetModal";
import CreateBudgetModal from "@/components/budget/CreateBudgetModal";
import { useTransaction } from "@/context/TransactionContext";
import { Budget, Category } from "@/types/finance";

export default function BudgetinPage() {
  const {
    budgets,
    createBudget,
    updateBudget,
    deleteBudget,
    refreshData,
  } = useTransaction();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<(Budget & { kategori: Category }) | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"semua" | "aman" | "waspada" | "overbudget">(
    "semua"
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.batasJumlah, 0);
  const totalTerpakai = budgets.reduce((sum, b) => sum + b.terpakai, 0);
  const sisaBudget = Math.max(0, totalBudget - totalTerpakai);
  const persentaseTerpakai =
    totalBudget > 0 ? Math.round((totalTerpakai / totalBudget) * 100) : 0;

  const handleEditBudget = (budget: Budget & { kategori: Category }) => {
    setEditingBudget(budget);
  };

  const handleSaveBudget = async (budgetId: string, newLimit: number) => {
    const success = await updateBudget(budgetId, { batasJumlah: newLimit });
    if (success) {
      showToast("✓ Pagu anggaran berhasil diperbarui ke database!");
    } else {
      showToast("Gagal memperbarui pagu anggaran.");
    }
    setEditingBudget(null);
  };

  const handleCreateBudget = async (newBudget: Budget & { kategori: Category }) => {
    const created = await createBudget({
      categoryId: newBudget.categoryId,
      periodeBulan: newBudget.periodeBulan,
      batasJumlah: newBudget.batasJumlah,
      warna: newBudget.warna,
    });
    if (created) {
      showToast("✓ Pos anggaran baru berhasil disimpan ke database Turso!");
    } else {
      showToast("Gagal menyimpan pos anggaran baru.");
    }
    setIsCreateModalOpen(false);
  };

  // Filter & Search
  const filteredBudgets = budgets.filter((b) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = b.kategori?.nama?.toLowerCase().includes(q);
      if (!matchName) return false;
    }

    // Status filter
    const persentase =
      b.batasJumlah > 0 ? Math.round((b.terpakai / b.batasJumlah) * 100) : 0;
    const isOver = b.terpakai > b.batasJumlah;
    const isWarning = persentase >= 80 && !isOver;

    if (filterStatus === "overbudget" && !isOver) return false;
    if (filterStatus === "waspada" && !isWarning) return false;
    if (filterStatus === "aman" && (isOver || isWarning)) return false;

    return true;
  });

  return (
    <div className="flex-1 flex flex-col p-4 pb-24 space-y-4 max-w-lg mx-auto w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg border border-slate-700 animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between py-2">
        <Link
          href="/"
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-2xs"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="text-center">
          <h1 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5 justify-center">
            <Target size={18} className="text-indigo-600 dark:text-indigo-400" />
            <span>Budgetin</span>
          </h1>
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
            Alokasi & Pagu Pos Keuangan
          </p>
        </div>
        <div className="w-10 flex justify-end">
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800 flex items-center justify-center hover:bg-indigo-100 dark:hover:bg-indigo-900 transition shadow-2xs cursor-pointer"
            onClick={() => setIsCreateModalOpen(true)}
            title="Tambah Pos Budget Baru"
          >
            <Plus size={18} />
          </button>
        </div>
      </header>

      {/* Ringkasan Pagu Utama */}
      <BudgetOverviewCard
        totalBudget={totalBudget}
        totalTerpakai={totalTerpakai}
        sisaBudget={sisaBudget}
        persentaseTerpakai={persentaseTerpakai}
        periode="September 2026"
      />

      {/* Indikator Peringatan & Status Pagu Budget */}
      <BudgetAlertSummary budgets={budgets} />

      {/* Filter & Search Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <input
            type="text"
            placeholder="Cari pos pengeluaran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          />
        </div>

        {/* Filter Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {(
            [
              { id: "semua", label: "Semua Pos" },
              { id: "aman", label: "Aman (<80%)" },
              { id: "waspada", label: "Hati-hati (≥80%)" },
              { id: "overbudget", label: "Overbudget" },
            ] as const
          ).map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setFilterStatus(pill.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition text-xs cursor-pointer ${
                filterStatus === pill.id
                  ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Daftar Pos Budget */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Daftar Pos Pengeluaran ({filteredBudgets.length})
          </h2>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Klik ikon pensil untuk ubah</span>
        </div>

        {filteredBudgets.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-slate-100 dark:border-slate-700/80 space-y-2">
            <span className="text-3xl">🎯</span>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Tidak ada pos budget yang cocok.
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Coba ganti filter atau kata kunci pencarian.
            </p>
          </div>
        ) : (
          filteredBudgets.map((b) => (
            <BudgetCategoryCard
              key={b.id}
              budget={b}
              onEdit={handleEditBudget}
            />
          ))
        )}
      </div>

      {/* LEVINA Budget Companion Card */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 dark:from-purple-950/40 dark:via-indigo-950/40 dark:to-pink-950/40 rounded-2xl p-4 border border-purple-100 dark:border-purple-900/50 flex items-start gap-3 shadow-xs">
        <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl shrink-0 shadow-2xs border border-purple-200 dark:border-purple-800">
          🦊
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs font-bold text-purple-900 dark:text-purple-300">
            <Sparkles size={13} className="text-amber-500" />
            <span>Saran LEVINA untuk Budgetin</span>
          </div>
          <p className="text-xs text-purple-950 dark:text-purple-200/90 leading-relaxed">
            Pagu pos pengeluaranmu terhubung langsung ke database Turso. Setiap transaksi yang kamu catat
            akan otomatis memotong pagu pos terkait secara real-time!
          </p>
        </div>
      </div>

      {/* Modal Edit Pagu */}
      <EditBudgetModal
        isOpen={Boolean(editingBudget)}
        onClose={() => setEditingBudget(null)}
        budget={editingBudget}
        onSave={handleSaveBudget}
      />

      {/* Modal Tambah Pos Budget Baru */}
      <CreateBudgetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        existingBudgets={budgets}
        onSave={handleCreateBudget}
      />

      {/* Bottom Navigation */}
      <BottomNav activeTab="budgetin" />
    </div>
  );
}
