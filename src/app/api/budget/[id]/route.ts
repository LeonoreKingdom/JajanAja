import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/server/db/store";
import { validateUpdateBudget } from "@/server/schemas/budget.schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/budget/[id]
 * Mengambil detail satu alokasi budget berdasarkan ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const budget = serverStore.getBudgetById(id);

    if (!budget) {
      return NextResponse.json(
        {
          success: false,
          message: `Budget dengan ID '${id}' tidak ditemukan.`,
        },
        { status: 404 }
      );
    }

    const sisa = Math.max(0, budget.batasJumlah - budget.terpakai);
    const persentase =
      budget.batasJumlah > 0
        ? Math.round((budget.terpakai / budget.batasJumlah) * 100)
        : 0;

    let status: "aman" | "waspada" | "kritis" | "habis" = "aman";
    if (budget.terpakai >= budget.batasJumlah) {
      status = "habis";
    } else if (persentase >= 90) {
      status = "kritis";
    } else if (persentase >= 75) {
      status = "waspada";
    }

    return NextResponse.json({
      success: true,
      data: {
        ...budget,
        sisa,
        persentase,
        status,
      },
    });
  } catch (error) {
    console.error("GET /api/budget/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal saat mengambil data budget.",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/budget/[id]
 * Memperbarui batas jumlah atau warna alokasi budget
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = serverStore.getBudgetById(id);
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: `Budget dengan ID '${id}' tidak ditemukan.`,
        },
        { status: 404 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Request body harus berupa JSON yang valid.",
        },
        { status: 400 }
      );
    }

    const validation = validateUpdateBudget(body);
    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi data pembaruan budget gagal.",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const updated = serverStore.updateBudget(id, validation.data);

    return NextResponse.json({
      success: true,
      message: "Berhasil memperbarui alokasi budget.",
      data: updated,
    });
  } catch (error) {
    console.error("PATCH /api/budget/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal saat memperbarui budget.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/budget/[id]
 * Menghapus alokasi budget berdasarkan ID
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = serverStore.getBudgetById(id);
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: `Budget dengan ID '${id}' tidak ditemukan.`,
        },
        { status: 404 }
      );
    }

    const deleted = serverStore.deleteBudget(id);
    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          message: "Gagal menghapus budget.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil menghapus alokasi budget untuk kategori '${existing.kategori.nama}'.`,
      data: { id },
    });
  } catch (error) {
    console.error("DELETE /api/budget/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal saat menghapus budget.",
      },
      { status: 500 }
    );
  }
}
