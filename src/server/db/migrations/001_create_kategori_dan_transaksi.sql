-- Migration: 001_create_kategori_dan_transaksi.sql
-- Deskripsi: Pembuatan tabel kategori, aset, budget, dan transaksi untuk JajanAja

-- 1. Tabel Kategori (Pos Pengeluaran & Sumber Pemasukan)
CREATE TABLE IF NOT EXISTS kategori (
    id VARCHAR(64) PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    tipe VARCHAR(20) NOT NULL CHECK (tipe IN ('pengeluaran', 'pemasukan')),
    ikon VARCHAR(50) NOT NULL DEFAULT 'Tag',
    warna VARCHAR(20) NOT NULL DEFAULT '#6366f1',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk query kategori berdasarkan tipe
CREATE INDEX IF NOT EXISTS idx_kategori_tipe ON kategori(tipe);

-- 2. Tabel Aset (Dompet / Rekening Sumber & Tujuan)
CREATE TABLE IF NOT EXISTS aset (
    id VARCHAR(64) PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    jenis VARCHAR(20) NOT NULL CHECK (jenis IN ('bank', 'e-wallet', 'tunai')),
    saldo BIGINT NOT NULL DEFAULT 0,
    nomor_rekening VARCHAR(50),
    warna VARCHAR(50),
    ikon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Budget (Alokasi Pagu Pos Kategori Bulanan)
CREATE TABLE IF NOT EXISTS budget (
    id VARCHAR(64) PRIMARY KEY,
    category_id VARCHAR(64) NOT NULL REFERENCES kategori(id) ON DELETE CASCADE,
    periode_bulan VARCHAR(7) NOT NULL, -- Format YYYY-MM
    batas_jumlah BIGINT NOT NULL CHECK (batas_jumlah >= 0),
    terpakai BIGINT NOT NULL DEFAULT 0 CHECK (terpakai >= 0),
    warna VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_budget_category_periode UNIQUE (category_id, periode_bulan)
);

-- 4. Tabel Transaksi (Pemasukan NabungAja & Pengeluaran JajanAja)
CREATE TABLE IF NOT EXISTS transaksi (
    id VARCHAR(64) PRIMARY KEY,
    tipe VARCHAR(20) NOT NULL CHECK (tipe IN ('pengeluaran', 'pemasukan')),
    jumlah BIGINT NOT NULL CHECK (jumlah >= 500),
    tanggal TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    category_id VARCHAR(64) NOT NULL REFERENCES kategori(id) ON DELETE RESTRICT,
    asset_id VARCHAR(64) NOT NULL REFERENCES aset(id) ON DELETE RESTRICT,
    catatan VARCHAR(255),
    merchant VARCHAR(100),
    label TEXT, -- Komma-separated tags e.g. "Kopi, Santai"
    sumber VARCHAR(30) NOT NULL DEFAULT 'manual' CHECK (sumber IN ('manual', 'pindai-struk', 'whatsapp')),
    reimbursable BOOLEAN NOT NULL DEFAULT FALSE,
    photo_url TEXT,
    receipt_scan_id VARCHAR(64),
    split_bill_id VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indeks performa untuk query analitik transaksi
CREATE INDEX IF NOT EXISTS idx_transaksi_tanggal ON transaksi(tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_transaksi_tipe ON transaksi(tipe);
CREATE INDEX IF NOT EXISTS idx_transaksi_category_id ON transaksi(category_id);
CREATE INDEX IF NOT EXISTS idx_transaksi_asset_id ON transaksi(asset_id);
CREATE INDEX IF NOT EXISTS idx_transaksi_sumber ON transaksi(sumber);
CREATE INDEX IF NOT EXISTS idx_transaksi_cat_tgl ON transaksi(category_id, tanggal DESC);
