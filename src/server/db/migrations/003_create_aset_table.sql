-- Migration: 003_create_aset_table.sql
-- Deskripsi: Tabel akun aset (rekening bank, e-wallet, uang tunai) untuk Asetku

CREATE TABLE IF NOT EXISTS aset (
    id VARCHAR(64) PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    jenis VARCHAR(20) NOT NULL CHECK (jenis IN ('bank', 'e-wallet', 'tunai')),
    saldo BIGINT NOT NULL DEFAULT 0,
    nomor_rekening VARCHAR(50),
    warna VARCHAR(50) DEFAULT 'from-blue-600 to-indigo-700',
    ikon VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indeks jenis aset untuk filter per kategori dompet
CREATE INDEX IF NOT EXISTS idx_aset_jenis ON aset(jenis);
CREATE INDEX IF NOT EXISTS idx_aset_is_active ON aset(is_active);
