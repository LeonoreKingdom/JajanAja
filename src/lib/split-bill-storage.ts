import { SplitBillGroup } from "@/types/split-bill";

const STORAGE_KEY = "jajanaja_split_bills";

/**
 * Mengambil seluruh daftar Bagi Tagihan dari database via API (dengan fallback cache lokal)
 */
export async function fetchSplitBillsFromApi(): Promise<SplitBillGroup[]> {
  try {
    const res = await fetch("/api/bagi-tagihan");
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(json.data));
          } catch {}
        }
        return json.data;
      }
    }
  } catch (e) {
    console.warn("Gagal fetch bagi tagihan dari API, menggunakan cache lokal:", e);
  }

  return getLocalSplitBills();
}

/**
 * Membaca data bagi tagihan dari cache lokal
 */
export function getLocalSplitBills(): SplitBillGroup[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Gagal membaca split bills dari localStorage:", e);
  }

  return [];
}

/**
 * Mengambil satu tagihan spesifik berdasarkan ID
 */
export async function getSplitBillById(id: string): Promise<SplitBillGroup | undefined> {
  try {
    const res = await fetch(`/api/bagi-tagihan/${id}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch (e) {
    console.warn("Gagal fetch split bill detail:", e);
  }

  const all = getLocalSplitBills();
  return all.find((b) => b.id === id);
}

export function getLocalSplitBillById(id: string): SplitBillGroup | undefined {
  const all = getLocalSplitBills();
  return all.find((b) => b.id === id);
}

/**
 * Mengubah status pelunasan seorang peserta dan menyimpannya ke database
 */
export async function updatePesertaStatusApi(
  bagiTagihanId: string,
  pesertaId: string,
  sudahBayar: boolean
): Promise<SplitBillGroup | null> {
  try {
    const res = await fetch(`/api/bagi-tagihan/${bagiTagihanId}/peserta/${pesertaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sudahBayar }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        // Update local cache
        const current = getLocalSplitBills();
        const updated = current.map((b) => (b.id === bagiTagihanId ? json.data : b));
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          } catch {}
        }
        return json.data;
      }
    }
  } catch (e) {
    console.error("Gagal update status peserta:", e);
  }
  return null;
}

/**
 * Menyimpan Bagi Tagihan baru ke database
 */
export async function createSplitBillApi(data: {
  judul: string;
  totalTagihan: number;
  tanggal: string;
  metode: string;
  namaToko?: string;
  catatan?: string;
  peserta: Array<{ nama: string; bagian: number; nomorHp?: string; sudahBayar?: boolean }>;
}): Promise<SplitBillGroup | null> {
  try {
    const res = await fetch("/api/bagi-tagihan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const current = getLocalSplitBills();
        const updated = [json.data, ...current];
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          } catch {}
        }
        return json.data;
      }
    }
  } catch (e) {
    console.error("Gagal membuat bagi tagihan:", e);
  }
  return null;
}

/**
 * Menghapus satu Bagi Tagihan berdasarkan ID dari database
 */
export async function deleteSplitBillApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/bagi-tagihan/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      const current = getLocalSplitBills();
      const updated = current.filter((b) => b.id !== id);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {}
      }
      return true;
    }
  } catch (e) {
    console.error("Gagal menghapus bagi tagihan:", e);
  }
  return false;
}

/**
 * Menyimpan data satu Bagi Tagihan ke cache lokal
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
 * Menghapus satu Bagi Tagihan dari cache lokal
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
