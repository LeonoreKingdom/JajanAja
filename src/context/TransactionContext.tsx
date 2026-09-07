"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Asset,
  AssetType,
  Budget,
  Category,
  DashboardSummary,
  Transaction,
  TransactionType,
} from "@/types/finance";
import {
  mockAssets,
  mockBudgets,
  mockCategories,
  mockDashboardData,
  mockTransactions,
  mockUser,
} from "@/lib/mock-data";

export interface TransactionWithDetails extends Transaction {
  kategori: Category;
  aset?: Asset;
}

export interface CategoryBudgetStatus {
  kategori: Category;
  batasJumlah: number;
  terpakai: number;
  sisa: number;
  persentase: number;
}

interface TransactionContextType {
  transactions: TransactionWithDetails[];
  assets: Asset[];
  budgets: (Budget & { kategori: Category })[];
  totalSaldo: number;
  totalPemasukanBulanIni: number;
  totalPengeluaranBulanIni: number;
  sisaBudgetBulanIni: number;
  totalBudgetBulanIni: number;
  addTransaction: (tx: {
    tipe: TransactionType;
    jumlah: number;
    categoryId: string;
    category?: Category;
    assetId: string;
    catatan?: string;
    label?: string;
    tanggal?: string;
    sumber?: "manual" | "pindai-struk" | "whatsapp";
  }) => void;
  deleteTransaction: (id: string) => void;
  getCategoryBudgetStatus: (categoryId: string) => CategoryBudgetStatus | null;
  addAsset: (asset: {
    nama: string;
    jenis: AssetType;
    saldo: number;
    nomorRekening?: string;
    warna?: string;
    ikon?: string;
  }) => Asset;
  updateAssetBalance: (
    assetId: string,
    newBalance: number,
    recordAdjustment?: boolean
  ) => void;
}

const TransactionContext = createContext<TransactionContextType | null>(null);

const STORAGE_KEY = "jajanaja_transactions_data_v1";

