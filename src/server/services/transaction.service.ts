import { serverStore } from "../db/store";
import { TransactionRecord } from "../schemas/transaction.schema";
import { Category, Asset, TransactionType, TransactionSource } from "@/types/finance";

export interface EnrichedTransaction extends TransactionRecord {
  kategori: Category;
  aset?: Asset;
}

export interface GetTransactionsQueryParams {
  tipe?: TransactionType | "semua";
  sumber?: TransactionSource | "semua";
  search?: string;
  categoryId?: string;
  assetId?: string;
  limit?: number;
  offset?: number;
}

export interface GetTransactionsResponse {
  transaksi: EnrichedTransaction[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export function getRecentTransactions(
  params?: GetTransactionsQueryParams
): GetTransactionsResponse {
  const limit = Math.max(1, Math.min(100, params?.limit ?? 10));
  const offset = Math.max(0, params?.offset ?? 0);
  const tipe = params?.tipe || "semua";
  const sumber = params?.sumber || "semua";
  const search = params?.search?.trim().toLowerCase();

  const allRecords = serverStore.getTransactions();
  const categories = serverStore.getCategories();
  const assets = serverStore.getAssets();

  const catMap = new Map(categories.map((c) => [c.id, c]));
  const assetMap = new Map(assets.map((a) => [a.id, a]));

  // Filtering
  let filtered = allRecords.filter((tx) => {
    // Filter tipe
    if (tipe !== "semua" && tx.tipe !== tipe) return false;

    // Filter sumber
    if (sumber !== "semua" && tx.sumber !== sumber) return false;

    // Filter category
    if (params?.categoryId && tx.categoryId !== params.categoryId) return false;

    // Filter asset
    if (params?.assetId && tx.assetId !== params.assetId) return false;

    // Filter search text
    if (search) {
      const cat = catMap.get(tx.categoryId);
      const catatanMatch = tx.catatan?.toLowerCase().includes(search);
      const merchantMatch = tx.merchant?.toLowerCase().includes(search);
      const categoryMatch = cat?.nama.toLowerCase().includes(search);
      const labelMatch = tx.label?.some((l) => l.toLowerCase().includes(search));

      if (!catatanMatch && !merchantMatch && !categoryMatch && !labelMatch) {
        return false;
      }
    }

    return true;
  });

  const total = filtered.length;

  // Sorting descending by tanggal & id
  filtered.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  // Pagination slice
  const pagedRecords = filtered.slice(offset, offset + limit);

  // Enriched with Category and Asset details
  const enriched: EnrichedTransaction[] = pagedRecords.map((tx) => {
    const category = catMap.get(tx.categoryId) || {
      id: tx.categoryId,
      nama: tx.catatan || "Kategori",
      tipe: tx.tipe,
      ikon: tx.tipe === "pengeluaran" ? "ShoppingBag" : "Coins",
      warna: tx.tipe === "pengeluaran" ? "#f43f5e" : "#10b981",
    };
    const asset = assetMap.get(tx.assetId);

    return {
      ...tx,
      kategori: category,
      aset: asset,
    };
  });

  return {
    transaksi: enriched,
    total,
    limit,
    offset,
    hasMore: offset + limit < total,
  };
}
