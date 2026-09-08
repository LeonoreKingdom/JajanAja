import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("jajanaja_session");

    return NextResponse.json({
      success: true,
      message: "Berhasil keluar dari akun JajanAja.",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal logout." },
      { status: 500 }
    );
  }
}
