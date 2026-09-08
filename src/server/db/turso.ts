import { createClient, Client } from "@libsql/client";
import {
  Asset,
  Budget,
  Category,
  User,
} from "@/types/finance";
import { TransactionRecord } from "../schemas/transaction.schema";
import { ReceiptScanRecord } from "../schemas/receipt.schema";
import {
  BagiTagihanRecord,
  PesertaBagiTagihanRecord,
} from "../schemas/split-bill.schema";
import {
  NomorWhatsAppRecord,
  LogPesanWhatsAppRecord,
} from "../schemas/whatsapp.schema";
import { LevinaChatMessageRecord } from "../schemas/levina.schema";
import {
  mockAssets,
  mockBudgets,
  mockTransactions,
  mockUser,
} from "@/lib/mock-data";
import { allSeedCategories } from "./seeds/category.seed";
import { initialMockSplitBills } from "@/lib/mock-split-bills";
import { initialLevinaChatHistory } from "@/lib/mock-levina";

let clientInstance: Client | null = null;

export function getTursoClient(): Client | null {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    return null;
  }

  if (!clientInstance) {
    clientInstance = createClient({
      url,
      authToken,
    });
  }

  return clientInstance;
}

/**
 * Inisialisasi skema tabel SQLite di Turso jika belum ada
 */
