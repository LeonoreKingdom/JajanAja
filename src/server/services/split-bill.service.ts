import { serverStore } from "../db/store";
import {
  BagiTagihanWithPeserta,
  CreateBagiTagihanInput,
  validateCreateBagiTagihan,
} from "../schemas/split-bill.schema";
import { getRecentTransactions, EnrichedTransaction } from "./transaction.service";

export interface ExpenseTransactionForSplit extends EnrichedTransaction {
  isSplit: boolean;
  splitBillId?: string;
  splitBillJudul?: string;
}

export interface GetExpenseTransactionsResponse {
  transaksi: ExpenseTransactionForSplit[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Mengambil daftar transaksi pengeluaran (JajanAja) yang dapat dipilih untuk bagi tagihan
 */
export function getExpenseTransactionsForSplit(params?: {
  search?: string;
  limit?: number;
  offset?: number;
  excludeAlreadySplit?: boolean;
}): GetExpenseTransactionsResponse {
  const limit = Math.max(1, Math.min(100, params?.limit ?? 20));
  const offset = Math.max(0, params?.offset ?? 0);

  // Ambil semua transaksi pengeluaran
  const txResult = getRecentTransactions({
    tipe: "pengeluaran",
    search: params?.search,
    limit: 100, // Ambil pool yang cukup
    offset: 0,
  });

  const allSplitBills = serverStore.getBagiTagihanList();
  const splitMap = new Map(
    allSplitBills
      .filter((b) => Boolean(b.transactionId))
      .map((b) => [b.transactionId!, b])
  );

  let mapped: ExpenseTransactionForSplit[] = txResult.transaksi.map((tx) => {
    const linkedSplit = splitMap.get(tx.id);
    return {
      ...tx,
      isSplit: Boolean(linkedSplit),
      splitBillId: linkedSplit?.id,
      splitBillJudul: linkedSplit?.judul,
    };
  });

  if (params?.excludeAlreadySplit) {
    mapped = mapped.filter((tx) => !tx.isSplit);
  }

  const total = mapped.length;
  const paged = mapped.slice(offset, offset + limit);

  return {
    transaksi: paged,
    total,
    limit,
    offset,
    hasMore: offset + limit < total,
  };
}

/**
 * Mengambil seluruh daftar bagi tagihan
 */
export function getAllBagiTagihan(): BagiTagihanWithPeserta[] {
  return serverStore.getBagiTagihanList();
}

/**
 * Mengambil detail satu bagi tagihan beserta peserta
 */
export function getBagiTagihanById(id: string): BagiTagihanWithPeserta | undefined {
  return serverStore.getBagiTagihanById(id);
}

/**
 * Menyimpan data pembagian tagihan baru
 */
export function createNewBagiTagihan(input: unknown): {
  success: boolean;
  data?: BagiTagihanWithPeserta;
  errors?: string[];
} {
  const validation = validateCreateBagiTagihan(input);
  if (!validation.valid || !validation.data) {
    return { success: false, errors: validation.errors };
  }

  const created = serverStore.createBagiTagihan(validation.data);
  return { success: true, data: created };
}

/**
 * Mengubah status bayar peserta bagi tagihan
 */
export function togglePesertaPaymentStatus(
  bagiTagihanId: string,
  pesertaId: string,
  sudahBayar: boolean
): {
  success: boolean;
  data?: BagiTagihanWithPeserta;
  message?: string;
} {
  const updated = serverStore.updatePesertaStatus(bagiTagihanId, pesertaId, sudahBayar);
  if (!updated) {
    return {
      success: false,
      message: "Data bagi tagihan atau peserta tidak ditemukan.",
    };
  }

  return {
    success: true,
    data: updated,
  };
}
