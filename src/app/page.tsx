"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/dashboard/Header";
import SummaryCards from "@/components/dashboard/SummaryCards";
import QuickActions from "@/components/dashboard/QuickActions";
import LevinaInsightCard from "@/components/dashboard/LevinaInsightCard";
import BudgetOverview from "@/components/dashboard/BudgetOverview";
import AssetSummary from "@/components/dashboard/AssetSummary";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import FinancialConditionSummary from "@/components/dashboard/FinancialConditionSummary";
import MonthlyFinancialChart from "@/components/dashboard/MonthlyFinancialChart";
import BottomNav from "@/components/layout/BottomNav";
import TransactionModal from "@/components/dashboard/TransactionModal";
import LevinaChatModal from "@/components/dashboard/LevinaChatModal";
import { LevinaInsight, TransactionType, User } from "@/types/finance";
import { useTransaction } from "@/context/TransactionContext";
import { useAuth } from "@/context/AuthContext";
import { formatRupiah } from "@/lib/utils";

const defaultUser: User = {
  id: "user-1",
  nama: "Rian Aditya",
  email: "rian.aditya@example.com",
  nomorWhatsApp: "081234567890",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const activeUser = user || defaultUser;

  const {
    transactions,
    assets,
    budgets,
    categories,
    totalSaldo,
    totalPemasukanBulanIni,
    totalPengeluaranBulanIni,
    sisaBudgetBulanIni,
    totalBudgetBulanIni,
    addTransaction,
  } = useTransaction();

  const router = useRouter();

  // Dynamic LEVINA insight reflecting receipt scan and real financial conditions
  const latestReceiptTx = transactions.find((t) => t.sumber === "pindai-struk");
  let currentInsight: LevinaInsight;

  if (latestReceiptTx) {
    currentInsight = {
      sapaan: "Struk Berhasil Terdata!",
      pesan: `Transaksi dari ${latestReceiptTx.catatan || "struk"} sebesar ${formatRupiah(latestReceiptTx.jumlah)} sudah masuk ke database Turso dan memotong saldo pos budgetmu.`,
      tips: "Foto struk yang jelas membuat pencatatan pengeluaran harianmu selalu akurat 100%.",
      mood: "senang",
    };
  } else if (totalBudgetBulanIni > 0 && totalPengeluaranBulanIni > totalBudgetBulanIni) {
    currentInsight = {
      sapaan: "Perhatian Pengeluaran! ⚠️",
      pesan: `Total pengeluaranmu (${formatRupiah(totalPengeluaranBulanIni)}) telah melebihi alokasi budget bulanan (${formatRupiah(totalBudgetBulanIni)}).`,
      tips: "Coba tinjau pos pengeluaran sekunder dan batasi pengeluaran non-primer beberapa hari ke depan.",
      mood: "waspada",
    };
  } else {
    currentInsight = {
      sapaan: "Halo, Semangat Finansial! ✨",
      pesan: `Saldo aktifmu saat ini ${formatRupiah(totalSaldo)} dengan sisa budget bulan ini ${formatRupiah(sisaBudgetBulanIni)}.`,
      tips: "Trik hemat: Catat setiap jajan harianmu agar riwayat finansial selalu sinkron dengan database.",
      mood: "senang",
    };
  }

  // Modal states
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] =
    useState<TransactionType>("pengeluaran");
  const [isLevinaModalOpen, setIsLevinaModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenExpenseModal = () => {
    setTransactionType("pengeluaran");
    setIsTransactionModalOpen(true);
  };

  const handleOpenIncomeModal = () => {
    setTransactionType("pemasukan");
    setIsTransactionModalOpen(true);
  };

  const handleScanReceipt = () => {
    router.push("/pindai-struk");
  };

  const handleSplitBill = () => {
    router.push("/bagi-tagihan");
  };

  const handleWhatsApp = () => {
    router.push("/whatsapp");
  };

  const handleSaveTransaction = async (newTx: {
    tipe: TransactionType;
    jumlah: number;
    categoryId: string;
    assetId: string;
    catatan: string;
  }) => {
    const res = await addTransaction({
      tipe: newTx.tipe,
      jumlah: newTx.jumlah,
      categoryId: newTx.categoryId,
      assetId: newTx.assetId,
      catatan: newTx.catatan,
      sumber: "manual",
    });

    if (res.success) {
      showToast(
        `✓ Berhasil mencatat ${
          newTx.tipe === "pengeluaran" ? "JajanAja" : "NabungAja"
        } sebesar ${formatRupiah(newTx.jumlah)} ke database!`
      );
    } else {
      showToast(`Gagal mencatat transaksi: ${res.error || "Terjadi kesalahan"}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-0 space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg border border-slate-700 animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Header Profile - Mobile Only */}
      <div className="lg:hidden">
        <Header user={user || undefined} />
      </div>

      {/* Ringkasan Saldo, Pengeluaran & Pemasukan (4-col on desktop, stacked on mobile) */}
      <SummaryCards
        totalSaldo={totalSaldo}
        totalPemasukan={totalPemasukanBulanIni}
        totalPengeluaran={totalPengeluaranBulanIni}
        sisaBudget={sisaBudgetBulanIni}
        totalBudget={totalBudgetBulanIni}
      />

      {/* ===== DESKTOP MULTI-COLUMN LAYOUT (>= xl) ===== */}
      <div className="hidden xl:grid xl:grid-cols-12 gap-6 items-start">
        {/* Main 8-Columns (Aksi Cepat, Grafik Keuangan, Transaksi Terbaru) */}
        <div className="xl:col-span-8 space-y-6">
          <QuickActions
            onAddExpense={handleOpenExpenseModal}
            onAddIncome={handleOpenIncomeModal}
            onScanReceipt={handleScanReceipt}
            onSplitBill={handleSplitBill}
            onWhatsApp={handleWhatsApp}
          />
          <MonthlyFinancialChart />
          <RecentTransactions
            transactions={transactions}
            onAddTransaction={handleOpenExpenseModal}
            onViewAll={() => router.push("/transaksi")}
          />
        </div>

        {/* Side 4-Columns (LEVINA Insight, Evaluasi Finansial, Budgetin, Asetku) */}
        <div className="xl:col-span-4 space-y-6">
          <LevinaInsightCard
            insight={currentInsight}
            onOpenChat={() => setIsLevinaModalOpen(true)}
          />
          <FinancialConditionSummary
            totalPemasukan={totalPemasukanBulanIni}
            totalPengeluaran={totalPengeluaranBulanIni}
            sisaBudget={sisaBudgetBulanIni}
            totalBudget={totalBudgetBulanIni}
          />
          <BudgetOverview
            budgets={budgets}
            onManageBudget={() => router.push("/budgetin")}
          />
          <AssetSummary
            assets={assets}
            onManageAssets={() => router.push("/asetku")}
          />
        </div>
      </div>

      {/* ===== MOBILE / TABLET STACK (< xl) ===== */}
      <div className="xl:hidden space-y-4">
        <QuickActions
          onAddExpense={handleOpenExpenseModal}
          onAddIncome={handleOpenIncomeModal}
          onScanReceipt={handleScanReceipt}
          onSplitBill={handleSplitBill}
          onWhatsApp={handleWhatsApp}
        />
        <FinancialConditionSummary
          totalPemasukan={totalPemasukanBulanIni}
          totalPengeluaran={totalPengeluaranBulanIni}
          sisaBudget={sisaBudgetBulanIni}
          totalBudget={totalBudgetBulanIni}
        />
        <MonthlyFinancialChart />
        <LevinaInsightCard
          insight={currentInsight}
          onOpenChat={() => setIsLevinaModalOpen(true)}
        />
        <BudgetOverview
          budgets={budgets}
          onManageBudget={() => router.push("/budgetin")}
        />
        <AssetSummary
          assets={assets}
          onManageAssets={() => router.push("/asetku")}
        />
        <RecentTransactions
          transactions={transactions}
          onAddTransaction={handleOpenExpenseModal}
          onViewAll={() => router.push("/transaksi")}
        />
      </div>

      {/* Bottom Navigation (Hidden on lg+) */}
      <BottomNav />

      {/* Modal Input Transaksi (JajanAja / NabungAja) */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        type={transactionType}
        categories={categories}
        assets={assets}
        onSave={handleSaveTransaction}
      />

      {/* Modal Chat LEVINA */}
      <LevinaChatModal
        isOpen={isLevinaModalOpen}
        onClose={() => setIsLevinaModalOpen(false)}
      />
    </div>
  );
}