export async function initTursoTables(): Promise<void> {
  const client = getTursoClient();
  if (!client) return;

  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      nama TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT,
      nomor_whatsapp TEXT,
      avatar_url TEXT,
      role TEXT DEFAULT 'Pro'
    );`,
    `CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      nama TEXT NOT NULL,
      tipe TEXT NOT NULL,
      ikon TEXT NOT NULL DEFAULT 'Tag',
      warna TEXT NOT NULL DEFAULT '#6366f1',
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      nama TEXT NOT NULL,
      jenis TEXT NOT NULL,
      saldo INTEGER NOT NULL DEFAULT 0,
      nomor_rekening TEXT,
      warna TEXT,
      ikon TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      periode_bulan TEXT NOT NULL,
      batas_jumlah INTEGER NOT NULL,
      terpakai INTEGER NOT NULL DEFAULT 0,
      warna TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(category_id, periode_bulan)
    );`,
    `CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      tipe TEXT NOT NULL,
      jumlah INTEGER NOT NULL,
      tanggal TEXT NOT NULL,
      category_id TEXT NOT NULL,
      asset_id TEXT NOT NULL,
      catatan TEXT,
      merchant TEXT,
      label TEXT,
      sumber TEXT NOT NULL DEFAULT 'manual',
      reimbursable INTEGER NOT NULL DEFAULT 0,
      photo_url TEXT,
      receipt_scan_id TEXT,
      split_bill_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS receipt_scans (
      id TEXT PRIMARY KEY,
      foto_url TEXT,
      nama_toko TEXT NOT NULL,
      tanggal TEXT NOT NULL,
      waktu TEXT,
      nomor_struk TEXT,
      subtotal INTEGER NOT NULL DEFAULT 0,
      pajak INTEGER NOT NULL DEFAULT 0,
      diskon INTEGER NOT NULL DEFAULT 0,
      total INTEGER NOT NULL DEFAULT 0,
      kategori_saran_id TEXT,
      kategori_saran_nama TEXT,
      confidence INTEGER NOT NULL DEFAULT 0,
      raw_text TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      transaction_id TEXT,
      idempotency_key TEXT UNIQUE,
      items_json TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS split_bills (
      id TEXT PRIMARY KEY,
      judul TEXT NOT NULL,
      total_tagihan INTEGER NOT NULL DEFAULT 0,
      tanggal TEXT NOT NULL,
      metode TEXT NOT NULL DEFAULT 'sama_rata',
      nama_toko TEXT,
      transaction_id TEXT,
      status TEXT NOT NULL DEFAULT 'aktif',
      catatan TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS split_bill_participants (
      id TEXT PRIMARY KEY,
      split_bill_id TEXT NOT NULL,
      nama TEXT NOT NULL,
      bagian INTEGER NOT NULL DEFAULT 0,
      sudah_bayar INTEGER NOT NULL DEFAULT 0,
      nomor_hp TEXT,
      avatar TEXT,
      waktu_bayar TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS whatsapp_connections (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      nomor_whatsapp TEXT NOT NULL UNIQUE,
      nama_profil TEXT,
      status TEXT NOT NULL DEFAULT 'terhubung',
      kode_verifikasi TEXT,
      default_asset_id TEXT,
      auto_categorize INTEGER NOT NULL DEFAULT 1,
      verified_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS whatsapp_logs (
      id TEXT PRIMARY KEY,
      whatsapp_id TEXT,
      nomor_pengirim TEXT NOT NULL,
      pesan_mentah TEXT NOT NULL,
      tipe_terdeteksi TEXT,
      jumlah INTEGER,
      deskripsi TEXT,
      kategori_id TEXT,
      status_proses TEXT NOT NULL DEFAULT 'berhasil',
      transaksi_id TEXT,
      balasan_bot TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS levina_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      text TEXT NOT NULL,
      tipe TEXT NOT NULL DEFAULT 'text',
      budget_data TEXT,
      saving_tips TEXT,
      feature_guide TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );`,
  ];

  for (const sql of statements) {
    await client.execute(sql);
  }

  // Safe migrations for existing users table
  try {
    await client.execute("ALTER TABLE users ADD COLUMN password TEXT;");
  } catch {}
  try {
    await client.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'Pro';");
  } catch {}
}

/**
 * Seed data default jika tabel kosong
 */
export async function seedTursoDefaults(): Promise<void> {
  const client = getTursoClient();
  if (!client) return;

  // 1. Check categories
  const catCheck = await client.execute("SELECT COUNT(*) as count FROM categories");
  const catCount = Number(catCheck.rows[0].count);
  if (catCount === 0) {
    for (const cat of allSeedCategories) {
      await client.execute({
        sql: "INSERT OR REPLACE INTO categories (id, nama, tipe, ikon, warna, is_default) VALUES (?, ?, ?, ?, ?, ?)",
        args: [cat.id, cat.nama, cat.tipe, cat.ikon, cat.warna, (cat as any).isDefault ? 1 : 0],
      });
    }
  }

  // 2. Check user
  const userCheck = await client.execute("SELECT COUNT(*) as count FROM users");
  const userCount = Number(userCheck.rows[0].count);
  if (userCount === 0) {
    await client.execute({
      sql: "INSERT OR REPLACE INTO users (id, nama, email, password, nomor_whatsapp, avatar_url, role) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [
        mockUser.id,
        mockUser.nama,
        mockUser.email,
        mockUser.password || "password123",
        mockUser.nomorWhatsApp || null,
        mockUser.avatarUrl || "",
        "Pro",
      ],
    });
  } else {
    // Ensure existing user has default password set if null
    try {
      await client.execute("UPDATE users SET password = 'password123' WHERE password IS NULL OR password = ''");
    } catch {}
  }

  // 3. Check assets
  const assetCheck = await client.execute("SELECT COUNT(*) as count FROM assets");
  const assetCount = Number(assetCheck.rows[0].count);
  if (assetCount === 0) {
    for (const ast of mockAssets) {
      await client.execute({
        sql: "INSERT OR REPLACE INTO assets (id, nama, jenis, saldo, nomor_rekening, warna, ikon) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: [ast.id, ast.nama, ast.jenis, ast.saldo, ast.nomorRekening || "", ast.warna || "", ast.ikon || ""],
      });
    }
  }

  // 4. Check budgets
  const budgetCheck = await client.execute("SELECT COUNT(*) as count FROM budgets");
  const budgetCount = Number(budgetCheck.rows[0].count);
  if (budgetCount === 0) {
    for (const b of mockBudgets) {
      await client.execute({
        sql: "INSERT OR REPLACE INTO budgets (id, category_id, periode_bulan, batas_jumlah, terpakai, warna) VALUES (?, ?, ?, ?, ?, ?)",
        args: [b.id, b.categoryId, b.periodeBulan, b.batasJumlah, b.terpakai, (b as any).warna || b.kategori?.warna || ""],
      });
    }
  }

  // 5. Check transactions
  const txCheck = await client.execute("SELECT COUNT(*) as count FROM transactions");
  const txCount = Number(txCheck.rows[0].count);
  if (txCount === 0) {
    for (const tx of mockTransactions) {
      await client.execute({
        sql: "INSERT OR REPLACE INTO transactions (id, tipe, jumlah, tanggal, category_id, asset_id, catatan, merchant, label, sumber, reimbursable) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        args: [
          tx.id,
          tx.tipe,
          tx.jumlah,
          tx.tanggal,
          tx.categoryId,
          tx.assetId || "ast-1",
          tx.catatan || "",
          tx.catatan || "",
          tx.label ? JSON.stringify([tx.label]) : "[]",
          tx.sumber,
          0,
        ],
      });
    }
  }

  // 6. Check split bills
  const sbCheck = await client.execute("SELECT COUNT(*) as count FROM split_bills");
  const sbCount = Number(sbCheck.rows[0].count);
  if (sbCount === 0) {
    for (const b of initialMockSplitBills) {
      await client.execute({
        sql: "INSERT OR REPLACE INTO split_bills (id, judul, total_tagihan, tanggal, metode, nama_toko, transaction_id, status, catatan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        args: [b.id, b.judul, b.totalTagihan, b.tanggal, b.metode, b.namaToko || "", b.transactionId || null, b.status, b.catatan || ""],
      });
      for (const p of b.peserta) {
        await client.execute({
          sql: "INSERT OR REPLACE INTO split_bill_participants (id, split_bill_id, nama, bagian, sudah_bayar, nomor_hp, avatar, waktu_bayar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          args: [p.id, b.id, p.nama, p.bagian, p.sudahBayar ? 1 : 0, p.nomorHp || "", p.avatar || "", p.sudahBayar ? b.createdAt : null],
        });
      }
    }
  }

  // 7. Check WhatsApp connection
  const waCheck = await client.execute("SELECT COUNT(*) as count FROM whatsapp_connections");
  const waCount = Number(waCheck.rows[0].count);
  if (waCount === 0) {
    await client.execute({
      sql: "INSERT OR REPLACE INTO whatsapp_connections (id, user_id, nomor_whatsapp, nama_profil, status, default_asset_id, auto_categorize) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: ["wa-1", "usr-1", "6281234567890", "Talitha", "terhubung", "ast-1", 1],
    });
  }

  // 8. Check Levina messages
  const levCheck = await client.execute("SELECT COUNT(*) as count FROM levina_messages");
  const levCount = Number(levCheck.rows[0].count);
  if (levCount === 0) {
    for (const m of initialLevinaChatHistory) {
      await client.execute({
        sql: "INSERT OR REPLACE INTO levina_messages (id, user_id, sender, text, tipe, budget_data, saving_tips, feature_guide) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        args: [
          m.id,
          "usr-1",
          m.sender,
          m.text,
          m.tipe || "text",
          m.budgetData ? JSON.stringify(m.budgetData) : null,
          m.savingTips ? JSON.stringify(m.savingTips) : null,
          m.featureGuide ? JSON.stringify(m.featureGuide) : null,
        ],
      });
    }
  }
}

/**
 * Helper sync data dari Turso ke in-memory store
 */
export async function loadDataFromTurso(): Promise<{
  user?: User;
  categories: Category[];
  assets: Asset[];
  budgets: (Budget & { kategori: Category })[];
  transactions: TransactionRecord[];
  receiptScans: ReceiptScanRecord[];
  splitBills: BagiTagihanRecord[];
  splitBillParticipants: PesertaBagiTagihanRecord[];
  whatsAppConnections: NomorWhatsAppRecord[];
  whatsAppLogs: LogPesanWhatsAppRecord[];
  levinaMessages: LevinaChatMessageRecord[];
} | null> {
  const client = getTursoClient();
  if (!client) return null;

  try {
    const [
      userRes,
      catRes,
      assetRes,
      budgetRes,
      txRes,
      receiptRes,
      sbRes,
      sbpRes,
      waRes,
      waLogsRes,
      levRes,
    ] = await Promise.all([
      client.execute("SELECT * FROM users LIMIT 1"),
      client.execute("SELECT * FROM categories"),
      client.execute("SELECT * FROM assets"),
      client.execute("SELECT * FROM budgets"),
      client.execute("SELECT * FROM transactions ORDER BY tanggal DESC, created_at DESC"),
      client.execute("SELECT * FROM receipt_scans ORDER BY created_at DESC"),
      client.execute("SELECT * FROM split_bills ORDER BY created_at DESC"),
      client.execute("SELECT * FROM split_bill_participants"),
      client.execute("SELECT * FROM whatsapp_connections"),
      client.execute("SELECT * FROM whatsapp_logs ORDER BY created_at DESC LIMIT 50"),
      client.execute("SELECT * FROM levina_messages ORDER BY created_at ASC"),
    ]);

    let user: User | undefined;
    if (userRes.rows.length > 0) {
      const r = userRes.rows[0];
      user = {
        id: String(r.id),
        nama: String(r.nama),
        email: String(r.email),
        password: r.password ? String(r.password) : undefined,
        nomorWhatsApp: String(r.nomor_whatsapp || ""),
        avatarUrl: r.avatar_url ? String(r.avatar_url) : undefined,
        role: r.role ? String(r.role) : "Pro",
      };
    }

    const categories: Category[] = catRes.rows.map((r) => ({
      id: String(r.id),
      nama: String(r.nama),
      tipe: r.tipe as "pengeluaran" | "pemasukan",
      ikon: String(r.ikon),
      warna: String(r.warna),
    }));

    const catMap = new Map(categories.map((c) => [c.id, c]));

    const assets: Asset[] = assetRes.rows.map((r) => ({
      id: String(r.id),
      nama: String(r.nama),
      jenis: r.jenis as "bank" | "e-wallet" | "tunai",
      saldo: Number(r.saldo),
      nomorRekening: r.nomor_rekening ? String(r.nomor_rekening) : undefined,
      warna: String(r.warna),
      ikon: r.ikon ? String(r.ikon) : undefined,
      updatedAt: String(r.updated_at || r.created_at || new Date().toISOString()),
    }));

    const budgets: (Budget & { kategori: Category })[] = budgetRes.rows.map((r) => {
      const catId = String(r.category_id);
      const cat = catMap.get(catId) || {
        id: catId,
        nama: "Kategori",
        tipe: "pengeluaran" as const,
        ikon: "Tag",
        warna: "#6366f1",
      };
      return {
        id: String(r.id),
        categoryId: catId,
        periodeBulan: String(r.periode_bulan),
        batasJumlah: Number(r.batas_jumlah),
        terpakai: Number(r.terpakai),
        warna: r.warna ? String(r.warna) : cat.warna,
        updatedAt: String(r.updated_at || r.created_at || new Date().toISOString()),
        kategori: cat,
      };
    });

    const transactions: TransactionRecord[] = txRes.rows.map((r) => {
      let labels: string[] = [];
      if (r.label) {
        try {
          const parsed = JSON.parse(String(r.label));
          labels = Array.isArray(parsed) ? parsed : [String(r.label)];
        } catch {
          labels = [String(r.label)];
        }
      }
      return {
        id: String(r.id),
        tipe: r.tipe as "pengeluaran" | "pemasukan",
        jumlah: Number(r.jumlah),
        tanggal: String(r.tanggal),
        categoryId: String(r.category_id),
        assetId: String(r.asset_id),
        catatan: r.catatan ? String(r.catatan) : undefined,
        merchant: r.merchant ? String(r.merchant) : undefined,
        label: labels,
        sumber: r.sumber as any,
        reimbursable: Boolean(r.reimbursable),
        photoUrl: r.photo_url ? String(r.photo_url) : undefined,
        receiptScanId: r.receipt_scan_id ? String(r.receipt_scan_id) : undefined,
        splitBillId: r.split_bill_id ? String(r.split_bill_id) : undefined,
        createdAt: String(r.created_at || new Date().toISOString()),
        updatedAt: String(r.updated_at || new Date().toISOString()),
      };
    });

    const receiptScans: ReceiptScanRecord[] = receiptRes.rows.map((r) => {
      let items = [];
      if (r.items_json) {
        try {
          items = JSON.parse(String(r.items_json));
        } catch {
          items = [];
        }
      }
      return {
        id: String(r.id),
        fotoUrl: r.foto_url ? String(r.foto_url) : undefined,
        namaToko: String(r.nama_toko),
        tanggal: String(r.tanggal),
        waktu: r.waktu ? String(r.waktu) : undefined,
        nomorStruk: r.nomor_struk ? String(r.nomor_struk) : undefined,
        items,
        subtotal: Number(r.subtotal),
        pajak: Number(r.pajak),
        diskon: Number(r.diskon),
        total: Number(r.total),
        kategoriSaranId: r.kategori_saran_id ? String(r.kategori_saran_id) : undefined,
        kategoriSaranNama: r.kategori_saran_nama ? String(r.kategori_saran_nama) : undefined,
        confidence: Number(r.confidence),
        rawText: r.raw_text ? String(r.raw_text) : undefined,
        status: r.status as any,
        transactionId: r.transaction_id ? String(r.transaction_id) : undefined,
        idempotencyKey: r.idempotency_key ? String(r.idempotency_key) : undefined,
        createdAt: String(r.created_at || new Date().toISOString()),
        updatedAt: String(r.updated_at || new Date().toISOString()),
      };
    });

    const splitBills: BagiTagihanRecord[] = sbRes.rows.map((r) => ({
      id: String(r.id),
      judul: String(r.judul),
      totalTagihan: Number(r.total_tagihan),
      tanggal: String(r.tanggal),
      metode: r.metode as any,
      namaToko: r.nama_toko ? String(r.nama_toko) : undefined,
      transactionId: r.transaction_id ? String(r.transaction_id) : undefined,
      status: r.status as any,
      catatan: r.catatan ? String(r.catatan) : undefined,
      createdAt: String(r.created_at || new Date().toISOString()),
      updatedAt: String(r.updated_at || new Date().toISOString()),
    }));

    const splitBillParticipants: PesertaBagiTagihanRecord[] = sbpRes.rows.map((r) => ({
      id: String(r.id),
      bagiTagihanId: String(r.split_bill_id),
      nama: String(r.nama),
      bagian: Number(r.bagian),
      sudahBayar: Boolean(r.sudah_bayar),
      nomorHp: r.nomor_hp ? String(r.nomor_hp) : undefined,
      avatar: r.avatar ? String(r.avatar) : undefined,
      waktuBayar: r.waktu_bayar ? String(r.waktu_bayar) : undefined,
      createdAt: String(r.created_at || new Date().toISOString()),
      updatedAt: String(r.updated_at || new Date().toISOString()),
    }));

    const whatsAppConnections: NomorWhatsAppRecord[] = waRes.rows.map((r) => ({
      id: String(r.id),
      userId: String(r.user_id),
      nomorWhatsApp: String(r.nomor_whatsapp),
      namaProfil: r.nama_profil ? String(r.nama_profil) : undefined,
      status: r.status as any,
      kodeVerifikasi: r.kode_verifikasi ? String(r.kode_verifikasi) : undefined,
      defaultAssetId: r.default_asset_id ? String(r.default_asset_id) : undefined,
      autoCategorize: Boolean(r.auto_categorize),
      verifiedAt: r.verified_at ? String(r.verified_at) : undefined,
      createdAt: String(r.created_at || new Date().toISOString()),
      updatedAt: String(r.updated_at || new Date().toISOString()),
    }));

    const whatsAppLogs: LogPesanWhatsAppRecord[] = waLogsRes.rows.map((r) => ({
      id: String(r.id),
      whatsappId: r.whatsapp_id ? String(r.whatsapp_id) : undefined,
      nomorPengirim: String(r.nomor_pengirim),
      pesanMentah: String(r.pesan_mentah),
      tipeTerdeteksi: r.tipe_terdeteksi as any,
      jumlah: r.jumlah !== null ? Number(r.jumlah) : undefined,
      deskripsi: r.deskripsi ? String(r.deskripsi) : undefined,
      kategoriId: r.kategori_id ? String(r.kategori_id) : undefined,
      statusProses: r.status_proses as any,
      transaksiId: r.transaksi_id ? String(r.transaksi_id) : undefined,
      balasanBot: r.balasan_bot ? String(r.balasan_bot) : undefined,
      createdAt: String(r.created_at || new Date().toISOString()),
    }));

    const levinaMessages: LevinaChatMessageRecord[] = levRes.rows.map((r) => ({
      id: String(r.id),
      userId: String(r.user_id),
      sender: r.sender as any,
      text: String(r.text),
      tipe: r.tipe as any,
      budgetData: r.budget_data ? JSON.parse(String(r.budget_data)) : undefined,
      savingTips: r.saving_tips ? JSON.parse(String(r.saving_tips)) : undefined,
      featureGuide: r.feature_guide ? JSON.parse(String(r.feature_guide)) : undefined,
      createdAt: String(r.created_at || new Date().toISOString()),
    }));

    return {
      user,
      categories,
      assets,
      budgets,
      transactions,
      receiptScans,
      splitBills,
      splitBillParticipants,
      whatsAppConnections,
      whatsAppLogs,
      levinaMessages,
    };
  } catch (err) {
    console.error("Gagal membaca data dari Turso:", err);
    return null;
  }
}

/**
 * Async mutations to persist changes to Turso
 */
export async function persistTransaction(tx: TransactionRecord): Promise<void> {
  const client = getTursoClient();
  if (!client) return;

  try {
    await client.execute({
      sql: `INSERT OR REPLACE INTO transactions (
        id, tipe, jumlah, tanggal, category_id, asset_id, catatan, merchant, label, sumber, reimbursable, photo_url, receipt_scan_id, split_bill_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        tx.id,
        tx.tipe,
        tx.jumlah,
        tx.tanggal,
        tx.categoryId,
        tx.assetId,
        tx.catatan || null,
        tx.merchant || null,
        tx.label ? JSON.stringify(tx.label) : null,
        tx.sumber,
        tx.reimbursable ? 1 : 0,
        tx.photoUrl || null,
        tx.receiptScanId || null,
        tx.splitBillId || null,
        tx.createdAt,
        tx.updatedAt,
      ],
    });
  } catch (err) {
    console.error("Gagal simpan transaksi ke Turso:", err);
  }
}

