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
import {
  mockCategories,
  mockDashboardData,
  mockUser,
} from "@/lib/mock-data";
import { LevinaInsight, TransactionType } from "@/types/finance";
import { useTransaction } from "@/context/TransactionContext";
import { formatRupiah } from "@/lib/utils";

export default function DashboardPage() {
  const {
    transactions,
    assets,
    budgets,
    totalSaldo,
    totalPemasukanBulanIni,
    totalPengeluaranBulanIni,
    sisaBudgetBulanIni,
    totalBudgetBulanIni,
    addTransaction,
  } = useTransaction();

  const router = useRouter();

  // Dynamic LEVINA insight reflecting receipt scan and financial conditions
  const latestReceiptTx = transactions.find((t) => t.sumber === "pindai-struk");
  const currentInsight: LevinaInsight = latestReceiptTx
    ? {
        sapaan: "Struk Berhasil Terdata!",
        pesan: `Transaksi dari ${latestReceiptTx.catatan || "struk"} sebesar ${formatRupiah(latestReceiptTx.jumlah)} sudah masuk ke dashboard dan memotong saldo pos budgetmu.`,
        tips: "Foto struk yang jelas membuat pencatatan pengeluaran harianmu selalu akurat 100%.",
        mood: "senang",
      }
    : mockDashboardData.insightLevina;

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

  const handleSaveTransaction = (newTx: {
    tipe: TransactionType;
    jumlah: number;
    categoryId: string;
    assetId: string;
    catatan: string;
  }) => {
    addTransaction({
      tipe: newTx.tipe,
      jumlah: newTx.jumlah,
      categoryId: newTx.categoryId,
      assetId: newTx.assetId,
      catatan: newTx.catatan,
      sumber: "manual",
    });

    showToast(
      `✓ Berhasil mencatat ${
        newTx.tipe === "pengeluaran" ? "JajanAja" : "NabungAja"
      }!`
    );
  };

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg border border-slate-700 animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Header Profile */}
      <Header user={mockUser} />

      {/* Ringkasan Saldo, Pengeluaran & Pemasukan */}
      <SummaryCards
        totalSaldo={totalSaldo}
        totalPemasukan={totalPemasukanBulanIni}
        totalPengeluaran={totalPengeluaranBulanIni}
        sisaBudget={sisaBudgetBulanIni}
        totalBudget={totalBudgetBulanIni}
      />

      {/* Aksi Cepat (JajanAja, NabungAja, Scan Struk, Split Bill) */}
      <QuickActions
        onAddExpense={handleOpenExpenseModal}
        onAddIncome={handleOpenIncomeModal}
        onScanReceipt={handleScanReceipt}
        onSplitBill={handleSplitBill}
      />

      {/* Ringkasan Kondisi Uang & Evaluasi Finansial */}
      <FinancialConditionSummary
        totalPemasukan={totalPemasukanBulanIni}
        totalPengeluaran={totalPengeluaranBulanIni}
        sisaBudget={sisaBudgetBulanIni}
        totalBudget={totalBudgetBulanIni}
      />

      {/* Grafik Data Bulanan Pemasukan & Pengeluaran */}
      <MonthlyFinancialChart />

      {/* Widget Interaktif LEVINA */}
      <LevinaInsightCard
        insight={currentInsight}
        onOpenChat={() => setIsLevinaModalOpen(true)}
      />

      {/* Alokasi Budgetin */}
      <BudgetOverview
        budgets={budgets}
        onManageBudget={() => router.push("/budgetin")}
      />

      {/* Ringkasan Asetku */}
      <AssetSummary
        assets={assets}
        onManageAssets={() => router.push("/asetku")}
      />

      {/* Transaksi Terbaru */}
      <RecentTransactions
        transactions={transactions}
        onAddTransaction={handleOpenExpenseModal}
        onViewAll={() => router.push("/transaksi")}
      />

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Modal Input Transaksi (JajanAja / NabungAja) */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        type={transactionType}
        categories={mockCategories}
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
