import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverStore, ensureStoreInitialized } from "@/server/db/store";

export async function POST(request: Request) {
  try {
    await ensureStoreInitialized();
    const body = await request.json();
    const { nama, email, password } = body;

    if (!nama || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Nama, email, dan password wajib diisi." },
        { status: 400 }
      );
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const existing = await serverStore.findUserByEmail(trimmedEmail);

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Email ini sudah terdaftar. Silakan login." },
        { status: 409 }
      );
    }

    const newUser = await serverStore.registerUser({
      nama: String(nama).trim(),
      email: trimmedEmail,
      password: String(password),
    });

    const cookieStore = await cookies();
    const sessionData = JSON.stringify({
      id: newUser.id,
      email: newUser.email,
      nama: newUser.nama,
    });

    cookieStore.set("jajanaja_session", Buffer.from(sessionData).toString("base64"), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    const { password: _, ...safeUser } = newUser;

    return NextResponse.json({
      success: true,
      user: safeUser,
      message: `Pendaftaran akun ${newUser.nama} berhasil!`,
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan saat mendaftar akun." },
      { status: 500 }
    );
  }
}
