-- Migration: 007_create_riwayat_percakapan_levina.sql
-- Deskripsi: Tabel sesi dan riwayat percakapan chatbot teman finansial LEVINA

CREATE TABLE IF NOT EXISTS sesi_chat_levina (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    judul VARCHAR(255) NOT NULL DEFAULT 'Percakapan Finansial',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS riwayat_percakapan_levina (
    id VARCHAR(64) PRIMARY KEY,
    sesi_id VARCHAR(64) REFERENCES sesi_chat_levina(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL,
    sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'levina')),
    text TEXT NOT NULL,
    tipe VARCHAR(50) NOT NULL DEFAULT 'text' CHECK (tipe IN ('text', 'budget_summary', 'saving_tip', 'feature_guide')),
    budget_data JSONB,
    saving_tips JSONB,
    feature_guide JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indeks pencarian riwayat obrolan
CREATE INDEX IF NOT EXISTS idx_levina_user ON riwayat_percakapan_levina(user_id);
CREATE INDEX IF NOT EXISTS idx_levina_sesi ON riwayat_percakapan_levina(sesi_id);
CREATE INDEX IF NOT EXISTS idx_levina_created ON riwayat_percakapan_levina(created_at);
