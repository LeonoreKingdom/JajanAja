-- Migration: 006_create_nomor_whatsapp_pengguna.sql
-- Deskripsi: Tabel nomor WhatsApp pengguna dan log pesan transaksi via WhatsApp

CREATE TABLE IF NOT EXISTS nomor_whatsapp_pengguna (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    nomor_whatsapp VARCHAR(50) NOT NULL UNIQUE,
    nama_profil VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'terhubung' CHECK (status IN ('terhubung', 'menunggu_verifikasi', 'terputus')),
    kode_verifikasi VARCHAR(10),
    default_asset_id VARCHAR(64) REFERENCES aset(id) ON DELETE SET NULL,
    auto_categorize BOOLEAN NOT NULL DEFAULT TRUE,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS log_pesan_whatsapp (
    id VARCHAR(64) PRIMARY KEY,
    whatsapp_id VARCHAR(64) REFERENCES nomor_whatsapp_pengguna(id) ON DELETE CASCADE,
    nomor_pengirim VARCHAR(50) NOT NULL,
    pesan_mentah TEXT NOT NULL,
    tipe_terdeteksi VARCHAR(20) CHECK (tipe_terdeteksi IN ('pengeluaran', 'pemasukan', 'tidak_dikenal', 'bantuan')),
    jumlah BIGINT,
    deskripsi VARCHAR(255),
    kategori_id VARCHAR(64) REFERENCES kategori(id) ON DELETE SET NULL,
    status_proses VARCHAR(20) NOT NULL DEFAULT 'berhasil' CHECK (status_proses IN ('berhasil', 'gagal', 'diabaikan')),
    transaksi_id VARCHAR(64) REFERENCES transaksi(id) ON DELETE SET NULL,
    balasan_bot TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indeks
CREATE INDEX IF NOT EXISTS idx_whatsapp_nomor ON nomor_whatsapp_pengguna(nomor_whatsapp);
CREATE INDEX IF NOT EXISTS idx_whatsapp_status ON nomor_whatsapp_pengguna(status);
CREATE INDEX IF NOT EXISTS idx_log_pesan_nomor ON log_pesan_whatsapp(nomor_pengirim);
CREATE INDEX IF NOT EXISTS idx_log_pesan_status ON log_pesan_whatsapp(status_proses);
