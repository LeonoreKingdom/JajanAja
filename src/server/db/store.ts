import {
  Asset,
  Budget,
  Category,
  Transaction,
  User,
} from "@/types/finance";
import {
  mockAssets,
  mockBudgets,
  mockTransactions,
  mockUser,
} from "@/lib/mock-data";
import { TransactionRecord } from "../schemas/transaction.schema";
import { allSeedCategories } from "./seeds/category.seed";
import { ReceiptScanRecord } from "../schemas/receipt.schema";
import {
  BagiTagihanRecord,
  PesertaBagiTagihanRecord,
  BagiTagihanWithPeserta,
  CreateBagiTagihanInput,
} from "../schemas/split-bill.schema";
import {
  NomorWhatsAppRecord,
  LogPesanWhatsAppRecord,
  ConnectWhatsAppInput,
} from "../schemas/whatsapp.schema";
import { LevinaChatMessageRecord } from "../schemas/levina.schema";
import { initialMockSplitBills } from "@/lib/mock-split-bills";
import { initialLevinaChatHistory } from "@/lib/mock-levina";
import {
  initTursoTables,
  seedTursoDefaults,
  loadDataFromTurso,
  persistTransaction,
  deleteTransactionFromDb,
  persistAsset,
  deleteAssetFromDb,
  persistBudget,
  deleteBudgetFromDb,
  persistReceiptScan,
  persistSplitBill,
  deleteSplitBillFromDb,
  persistPesertaStatus,
  persistWhatsAppConnection,
  persistWhatsAppLog,
  persistLevinaMessage,
  clearLevinaMessagesFromDb,
} from "./turso";

/**
 * Server-side store with in-memory cache and Turso libSQL cloud persistence.
 */
