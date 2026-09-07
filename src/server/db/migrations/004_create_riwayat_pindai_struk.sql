-- Migration: 004_create_riwayat_pindai_struk.sql
-- Deskripsi: Tabel riwayat pemindaian struk belanja dan daftar item hasil OCR / parser

CREATE TABLE IF NOT EXISTS riwayat_pindai_struk (
    id VARCHAR(64) PRIMARY KEY,
    foto_url TEXT,
    nama_toko VARCHAR(150) NOT NULL,
    tanggal DATE NOT NULL,
    waktu VARCHAR(20),
    nomor_struk VARCHAR(100),
    subtotal BIGINT NOT NULL DEFAULT 0,
    pajak BIGINT NOT NULL DEFAULT 0,
    diskon BIGINT NOT NULL DEFAULT 0,
    total BIGINT NOT NULL DEFAULT 0,
    kategori_saran_id VARCHAR(64) REFERENCES kategori(id) ON DELETE SET NULL,
    kategori_saran_nama VARCHAR(100),
    confidence INT NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
    raw_text TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'verified', 'saved', 'cancelled')),
    transaction_id VARCHAR(64) REFERENCES transaksi(id) ON DELETE SET NULL,
    idempotency_key VARCHAR(128) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS riwayat_pindai_struk_item (
    id VARCHAR(64) PRIMARY KEY,
    struk_id VARCHAR(64) NOT NULL REFERENCES riwayat_pindai_struk(id) ON DELETE CASCADE,
    nama VARCHAR(255) NOT NULL,
    qty INT NOT NULL DEFAULT 1 CHECK (qty > 0),
    harga BIGINT NOT NULL DEFAULT 0 CHECK (harga >= 0),
    subtotal BIGINT NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indeks untuk pencarian dan filter
CREATE INDEX IF NOT EXISTS idx_struk_tanggal ON riwayat_pindai_struk(tanggal);
CREATE INDEX IF NOT EXISTS idx_struk_status ON riwayat_pindai_struk(status);
CREATE INDEX IF NOT EXISTS idx_struk_idempotency ON riwayat_pindai_struk(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_struk_item_struk_id ON riwayat_pindai_struk_item(struk_id);