export async function deleteTransactionFromDb(id: string): Promise<void> {
  const client = getTursoClient();
  if (!client) return;

  try {
    await client.execute({
      sql: "DELETE FROM transactions WHERE id = ?",
      args: [id],
    });
  } catch (err) {
    console.error("Gagal menghapus transaksi dari Turso:", err);
  }
}

export async function persistAsset(asset: Asset): Promise<void> {
  const client = getTursoClient();
  if (!client) return;

  try {
    await client.execute({
      sql: `INSERT OR REPLACE INTO assets (
        id, nama, jenis, saldo, nomor_rekening, warna, ikon, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        asset.id,
        asset.nama,
        asset.jenis,
        asset.saldo,
        asset.nomorRekening || null,
        asset.warna || null,
        asset.ikon || null,
        asset.updatedAt || new Date().toISOString(),
      ],
    });
  } catch (err) {
    console.error("Gagal simpan aset ke Turso:", err);
  }
}

export async function deleteAssetFromDb(id: string): Promise<void> {
  const client = getTursoClient();
  if (!client) return;

  try {
    await client.execute({
      sql: "DELETE FROM assets WHERE id = ?",
      args: [id],
    });
  } catch (err) {
    console.error("Gagal menghapus aset dari Turso:", err);
  }
}

export async function persistBudget(budget: Budget): Promise<void> {
  const client = getTursoClient();
  if (!client) return;

  try {
    await client.execute({
      sql: `INSERT OR REPLACE INTO budgets (
        id, category_id, periode_bulan, batas_jumlah, terpakai, warna, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        budget.id,
        budget.categoryId,
        budget.periodeBulan,
        budget.batasJumlah,
        budget.terpakai,
        budget.warna || null,
        budget.updatedAt || new Date().toISOString(),
      ],
    });
  } catch (err) {
    console.error("Gagal simpan budget ke Turso:", err);
  }
}

