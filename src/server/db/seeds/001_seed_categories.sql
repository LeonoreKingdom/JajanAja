-- Seed: 001_seed_categories.sql
-- Kategori Pengeluaran (JajanAja)
INSERT INTO kategori (id, nama, tipe, ikon, warna, is_default)
VALUES
    ('cat-1', 'Makan & Minum', 'pengeluaran', 'Utensils', '#f97316', TRUE),
    ('cat-2', 'Kopi & Jajan', 'pengeluaran', 'Coffee', '#8b5cf6', TRUE),
    ('cat-3', 'Transportasi', 'pengeluaran', 'Car', '#3b82f6', TRUE),
    ('cat-4', 'Belanja Bulanan', 'pengeluaran', 'ShoppingBag', '#ec4899', TRUE),
    ('cat-5', 'Tagihan & Pulsa', 'pengeluaran', 'Zap', '#eab308', TRUE),
    ('cat-6', 'Hiburan & Hobi', 'pengeluaran', 'Gamepad2', '#06b6d4', TRUE),
    ('cat-13', 'Kesehatan & Medis', 'pengeluaran', 'HeartPulse', '#ef4444', TRUE),
    ('cat-14', 'Belanja Online', 'pengeluaran', 'Package', '#a855f7', TRUE),
    ('cat-15', 'Pendidikan & Buku', 'pengeluaran', 'BookOpen', '#3b82f6', TRUE),
    ('cat-16', 'Sedekah & Hadiah', 'pengeluaran', 'HeartHandshake', '#10b981', TRUE)
ON CONFLICT (id) DO UPDATE 
SET nama = EXCLUDED.nama, ikon = EXCLUDED.ikon, warna = EXCLUDED.warna;

-- Kategori Pemasukan (NabungAja)
INSERT INTO kategori (id, nama, tipe, ikon, warna, is_default)
VALUES
    ('cat-7', 'Gaji Utama', 'pemasukan', 'Briefcase', '#10b981', TRUE),
    ('cat-8', 'Freelance & Side Project', 'pemasukan', 'Laptop', '#14b8a6', TRUE),
    ('cat-9', 'Investasi & Dividen', 'pemasukan', 'TrendingUp', '#6366f1', TRUE),
    ('cat-10', 'Bonus & THR', 'pemasukan', 'Award', '#f59e0b', TRUE),
    ('cat-11', 'Hadiah & Hibah', 'pemasukan', 'Gift', '#ec4899', TRUE),
    ('cat-12', 'Cashback & Reward', 'pemasukan', 'Coins', '#06b6d4', TRUE),
    ('cat-17', 'Penjualan Barang Bekas', 'pemasukan', 'Store', '#84cc16', TRUE),
    ('cat-18', 'Pemasukan Lainnya', 'pemasukan', 'Wallet', '#64748b', TRUE)
ON CONFLICT (id) DO UPDATE 
SET nama = EXCLUDED.nama, ikon = EXCLUDED.ikon, warna = EXCLUDED.warna;
