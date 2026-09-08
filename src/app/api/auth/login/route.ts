import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverStore, ensureStoreInitialized } from "@/server/db/store";

export async function POST(request: Request) {
  try {
    await ensureStoreInitialized();
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const user = await serverStore.findUserByEmail(trimmedEmail);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Akun dengan email ini tidak ditemukan." },
        { status: 401 }
      );
    }

    // Check password
    const validPassword = user.password || "password123";
    if (password !== validPassword) {
      return NextResponse.json(
        { success: false, error: "Password atau kata sandi yang Anda masukkan salah." },
        { status: 401 }
      );
    }

    serverStore.setCurrentUser(user);

    // Save session in cookie
    const cookieStore = await cookies();
    const sessionData = JSON.stringify({
      id: user.id,
      email: user.email,
      nama: user.nama,
    });

    cookieStore.set("jajanaja_session", Buffer.from(sessionData).toString("base64"), {
      httpOnly: false, // accessible for client auth context
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    const { password: _, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      user: safeUser,
      message: `Selamat datang kembali, ${user.nama}!`,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan pada server saat login." },
      { status: 500 }
    );
  }
}
