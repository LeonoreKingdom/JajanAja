-- Migration: 005_create_bagi_tagihan_dan_peserta.sql
-- Deskripsi: Tabel bagi_tagihan dan peserta untuk split bill bersama teman

CREATE TABLE IF NOT EXISTS bagi_tagihan (
    id VARCHAR(64) PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    total_tagihan BIGINT NOT NULL DEFAULT 0 CHECK (total_tagihan >= 0),
    tanggal DATE NOT NULL,
    metode VARCHAR(50) NOT NULL DEFAULT 'sama_rata' CHECK (metode IN ('sama_rata', 'nominal_bebas')),
    nama_toko VARCHAR(150),
    transaction_id VARCHAR(64) REFERENCES transaksi(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'selesai', 'dibatalkan')),
    catatan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS peserta_bagi_tagihan (
    id VARCHAR(64) PRIMARY KEY,
    bagi_tagihan_id VARCHAR(64) NOT NULL REFERENCES bagi_tagihan(id) ON DELETE CASCADE,
    nama VARCHAR(150) NOT NULL,
    bagian BIGINT NOT NULL DEFAULT 0 CHECK (bagian >= 0),
    sudah_bayar BOOLEAN NOT NULL DEFAULT FALSE,
    nomor_hp VARCHAR(50),
    avatar TEXT,
    waktu_bayar TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indeks untuk efisiensi pencarian dan relasi
CREATE INDEX IF NOT EXISTS idx_bagi_tagihan_tanggal ON bagi_tagihan(tanggal);
CREATE INDEX IF NOT EXISTS idx_bagi_tagihan_status ON bagi_tagihan(status);
CREATE INDEX IF NOT EXISTS idx_peserta_bagi_tagihan_id ON peserta_bagi_tagihan(bagi_tagihan_id);
CREATE INDEX IF NOT EXISTS idx_peserta_sudah_bayar ON peserta_bagi_tagihan(sudah_bayar);