class ServerStore {
  private user: User = { ...mockUser };
  private assets: Asset[] = [...mockAssets];
  private categories: Category[] = [...allSeedCategories];
  private budgets: (Budget & { kategori: Category })[] = [...mockBudgets];
  private transactions: TransactionRecord[] = mockTransactions.map((tx) => ({
    id: tx.id,
    tipe: tx.tipe,
    jumlah: tx.jumlah,
    tanggal: tx.tanggal,
    categoryId: tx.categoryId,
    assetId: tx.assetId || "ast-1",
    catatan: tx.catatan,
    label: tx.label ? [tx.label] : [],
    sumber: tx.sumber,
    reimbursable: false,
    createdAt: tx.tanggal,
    updatedAt: tx.tanggal,
  }));
  private receiptScans: ReceiptScanRecord[] = [];
  private bagiTagihan: BagiTagihanRecord[] = initialMockSplitBills.map((b) => ({
    id: b.id,
    judul: b.judul,
    totalTagihan: b.totalTagihan,
    tanggal: b.tanggal,
    metode: b.metode,
    namaToko: b.namaToko,
    transactionId: b.transactionId,
    status: b.status,
    catatan: b.catatan,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  }));
  private pesertaBagiTagihan: PesertaBagiTagihanRecord[] = initialMockSplitBills.flatMap((b) =>
    b.peserta.map((p) => ({
      id: p.id,
      bagiTagihanId: b.id,
      nama: p.nama,
      bagian: p.bagian,
      sudahBayar: p.sudahBayar,
      nomorHp: p.nomorHp,
      avatar: p.avatar,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    }))
  );
  private whatsAppConnections: NomorWhatsAppRecord[] = [
    {
      id: "wa-1",
      userId: "usr-1",
      nomorWhatsApp: "6281234567890",
      namaProfil: "Talitha",
      status: "terhubung",
      defaultAssetId: "ast-1",
      autoCategorize: true,
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  private whatsAppLogs: LogPesanWhatsAppRecord[] = [];
  private levinaMessages: LevinaChatMessageRecord[] = initialLevinaChatHistory.map((m) => ({
    id: m.id,
    userId: "usr-1",
    sender: m.sender,
    text: m.text,
    tipe: (m.tipe as any) || "text",
    budgetData: m.budgetData,
    savingTips: m.savingTips,
    featureGuide: m.featureGuide,
    createdAt: new Date().toISOString(),
  }));
  private idempotencyKeys: Map<string, { transactionId: string; createdAt: string }> = new Map();

  /**
   * Sinkronisasi data dari Turso Cloud Database ke in-memory cache
   */
  async initFromTurso(): Promise<void> {
    try {
      await initTursoTables();
      await seedTursoDefaults();
      const data = await loadDataFromTurso();
      if (data) {
        if (data.user) this.user = data.user;
        if (data.categories.length > 0) this.categories = data.categories;
        if (data.assets.length > 0) this.assets = data.assets;
        if (data.budgets.length > 0) this.budgets = data.budgets;
        if (data.transactions.length > 0) this.transactions = data.transactions;
        if (data.receiptScans.length > 0) this.receiptScans = data.receiptScans;
        if (data.splitBills.length > 0) this.bagiTagihan = data.splitBills;
        if (data.splitBillParticipants.length > 0) this.pesertaBagiTagihan = data.splitBillParticipants;
        if (data.whatsAppConnections.length > 0) this.whatsAppConnections = data.whatsAppConnections;
        if (data.whatsAppLogs.length > 0) this.whatsAppLogs = data.whatsAppLogs;
        if (data.levinaMessages.length > 0) this.levinaMessages = data.levinaMessages;
      }
    } catch (err) {
      console.error("Gagal sinkronisasi data dari Turso:", err);
    }
  }

  getUser(): User {
    return { ...this.user };
  }

  getAssets(jenis?: string): Asset[] {
    if (jenis && jenis !== "semua") {
      return this.assets.filter((a) => a.jenis === jenis);
    }
    return [...this.assets];
  }

  getAssetById(id: string): Asset | undefined {
    return this.assets.find((a) => a.id === id);
  }

  createAsset(data: {
    nama: string;
    jenis: Asset["jenis"];
    saldo: number;
    nomorRekening?: string;
    warna?: string;
    ikon?: string;
  }): Asset {
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

    this.assets.push(newAsset);
    persistAsset(newAsset).catch(console.error);
    return newAsset;
  }

  updateAsset(
    id: string,
    data: {
      nama?: string;
      jenis?: Asset["jenis"];
      saldo?: number;
      nomorRekening?: string;
      warna?: string;
      ikon?: string;
    }
  ): Asset | null {
    const asset = this.assets.find((a) => a.id === id);
    if (!asset) return null;

    if (data.nama !== undefined) asset.nama = data.nama;
    if (data.jenis !== undefined) asset.jenis = data.jenis;
    if (data.saldo !== undefined) asset.saldo = data.saldo;
    if (data.nomorRekening !== undefined) asset.nomorRekening = data.nomorRekening;
    if (data.warna !== undefined) asset.warna = data.warna;
    if (data.ikon !== undefined) asset.ikon = data.ikon;
    asset.updatedAt = new Date().toISOString();

    persistAsset(asset).catch(console.error);
    return asset;
  }

  updateAssetBalance(id: string, newBalance: number): Asset | null {
    const asset = this.assets.find((a) => a.id === id);
    if (!asset) return null;
    asset.saldo = newBalance;
    asset.updatedAt = new Date().toISOString();
    persistAsset(asset).catch(console.error);
    return asset;
  }

  deleteAsset(id: string): boolean {
    const idx = this.assets.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    this.assets.splice(idx, 1);
    deleteAssetFromDb(id).catch(console.error);
    return true;
  }

  getCategories(): Category[] {
    return [...this.categories];
  }

  getBudgets(periodeBulan?: string): (Budget & { kategori: Category })[] {
    if (periodeBulan) {
      return this.budgets.filter((b) => b.periodeBulan === periodeBulan);
    }
    return [...this.budgets];
  }

  getBudgetById(id: string): (Budget & { kategori: Category }) | undefined {
    return this.budgets.find((b) => b.id === id);
  }

  getBudgetByCategoryAndPeriod(
    categoryId: string,
    periodeBulan: string
  ): (Budget & { kategori: Category }) | undefined {
    return this.budgets.find(
      (b) => b.categoryId === categoryId && b.periodeBulan === periodeBulan
    );
  }

  createBudget(data: {
    categoryId: string;
    periodeBulan: string;
    batasJumlah: number;
    warna?: string;
  }): Budget & { kategori: Category } {
    const existing = this.getBudgetByCategoryAndPeriod(
      data.categoryId,
      data.periodeBulan
    );
    if (existing) {
      throw new Error(
        `Budget untuk kategori ini pada periode ${data.periodeBulan} sudah ada.`
      );
    }

    const category = this.categories.find((c) => c.id === data.categoryId);
    if (!category) {
      throw new Error(`Kategori dengan id ${data.categoryId} tidak ditemukan.`);
    }

    const newBudget: Budget & { kategori: Category } = {
      id: `bdg-${Date.now()}`,
      categoryId: data.categoryId,
      periodeBulan: data.periodeBulan,
      batasJumlah: data.batasJumlah,
      terpakai: 0,
      warna: data.warna || category.warna || "#3b82f6",
      updatedAt: new Date().toISOString(),
      kategori: category,
    };

    this.budgets.push(newBudget);
    persistBudget(newBudget).catch(console.error);
    return newBudget;
  }

  updateBudget(
    id: string,
    data: { batasJumlah?: number; warna?: string }
  ): (Budget & { kategori: Category }) | null {
    const budget = this.budgets.find((b) => b.id === id);
    if (!budget) return null;

    if (data.batasJumlah !== undefined) {
      budget.batasJumlah = data.batasJumlah;
    }
    if (data.warna !== undefined) {
      budget.warna = data.warna;
    }
    budget.updatedAt = new Date().toISOString();

    persistBudget(budget).catch(console.error);
    return budget;
  }

  deleteBudget(id: string): boolean {
    const idx = this.budgets.findIndex((b) => b.id === id);
    if (idx === -1) return false;
    this.budgets.splice(idx, 1);
    deleteBudgetFromDb(id).catch(console.error);
    return true;
  }

  getTransactions(): TransactionRecord[] {
    return [...this.transactions];
  }

  addTransaction(record: TransactionRecord): TransactionRecord {
    // 1. Tambah transaksi di urutan teratas
    this.transactions.unshift(record);

    // 2. Mutasi saldo aset
    const asset = this.assets.find((a) => a.id === record.assetId);
    if (asset) {
      if (record.tipe === "pengeluaran") {
        asset.saldo -= record.jumlah;
      } else {
        asset.saldo += record.jumlah;
      }
      asset.updatedAt = new Date().toISOString();
      persistAsset(asset).catch(console.error);
    }

    // 3. Mutasi budget jika pengeluaran
    if (record.tipe === "pengeluaran") {
      const budget = this.budgets.find((b) => b.categoryId === record.categoryId);
      if (budget) {
        budget.terpakai += record.jumlah;
        persistBudget(budget).catch(console.error);
      }
    }

    persistTransaction(record).catch(console.error);
    return record;
  }

  addRawTransaction(record: TransactionRecord): TransactionRecord {
    this.transactions.unshift(record);
    persistTransaction(record).catch(console.error);
    return record;
  }

  deleteTransaction(id: string): boolean {
    const idx = this.transactions.findIndex((t) => t.id === id);
    if (idx === -1) return false;

    const [deleted] = this.transactions.splice(idx, 1);

    // Rollback saldo aset
    const asset = this.assets.find((a) => a.id === deleted.assetId);
    if (asset) {
      if (deleted.tipe === "pengeluaran") {
        asset.saldo += deleted.jumlah;
      } else {
        asset.saldo -= deleted.jumlah;
      }
      asset.updatedAt = new Date().toISOString();
      persistAsset(asset).catch(console.error);
    }

    // Rollback budget
    if (deleted.tipe === "pengeluaran") {
      const budget = this.budgets.find((b) => b.categoryId === deleted.categoryId);
      if (budget) {
        budget.terpakai = Math.max(0, budget.terpakai - deleted.jumlah);
        persistBudget(budget).catch(console.error);
      }
    }

    deleteTransactionFromDb(id).catch(console.error);
    return true;
  }

  getReceiptScans(limit?: number): ReceiptScanRecord[] {
    if (limit && limit > 0) {
      return this.receiptScans.slice(0, limit);
    }
    return [...this.receiptScans];
  }

  getReceiptScanById(id: string): ReceiptScanRecord | undefined {
    return this.receiptScans.find((s) => s.id === id);
  }

  getReceiptScanByIdempotencyKey(key: string): ReceiptScanRecord | undefined {
    return this.receiptScans.find((s) => s.idempotencyKey === key);
  }

  saveReceiptScan(scan: ReceiptScanRecord): ReceiptScanRecord {
    const existingIndex = this.receiptScans.findIndex((s) => s.id === scan.id);
    if (existingIndex >= 0) {
      this.receiptScans[existingIndex] = scan;
    } else {
      this.receiptScans.unshift(scan);
    }
    persistReceiptScan(scan).catch(console.error);
    return scan;
  }

  updateReceiptScan(
    id: string,
    updates: Partial<ReceiptScanRecord>
  ): ReceiptScanRecord | null {
    const scan = this.receiptScans.find((s) => s.id === id);
    if (!scan) return null;
    Object.assign(scan, updates, { updatedAt: new Date().toISOString() });
    persistReceiptScan(scan).catch(console.error);
    return scan;
  }

  getIdempotency(key: string): { transactionId: string; createdAt: string } | undefined {
    return this.idempotencyKeys.get(key);
  }

  setIdempotency(key: string, transactionId: string): void {
    this.idempotencyKeys.set(key, { transactionId, createdAt: new Date().toISOString() });
  }

  getBagiTagihanList(): BagiTagihanWithPeserta[] {
    return this.bagiTagihan.map((b) => ({
      ...b,
      peserta: this.pesertaBagiTagihan.filter((p) => p.bagiTagihanId === b.id),
    }));
  }

  getBagiTagihanById(id: string): BagiTagihanWithPeserta | undefined {
    const bill = this.bagiTagihan.find((b) => b.id === id);
    if (!bill) return undefined;
    return {
      ...bill,
      peserta: this.pesertaBagiTagihan.filter((p) => p.bagiTagihanId === id),
    };
  }

  createBagiTagihan(input: CreateBagiTagihanInput): BagiTagihanWithPeserta {
    const id = `split-${Date.now()}`;
    const now = new Date().toISOString();

    const record: BagiTagihanRecord = {
      id,
      judul: input.judul,
      totalTagihan: input.totalTagihan,
      tanggal: input.tanggal,
      metode: input.metode,
      namaToko: input.namaToko,
      transactionId: input.transactionId,
      status: "aktif",
      catatan: input.catatan,
      createdAt: now,
      updatedAt: now,
    };

    const newPeserta: PesertaBagiTagihanRecord[] = input.peserta.map((p, idx) => ({
      id: p.id || `p-${Date.now()}-${idx}`,
      bagiTagihanId: id,
      nama: p.nama,
      bagian: p.bagian,
      sudahBayar: Boolean(p.sudahBayar),
      nomorHp: p.nomorHp,
      avatar: p.avatar,
      waktuBayar: p.sudahBayar ? now : undefined,
      createdAt: now,
      updatedAt: now,
    }));

    // Cek jika semua sudah bayar
    const allPaid = newPeserta.every((p) => p.sudahBayar);
    if (allPaid && newPeserta.length > 0) {
      record.status = "selesai";
    }

    this.bagiTagihan.unshift(record);
    this.pesertaBagiTagihan.push(...newPeserta);

    persistSplitBill(record, newPeserta).catch(console.error);

    return {
      ...record,
      peserta: newPeserta,
    };
  }

  updateBagiTagihan(
    id: string,
    updates: Partial<BagiTagihanRecord>
  ): BagiTagihanWithPeserta | null {
    const bill = this.bagiTagihan.find((b) => b.id === id);
    if (!bill) return null;

    Object.assign(bill, updates, { updatedAt: new Date().toISOString() });
    const peserta = this.pesertaBagiTagihan.filter((p) => p.bagiTagihanId === id);
    persistSplitBill(bill, peserta).catch(console.error);

    return {
      ...bill,
      peserta,
    };
  }

  updatePesertaStatus(
    bagiTagihanId: string,
    pesertaId: string,
    sudahBayar: boolean
  ): BagiTagihanWithPeserta | null {
    const bill = this.bagiTagihan.find((b) => b.id === bagiTagihanId);
    if (!bill) return null;

    const peserta = this.pesertaBagiTagihan.find(
      (p) => p.bagiTagihanId === bagiTagihanId && p.id === pesertaId
    );
    if (!peserta) return null;

    const now = new Date().toISOString();
    peserta.sudahBayar = sudahBayar;
    peserta.waktuBayar = sudahBayar ? now : undefined;
    peserta.updatedAt = now;

    // Evaluasi status tagihan selesai jika seluruh peserta sudah bayar
    const billPeserta = this.pesertaBagiTagihan.filter((p) => p.bagiTagihanId === bagiTagihanId);
    const allPaid = billPeserta.length > 0 && billPeserta.every((p) => p.sudahBayar);
    bill.status = allPaid ? "selesai" : "aktif";
    bill.updatedAt = now;

    persistPesertaStatus(pesertaId, sudahBayar, peserta.waktuBayar, bagiTagihanId, bill.status).catch(console.error);

    return {
      ...bill,
      peserta: billPeserta,
    };
  }

  deleteBagiTagihan(id: string): boolean {
    const idx = this.bagiTagihan.findIndex((b) => b.id === id);
    if (idx === -1) return false;

    this.bagiTagihan.splice(idx, 1);
    this.pesertaBagiTagihan = this.pesertaBagiTagihan.filter((p) => p.bagiTagihanId !== id);
    deleteSplitBillFromDb(id).catch(console.error);
    return true;
  }

  getWhatsAppConnection(userId: string = "usr-1"): NomorWhatsAppRecord | undefined {
    return this.whatsAppConnections.find(
      (w) => w.userId === userId && w.status === "terhubung"
    );
  }

  getWhatsAppByNumber(phone: string): NomorWhatsAppRecord | undefined {
    return this.whatsAppConnections.find(
      (w) => w.nomorWhatsApp === phone && w.status === "terhubung"
    );
  }

  connectWhatsApp(
    input: ConnectWhatsAppInput,
    userId: string = "usr-1"
  ): NomorWhatsAppRecord {
    const now = new Date().toISOString();
    let conn = this.whatsAppConnections.find((w) => w.userId === userId);

    if (conn) {
      conn.nomorWhatsApp = input.nomorWhatsApp;
      if (input.namaProfil) conn.namaProfil = input.namaProfil;
      if (input.defaultAssetId) conn.defaultAssetId = input.defaultAssetId;
      if (input.autoCategorize !== undefined) conn.autoCategorize = input.autoCategorize;
      conn.status = "terhubung";
      conn.verifiedAt = now;
      conn.updatedAt = now;
    } else {
      conn = {
        id: `wa-${Date.now()}`,
        userId,
        nomorWhatsApp: input.nomorWhatsApp,
        namaProfil: input.namaProfil || "Pengguna JajanAja",
        status: "terhubung",
        defaultAssetId: input.defaultAssetId || "ast-1",
        autoCategorize: input.autoCategorize !== undefined ? input.autoCategorize : true,
        verifiedAt: now,
        createdAt: now,
        updatedAt: now,
      };
      this.whatsAppConnections.push(conn);
    }

    persistWhatsAppConnection(conn).catch(console.error);
    return conn;
  }

  disconnectWhatsApp(userId: string = "usr-1"): boolean {
    const conn = this.whatsAppConnections.find((w) => w.userId === userId);
    if (!conn) return false;
    conn.status = "terputus";
    conn.updatedAt = new Date().toISOString();
    persistWhatsAppConnection(conn).catch(console.error);
    return true;
  }

  addWhatsAppMessageLog(log: Omit<LogPesanWhatsAppRecord, "id" | "createdAt">): LogPesanWhatsAppRecord {
    const record: LogPesanWhatsAppRecord = {
      id: `wamsg-${Date.now()}`,
      ...log,
      createdAt: new Date().toISOString(),
    };
    this.whatsAppLogs.unshift(record);
    persistWhatsAppLog(record).catch(console.error);
    return record;
  }

  getWhatsAppMessageLogs(limit: number = 20): LogPesanWhatsAppRecord[] {
    return this.whatsAppLogs.slice(0, limit);
  }

  getLevinaMessages(userId: string = "usr-1", limit: number = 50): LevinaChatMessageRecord[] {
    return this.levinaMessages
      .filter((m) => m.userId === userId)
      .slice(-limit);
  }

  addLevinaMessage(
    msg: Omit<LevinaChatMessageRecord, "id" | "createdAt">
  ): LevinaChatMessageRecord {
    const record: LevinaChatMessageRecord = {
      id: `lev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      ...msg,
    };
    this.levinaMessages.push(record);
    persistLevinaMessage(record).catch(console.error);
    return record;
  }

  clearLevinaMessages(userId: string = "usr-1"): void {
    this.levinaMessages = this.levinaMessages.filter((m) => m.userId !== userId);
    clearLevinaMessagesFromDb(userId).catch(console.error);
  }

  resetLevinaMessages(userId: string = "usr-1"): LevinaChatMessageRecord[] {
    this.clearLevinaMessages(userId);
    const defaults = initialLevinaChatHistory.map((m) => ({
      id: `lev-${Date.now()}-${m.id}`,
      userId,
      sender: m.sender,
      text: m.text,
      tipe: (m.tipe as any) || "text",
      budgetData: m.budgetData,
      savingTips: m.savingTips,
      featureGuide: m.featureGuide,
      createdAt: new Date().toISOString(),
    }));
    this.levinaMessages.push(...defaults);
    clearLevinaMessagesFromDb(userId).catch(console.error);
    defaults.forEach((m) => persistLevinaMessage(m).catch(console.error));
    return defaults;
  }
}

// Singleton server store
export const serverStore = new ServerStore();

let initSyncPromise: Promise<void> | null = null;
export function ensureStoreInitialized(): Promise<void> {
  if (!initSyncPromise) {
    initSyncPromise = serverStore.initFromTurso();
  }
  return initSyncPromise;
}

// Trigger background sync if Turso URL is configured
if (process.env.TURSO_DATABASE_URL) {
  ensureStoreInitialized().catch((err) => {
    console.error("Gagal inisialisasi Turso pada startup:", err);
  });
}
