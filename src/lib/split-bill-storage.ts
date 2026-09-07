import { SplitBillGroup } from "@/types/split-bill";
import { initialMockSplitBills } from "./mock-split-bills";

const STORAGE_KEY = "jajanaja_split_bills";

/**
 * Mendapatkan seluruh daftar Bagi Tagihan dari localStorage (dengan fallback data mock)
 */
export function getLocalSplitBills(): SplitBillGroup[] {
  if (typeof window === "undefined") {
    return initialMockSplitBills;
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Gagal membaca split bills dari localStorage:", e);
  }

  // Simpan data awal jika belum ada
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockSplitBills));
  } catch {}
  return initialMockSplitBills;
}

/**
 * Mengambil satu tagihan spesifik berdasarkan ID
 */
export function getLocalSplitBillById(id: string): SplitBillGroup | undefined {
  const all = getLocalSplitBills();
  return all.find((b) => b.id === id);
}

/**
 * Menyimpan atau memperbarui data satu Bagi Tagihan
 */
export function saveLocalSplitBill(bill: SplitBillGroup): SplitBillGroup[] {
  const current = getLocalSplitBills();
  const existingIndex = current.findIndex((b) => b.id === bill.id);

  let updated: SplitBillGroup[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = { ...bill, updatedAt: new Date().toISOString() };
  } else {
    updated = [bill, ...current];
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Gagal menyimpan ke localStorage:", e);
    }
  }

  return updated;
}

/**
 * Menghapus satu Bagi Tagihan berdasarkan ID
 */
export function deleteLocalSplitBill(id: string): SplitBillGroup[] {
  const current = getLocalSplitBills();
  const updated = current.filter((b) => b.id !== id);

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Gagal menghapus dari localStorage:", e);
    }
  }

  return updated;
}

/**
 * Mengembalikan data awal (reset to seed mock)
 */
export function resetLocalSplitBills(): SplitBillGroup[] {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockSplitBills));
    } catch {}
  }
  return initialMockSplitBills;
}
