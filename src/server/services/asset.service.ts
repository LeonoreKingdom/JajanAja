import { serverStore } from "../db/store";
import { Asset, AssetType } from "@/types/finance";
import { CreateAssetInput, UpdateAssetInput } from "../schemas/asset.schema";

export interface AssetDistributionItem {
  jenis: AssetType;
  label: string;
  total: number;
  count: number;
  persentase: number;
}

export interface TotalWealthSummary {
  totalKekayaan: number;
  totalAkun: number;
  distribusi: AssetDistributionItem[];
  rekap: {
    bank: { total: number; count: number };
    eWallet: { total: number; count: number };
    tunai: { total: number; count: number };
  };
}

export class AssetService {
  /**
   * Mengambil daftar aset dengan perhitungan total kekayaan dan distribusi per kategori
   */
  getAssetsWithWealthSummary(params?: {
    jenis?: string;
    search?: string;
  }): {
    summary: TotalWealthSummary;
    assets: Asset[];
  } {
    const allAssets = serverStore.getAssets();

    // 1. Hitung total kekayaan global
    const totalKekayaan = allAssets.reduce((sum, a) => sum + a.saldo, 0);
    const totalAkun = allAssets.length;

    // 2. Rekap per jenis
    const bankAssets = allAssets.filter((a) => a.jenis === "bank");
    const eWalletAssets = allAssets.filter((a) => a.jenis === "e-wallet");
    const tunaiAssets = allAssets.filter((a) => a.jenis === "tunai");

    const totalBank = bankAssets.reduce((sum, a) => sum + a.saldo, 0);
    const totalEWallet = eWalletAssets.reduce((sum, a) => sum + a.saldo, 0);
    const totalTunai = tunaiAssets.reduce((sum, a) => sum + a.saldo, 0);

    const calcPct = (amt: number) =>
      totalKekayaan > 0 ? Math.round((amt / totalKekayaan) * 100) : 0;

    const distribusi: AssetDistributionItem[] = [
      {
        jenis: "bank",
        label: "Rekening Bank",
        total: totalBank,
        count: bankAssets.length,
        persentase: calcPct(totalBank),
      },
      {
        jenis: "e-wallet",
        label: "Dompet Digital",
        total: totalEWallet,
        count: eWalletAssets.length,
        persentase: calcPct(totalEWallet),
      },
      {
        jenis: "tunai",
        label: "Uang Fisik",
        total: totalTunai,
        count: tunaiAssets.length,
        persentase: calcPct(totalTunai),
      },
    ];

    // 3. Filter berdasarkan query params jika ada
    let filtered = [...allAssets];
    if (params?.jenis && params.jenis !== "semua") {
      filtered = filtered.filter((a) => a.jenis === params.jenis);
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.nama.toLowerCase().includes(q) ||
          (a.nomorRekening && a.nomorRekening.toLowerCase().includes(q))
      );
    }

    return {
      summary: {
        totalKekayaan,
        totalAkun,
        distribusi,
        rekap: {
          bank: { total: totalBank, count: bankAssets.length },
          eWallet: { total: totalEWallet, count: eWalletAssets.length },
          tunai: { total: totalTunai, count: tunaiAssets.length },
        },
      },
      assets: filtered,
    };
  }

  /**
   * Tambah akun aset baru
   */
  createAsset(data: CreateAssetInput): Asset {
    return serverStore.createAsset(data);
  }

  /**
   * Ubah detail akun aset
   */
  updateAsset(id: string, data: UpdateAssetInput): Asset | null {
    return serverStore.updateAsset(id, data);
  }

  /**
   * Sesuaikan saldo aset
   */
  updateBalance(id: string, newBalance: number): Asset | null {
    return serverStore.updateAssetBalance(id, newBalance);
  }

  /**
   * Hapus akun aset
   */
  deleteAsset(id: string): boolean {
    return serverStore.deleteAsset(id);
  }
}

export const assetService = new AssetService();