export async function deleteBudgetFromDb(id: string): Promise<void> {
  const client = getTursoClient();
  if (!client) return;

  try {
    await client.execute({
      sql: "DELETE FROM budgets WHERE id = ?",
      args: [id],
    });
  } catch (err) {
    console.error("Gagal menghapus budget dari Turso:", err);
  }
}

export async function persistReceiptScan(scan: ReceiptScanRecord): Promise<void> {
  const client = getTursoClient();
  if (!client) return;

  try {
    await client.execute({
      sql: `INSERT OR REPLACE INTO receipt_scans (
        id, foto_url, nama_toko, tanggal, waktu, nomor_struk, subtotal, pajak, diskon, total,
        kategori_saran_id, kategori_saran_nama, confidence, raw_text, status, transaction_id, idempotency_key, items_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        scan.id,
        scan.fotoUrl || null,
        scan.namaToko,
        scan.tanggal,
        scan.waktu || null,
        scan.nomorStruk || null,
        scan.subtotal,
        scan.pajak,
        scan.diskon,
        scan.total,
        scan.kategoriSaranId || null,
        scan.kategoriSaranNama || null,
        scan.confidence,
        scan.rawText || null,
        scan.status,
        scan.transactionId || null,
        scan.idempotencyKey || null,
        JSON.stringify(scan.items || []),
        scan.updatedAt,
      ],
    });
  } catch (err) {
    console.error("Gagal simpan receipt scan ke Turso:", err);
  }
}

export async function persistSplitBill(
  bill: BagiTagihanRecord,
  peserta: PesertaBagiTagihanRecord[]
): Promise<void> {
  const client = getTursoClient();
  if (!client) return;

  try {
    await client.execute({
      sql: `INSERT OR REPLACE INTO split_bills (
        id, judul, total_tagihan, tanggal, metode, nama_toko, transaction_id, status, catatan, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        bill.id,
        bill.judul,
        bill.totalTagihan,
        bill.tanggal,
        bill.metode,
        bill.namaToko || null,
        bill.transactionId || null,
        bill.status,
        bill.catatan || null,
        bill.updatedAt,
      ],
    });

    for (const p of peserta) {
      await client.execute({
        sql: `INSERT OR REPLACE INTO split_bill_participants (
          id, split_bill_id, nama, bagian, sudah_bayar, nomor_hp, avatar, waktu_bayar, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          p.id,
          p.bagiTagihanId,
          p.nama,
          p.bagian,
          p.sudahBayar ? 1 : 0,
          p.nomorHp || null,
          p.avatar || null,
          p.waktuBayar || null,
          p.updatedAt,
        ],
      });
    }
  } catch (err) {
    console.error("Gagal simpan split bill ke Turso:", err);
  }
}

export async function persistPesertaStatus(
  pesertaId: string,
  sudahBayar: boolean,
  waktuBayar?: string,
  bagiTagihanId?: string,
  billStatus?: string
): Promise<void> {
  const client = getTursoClient();
  if (!client) return;

  try {
    await client.execute({
      sql: "UPDATE split_bill_participants SET sudah_bayar = ?, waktu_bayar = ?, updated_at = ? WHERE id = ?",
      args: [sudahBayar ? 1 : 0, waktuBayar || null, new Date().toISOString(), pesertaId],
    });

    if (bagiTagihanId && billStatus) {
      await client.execute({
        sql: "UPDATE split_bills SET status = ?, updated_at = ? WHERE id = ?",
        args: [billStatus, new Date().toISOString(), bagiTagihanId],
      });
    }
  } catch (err) {
    console.error("Gagal update status peserta ke Turso:", err);
  }
}

export async function deleteSplitBillFromDb(id: string): Promise<void> {
  const client = getTursoClient();
  if (!client) return;

  try {
    await client.execute({
      sql: "DELETE FROM split_bill_participants WHERE bagi_tagihan_id = ?",
      args: [id],
    });
    await client.execute({
      sql: "DELETE FROM split_bills WHERE id = ?",
      args: [id],
    });
  } catch (err) {
    console.error("Gagal hapus split bill dari Turso:", err);
  }
}

export async function persistWhatsAppConnection(conn: NomorWhatsAppRecord): Promise<void> {
  const client = getTursoClient();
  if (!client) return;

  try {
    await client.execute({
      sql: `INSERT OR REPLACE INTO whatsapp_connections (
        id, user_id, nomor_whatsapp, nama_profil, status, kode_verifikasi, default_asset_id, auto_categorize, verified_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        conn.id,
        conn.userId,
        conn.nomorWhatsApp,
        conn.namaProfil || null,
        conn.status,
        conn.kodeVerifikasi || null,
        conn.defaultAssetId || null,
        conn.autoCategorize ? 1 : 0,
        conn.verifiedAt || null,
        conn.updatedAt,
      ],
    });
  } catch (err) {
    console.error("Gagal simpan koneksi WA ke Turso:", err);
  }
}

export async function persistWhatsAppLog(log: LogPesanWhatsAppRecord): Promise<void> {
  const client = getTursoClient();
  if (!client) return;

  try {
    await client.execute({
      sql: `INSERT OR REPLACE INTO whatsapp_logs (
        id, whatsapp_id, nomor_pengirim, pesan_mentah, tipe_terdeteksi, jumlah, deskripsi, kategori_id, status_proses, transaksi_id, balasan_bot, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        log.id,
        log.whatsappId || null,
        log.nomorPengirim,
        log.pesanMentah,
        log.tipeTerdeteksi || null,
        log.jumlah !== undefined ? log.jumlah : null,
        log.deskripsi || null,
        log.kategoriId || null,
        log.statusProses,
        log.transaksiId || null,
        log.balasanBot || null,
        log.createdAt,
      ],
    });
  } catch (err) {
    console.error("Gagal simpan log WA ke Turso:", err);
  }
}

export async function persistLevinaMessage(msg: LevinaChatMessageRecord): Promise<void> {
  const client = getTursoClient();
  if (!client) return;

  try {
    await client.execute({
      sql: `INSERT OR REPLACE INTO levina_messages (
        id, user_id, sender, text, tipe, budget_data, saving_tips, feature_guide, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        msg.id,
        msg.userId,
        msg.sender,
        msg.text,
        msg.tipe,
        msg.budgetData ? JSON.stringify(msg.budgetData) : null,
        msg.savingTips ? JSON.stringify(msg.savingTips) : null,
        msg.featureGuide ? JSON.stringify(msg.featureGuide) : null,
        msg.createdAt,
      ],
    });
  } catch (err) {
    console.error("Gagal simpan pesan Levina ke Turso:", err);
  }
}

export async function clearLevinaMessagesFromDb(userId: string): Promise<void> {
  const client = getTursoClient();
  if (!client) return;

  try {
    await client.execute({
      sql: "DELETE FROM levina_messages WHERE user_id = ?",
      args: [userId],
    });
  } catch (err) {
    console.error("Gagal clear pesan Levina di Turso:", err);
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const client = getTursoClient();
  if (!client) return null;

  try {
    const res = await client.execute({
      sql: "SELECT id, nama, email, password, nomor_whatsapp, avatar_url, role FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1",
      args: [email.trim()],
    });

    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: String(r.id),
      nama: String(r.nama),
      email: String(r.email),
      password: r.password ? String(r.password) : undefined,
      nomorWhatsApp: r.nomor_whatsapp ? String(r.nomor_whatsapp) : undefined,
      avatarUrl: r.avatar_url ? String(r.avatar_url) : undefined,
      role: r.role ? String(r.role) : "Pro",
    };
  } catch (err) {
    console.error("Gagal cari user by email di Turso:", err);
    return null;
  }
}

export async function findUserById(id: string): Promise<User | null> {
  const client = getTursoClient();
  if (!client) return null;

  try {
    const res = await client.execute({
      sql: "SELECT id, nama, email, password, nomor_whatsapp, avatar_url, role FROM users WHERE id = ? LIMIT 1",
      args: [id],
    });

    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: String(r.id),
      nama: String(r.nama),
      email: String(r.email),
      password: r.password ? String(r.password) : undefined,
      nomorWhatsApp: r.nomor_whatsapp ? String(r.nomor_whatsapp) : undefined,
      avatarUrl: r.avatar_url ? String(r.avatar_url) : undefined,
      role: r.role ? String(r.role) : "Pro",
    };
  } catch (err) {
    console.error("Gagal cari user by ID di Turso:", err);
    return null;
  }
}

export async function createUserInDb(user: User): Promise<User> {
  const client = getTursoClient();
  if (client) {
    try {
      await client.execute({
        sql: "INSERT INTO users (id, nama, email, password, nomor_whatsapp, avatar_url, role) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: [
          user.id,
          user.nama,
          user.email,
          user.password || "password123",
          user.nomorWhatsApp || null,
          user.avatarUrl || "",
          user.role || "Pro",
        ],
      });
    } catch (err) {
      console.error("Gagal insert user baru ke Turso:", err);
    }
  }
  return user;
}
