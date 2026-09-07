-- Migration: 002_create_budget_table.sql
-- Deskripsi: Tabel alokasi budget dan pagu pos pengeluaran bulanan (Budgetin)

CREATE TABLE IF NOT EXISTS budget (
    id VARCHAR(64) PRIMARY KEY,
    category_id VARCHAR(64) NOT NULL REFERENCES kategori(id) ON DELETE CASCADE,
    periode_bulan VARCHAR(7) NOT NULL, -- Format YYYY-MM contoh: 2026-09
    batas_jumlah BIGINT NOT NULL CHECK (batas_jumlah >= 0),
    terpakai BIGINT NOT NULL DEFAULT 0 CHECK (terpakai >= 0),
    warna VARCHAR(30) DEFAULT '#3b82f6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_budget_category_periode UNIQUE (category_id, periode_bulan)
);

-- Index untuk filter cepat per periode bulan aktif
CREATE INDEX IF NOT EXISTS idx_budget_periode ON budget(periode_bulan);
CREATE INDEX IF NOT EXISTS idx_budget_category ON budget(category_id);