export function TransactionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [transactions, setTransactions] =
    useState<TransactionWithDetails[]>(mockTransactions);
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [budgets, setBudgets] = useState<(Budget & { kategori: Category })[]>(
    mockBudgets
  );

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.assets) setAssets(parsed.assets);
        if (parsed.budgets) setBudgets(parsed.budgets);
      }
    } catch (e) {
      console.warn("Gagal memuat state dari localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ transactions, assets, budgets })
      );
    } catch (e) {
      console.warn("Gagal menyimpan state ke localStorage:", e);
    }
  }, [transactions, assets, budgets, isLoaded]);

  // Kalkulasi ringkasan bulan berjalan
  const totalSaldo = useMemo(
    () => assets.reduce((sum, a) => sum + a.saldo, 0),
    [assets]
  );

  const { totalPemasukanBulanIni, totalPengeluaranBulanIni } = useMemo(() => {
    let income = 10000000; // Base gaji awal bulan
    let expense = 0;

    transactions.forEach((tx) => {
      if (tx.tipe === "pemasukan") {
        income += tx.jumlah;
      } else {
        expense += tx.jumlah;
      }
    });

    return {
      totalPemasukanBulanIni: income,
      totalPengeluaranBulanIni: expense,
    };
  }, [transactions]);

  const totalBudgetBulanIni = useMemo(
    () => budgets.reduce((sum, b) => sum + b.batasJumlah, 0),
    [budgets]
  );

  const sisaBudgetBulanIni = Math.max(
    0,
    totalBudgetBulanIni - totalPengeluaranBulanIni
  );

  // Tambah transaksi baru
  const addTransaction = (newTx: {
    tipe: TransactionType;
    jumlah: number;
    categoryId: string;
    category?: Category;
    assetId: string;
    catatan?: string;
    label?: string;
    tanggal?: string;
    sumber?: "manual" | "pindai-struk" | "whatsapp";
  }) => {
    const cat =
      newTx.category ||
      mockCategories.find((c) => c.id === newTx.categoryId) || {
        id: newTx.categoryId,
        nama: newTx.catatan || "Kategori",
        tipe: newTx.tipe,
        ikon: newTx.tipe === "pengeluaran" ? "ShoppingBag" : "Coins",
        warna: newTx.tipe === "pengeluaran" ? "#f43f5e" : "#10b981",
      };
    const ast = assets.find((a) => a.id === newTx.assetId) || assets[0];

    const newTransaction: TransactionWithDetails = {
      id: `tx-${Date.now()}`,
      tipe: newTx.tipe,
      jumlah: newTx.jumlah,
      tanggal: newTx.tanggal || new Date().toISOString(),
      catatan: newTx.catatan || cat.nama,
      label: newTx.label,
      sumber: newTx.sumber || "manual",
      assetId: newTx.assetId,
      categoryId: newTx.categoryId,
      kategori: cat,
      aset: ast,
    };

    // Update Saldo Aset
    setAssets((prev) =>
      prev.map((item) => {
        if (item.id === newTx.assetId) {
          return {
            ...item,
            saldo:
              newTx.tipe === "pengeluaran"
                ? item.saldo - newTx.jumlah
                : item.saldo + newTx.jumlah,
            updatedAt: new Date().toISOString(),
          };
        }
        return item;
      })
    );

    // Update Terpakai Budget
    if (newTx.tipe === "pengeluaran") {
      setBudgets((prev) =>
        prev.map((b) => {
          if (b.categoryId === newTx.categoryId) {
            return {
              ...b,
              terpakai: b.terpakai + newTx.jumlah,
            };
          }
          return b;
        })
      );
    }

    // Insert ke daftar transaksi (paling atas)
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;

    // Rollback saldo
    if (target.assetId) {
      setAssets((prev) =>
        prev.map((a) => {
          if (a.id === target.assetId) {
            return {
              ...a,
              saldo:
                target.tipe === "pengeluaran"
                  ? a.saldo + target.jumlah
                  : a.saldo - target.jumlah,
            };
          }
          return a;
        })
      );
    }

    // Rollback budget
    if (target.tipe === "pengeluaran") {
      setBudgets((prev) =>
        prev.map((b) => {
          if (b.categoryId === target.categoryId) {
            return {
              ...b,
              terpakai: Math.max(0, b.terpakai - target.jumlah),
            };
          }
          return b;
        })
      );
    }

    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const getCategoryBudgetStatus = (categoryId: string): CategoryBudgetStatus | null => {
    const budget = budgets.find((b) => b.categoryId === categoryId);
    if (!budget) return null;

    const sisa = Math.max(0, budget.batasJumlah - budget.terpakai);
    const persentase = Math.min(
      100,
      Math.round((budget.terpakai / budget.batasJumlah) * 100)
    );

    return {
      kategori: budget.kategori,
      batasJumlah: budget.batasJumlah,
      terpakai: budget.terpakai,
      sisa,
      persentase,
    };
  };

  const addAsset = (data: {
    nama: string;
    jenis: AssetType;
    saldo: number;
    nomorRekening?: string;
    warna?: string;
    ikon?: string;
  }): Asset => {
    const newAsset: Asset = {
      id: `ast-${Date.now()}`,
      nama: data.nama,
      jenis: data.jenis,
      saldo: data.saldo,
      nomorRekening: data.nomorRekening,
      warna: data.warna || "bg-indigo-600 text-white",
      ikon: data.ikon,
      updatedAt: new Date().toISOString(),
    };
    setAssets((prev) => [...prev, newAsset]);
    return newAsset;
  };

  const updateAssetBalance = (
    assetId: string,
    newBalance: number,
    recordAdjustment?: boolean
  ) => {
    const targetAsset = assets.find((a) => a.id === assetId);
    if (!targetAsset) return;

    const diff = newBalance - targetAsset.saldo;

    setAssets((prev) =>
      prev.map((a) =>
        a.id === assetId
          ? { ...a, saldo: newBalance, updatedAt: new Date().toISOString() }
          : a
      )
    );

    if (recordAdjustment && diff !== 0) {
      const isIncrease = diff > 0;
      const cat =
        mockCategories.find((c) =>
          isIncrease ? c.tipe === "pemasukan" : c.tipe === "pengeluaran"
        ) || mockCategories[0];

      const adjTransaction: TransactionWithDetails = {
        id: `tx-adj-${Date.now()}`,
        tipe: isIncrease ? "pemasukan" : "pengeluaran",
        jumlah: Math.abs(diff),
        tanggal: new Date().toISOString(),
        catatan: `Penyesuaian saldo (${targetAsset.nama})`,
        label: "Penyesuaian",
        sumber: "manual",
        assetId: targetAsset.id,
        categoryId: cat.id,
        kategori: cat,
        aset: { ...targetAsset, saldo: newBalance },
      };

      setTransactions((prev) => [adjTransaction, ...prev]);
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        assets,
        budgets,
        totalSaldo,
        totalPemasukanBulanIni,
        totalPengeluaranBulanIni,
        sisaBudgetBulanIni,
        totalBudgetBulanIni,
        addTransaction,
        deleteTransaction,
        getCategoryBudgetStatus,
        addAsset,
        updateAssetBalance,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransaction() {
  const ctx = useContext(TransactionContext);
  if (!ctx) {
    throw new Error("useTransaction must be used within TransactionProvider");
  }
  return ctx;
}
