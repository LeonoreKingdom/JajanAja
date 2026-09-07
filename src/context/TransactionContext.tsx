"use client";

import React, {
  createContext,
  useCallback,
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
  Transaction,
  TransactionType,
} from "@/types/finance";

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
  categories: Category[];
  isLoading: boolean;
  totalSaldo: number;
  totalPemasukanBulanIni: number;
  totalPengeluaranBulanIni: number;
  sisaBudgetBulanIni: number;
  totalBudgetBulanIni: number;
  refreshData: () => Promise<void>;
  addTransaction: (tx: {
    tipe: TransactionType;
    jumlah: number;
    categoryId: string;
    category?: Category;
    assetId: string;
    catatan?: string;
    merchant?: string;
    label?: string;
    tanggal?: string;
    sumber?: "manual" | "pindai-struk" | "whatsapp";
    reimbursable?: boolean;
    photoUrl?: string;
  }) => Promise<{ success: boolean; message?: string; error?: string }>;
  deleteTransaction: (id: string) => Promise<boolean>;
  getCategoryBudgetStatus: (categoryId: string) => CategoryBudgetStatus | null;
  addAsset: (asset: {
    nama: string;
    jenis: AssetType;
    saldo: number;
    nomorRekening?: string;
    warna?: string;
    ikon?: string;
  }) => Promise<Asset | null>;
  updateAssetBalance: (
    assetId: string,
    newBalance: number,
    recordAdjustment?: boolean
  ) => Promise<boolean>;
  createBudget: (data: {
    categoryId: string;
    periodeBulan: string;
    batasJumlah: number;
    warna?: string;
  }) => Promise<(Budget & { kategori: Category }) | null>;
  updateBudget: (
    id: string,
    data: { batasJumlah?: number; warna?: string }
  ) => Promise<boolean>;
  deleteBudget: (id: string) => Promise<boolean>;
}

const TransactionContext = createContext<TransactionContextType | null>(null);

export function TransactionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [budgets, setBudgets] = useState<(Budget & { kategori: Category })[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch real data directly from Turso-backed API endpoints
  const fetchData = useCallback(async () => {
    try {
      const [txRes, assetRes, budgetRes, catRes] = await Promise.all([
        fetch("/api/transaksi?limit=100").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/aset").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/budget").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/kategori").then((r) => (r.ok ? r.json() : null)),
      ]);

      if (txRes?.data?.transaksi) {
        setTransactions(txRes.data.transaksi);
      }
      if (assetRes?.data && Array.isArray(assetRes.data)) {
        setAssets(assetRes.data);
      }
      if (budgetRes?.data && Array.isArray(budgetRes.data)) {
        setBudgets(budgetRes.data);
      }
      if (catRes?.data && Array.isArray(catRes.data)) {
        setCategories(catRes.data);
      }
    } catch (err) {
      console.error("Gagal memuat data dari database:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Kalkulasi total saldo dari seluruh akun aset
  const totalSaldo = useMemo(
    () => assets.reduce((sum, a) => sum + a.saldo, 0),
    [assets]
  );

  // Kalkulasi pemasukan & pengeluaran bulan ini dari transaksi nyata
  const { totalPemasukanBulanIni, totalPengeluaranBulanIni } = useMemo(() => {
    let income = 0;
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

  // Tambah transaksi baru langsung ke database (POST /api/transaksi)
  const addTransaction = async (newTx: {
    tipe: TransactionType;
    jumlah: number;
    categoryId: string;
    category?: Category;
    assetId: string;
    catatan?: string;
    merchant?: string;
    label?: string;
    tanggal?: string;
    sumber?: "manual" | "pindai-struk" | "whatsapp";
    reimbursable?: boolean;
    photoUrl?: string;
  }): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const res = await fetch("/api/transaksi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipe: newTx.tipe,
          jumlah: newTx.jumlah,
          categoryId: newTx.categoryId,
          assetId: newTx.assetId,
          catatan: newTx.catatan,
          merchant: newTx.merchant,
          label: newTx.label ? [newTx.label] : undefined,
          tanggal: newTx.tanggal,
          sumber: newTx.sumber || "manual",
          reimbursable: newTx.reimbursable || false,
          photoUrl: newTx.photoUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.message || "Gagal menyimpan transaksi ke database.",
        };
      }

      // Refresh seluruh data dari Turso agar selalu konsisten
      await fetchData();

      return {
        success: true,
        message: data.message || "Transaksi berhasil disimpan ke database.",
      };
    } catch (err) {
      console.error("Error addTransaction:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Terjadi kesalahan jaringan.",
      };
    }
  };

  // Hapus transaksi dari database (DELETE /api/transaksi/[id])
  const deleteTransaction = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/transaksi/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchData();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error deleteTransaction:", err);
      return false;
    }
  };

  // Status budget per kategori
  const getCategoryBudgetStatus = (categoryId: string): CategoryBudgetStatus | null => {
    const budget = budgets.find((b) => b.categoryId === categoryId);
    if (!budget) return null;

    const sisa = Math.max(0, budget.batasJumlah - budget.terpakai);
    const persentase = Math.min(
      100,
      budget.batasJumlah > 0 ? Math.round((budget.terpakai / budget.batasJumlah) * 100) : 0
    );

    return {
      kategori: budget.kategori,
      batasJumlah: budget.batasJumlah,
      terpakai: budget.terpakai,
      sisa,
      persentase,
    };
  };

  // Tambah akun aset baru ke database (POST /api/aset)
  const addAsset = async (data: {
    nama: string;
    jenis: AssetType;
    saldo: number;
    nomorRekening?: string;
    warna?: string;
    ikon?: string;
  }): Promise<Asset | null> => {
    try {
      const res = await fetch("/api/aset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        await fetchData();
        return json.data;
      }
      return null;
    } catch (err) {
      console.error("Error addAsset:", err);
      return null;
    }
  };

  // Update saldo akun aset (PATCH /api/aset/[id]/saldo)
  const updateAssetBalance = async (
    assetId: string,
    newBalance: number,
    recordAdjustment: boolean = true
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/aset/${assetId}/saldo`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saldo: newBalance,
          catatPenyesuaian: recordAdjustment,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        await fetchData();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error updateAssetBalance:", err);
      return false;
    }
  };

  // Tambah alokasi budget baru ke database (POST /api/budget)
  const createBudget = async (data: {
    categoryId: string;
    periodeBulan: string;
    batasJumlah: number;
    warna?: string;
  }): Promise<(Budget & { kategori: Category }) | null> => {
    try {
      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        await fetchData();
        return json.data;
      }
      return null;
    } catch (err) {
      console.error("Error createBudget:", err);
      return null;
    }
  };

  // Update budget (PATCH /api/budget/[id])
  const updateBudget = async (
    id: string,
    data: { batasJumlah?: number; warna?: string }
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/budget/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        await fetchData();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error updateBudget:", err);
      return false;
    }
  };

  // Hapus budget (DELETE /api/budget/[id])
  const deleteBudget = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/budget/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        await fetchData();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error deleteBudget:", err);
      return false;
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        assets,
        budgets,
        categories,
        isLoading,
        totalSaldo,
        totalPemasukanBulanIni,
        totalPengeluaranBulanIni,
        sisaBudgetBulanIni,
        totalBudgetBulanIni,
        refreshData: fetchData,
        addTransaction,
        deleteTransaction,
        getCategoryBudgetStatus,
        addAsset,
        updateAssetBalance,
        createBudget,
        updateBudget,
        deleteBudget,
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
