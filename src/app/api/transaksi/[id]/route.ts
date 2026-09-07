import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/server/db/store";
import { balanceBudgetService } from "@/server/services/balance-budget.service";

/**
 * GET /api/transaksi/[id]
 * Mengambil detail transaksi spesifik beserta kategori dan aset
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const transactions = serverStore.getTransactions();
    const target = transactions.find((t) => t.id === id);

    if (!target) {
      return NextResponse.json(
        {
          success: false,
          message: `Transaksi dengan ID '${id}' tidak ditemukan.`,
        },
        { status: 404 }
      );
    }

    const categories = serverStore.getCategories();
    const assets = serverStore.getAssets();

    const category = categories.find((c) => c.id === target.categoryId);
    const asset = assets.find((a) => a.id === target.assetId);

    return NextResponse.json(
      {
        success: true,
        data: {
          ...target,
          kategori: category,
          aset: asset,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil detail transaksi.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/transaksi/[id]
 * Menghapus transaksi dan otomatis melakukan rollback terhadap saldo aset dan pagu budget
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const transactions = serverStore.getTransactions();
    const target = transactions.find((t) => t.id === id);

    if (!target) {
      return NextResponse.json(
        {
          success: false,
          message: `Transaksi dengan ID '${id}' tidak ditemukan.`,
        },
        { status: 404 }
      );
    }

    // 1. Rollback saldo aset dan budget
    const { asset: updatedAsset, budget: updatedBudget } =
      balanceBudgetService.rollbackTransaction(target);

    // 2. Hapus dari daftar transaksi
    serverStore.deleteTransaction(id);

    return NextResponse.json(
      {
        success: true,
        message: `Transaksi '${target.catatan || id}' berhasil dihapus dan saldo/budget telah di-rollback.`,
        data: {
          deletedId: id,
          updatedAsset,
          updatedBudget,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE /api/transaksi/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus transaksi dan rollback saldo/budget.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
