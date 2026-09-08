import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverStore, ensureStoreInitialized } from "@/server/db/store";

export async function GET() {
  try {
    await ensureStoreInitialized();
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("jajanaja_session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({
        success: false,
        user: null,
      });
    }

    let session: { id?: string; email?: string } = {};
    try {
      const decoded = Buffer.from(sessionCookie.value, "base64").toString("utf-8");
      session = JSON.parse(decoded);
    } catch {
      return NextResponse.json({
        success: false,
        user: null,
      });
    }

    if (!session.id && !session.email) {
      return NextResponse.json({
        success: false,
        user: null,
      });
    }

    let user = session.id
      ? await serverStore.findUserById(session.id)
      : null;

    if (!user && session.email) {
      user = await serverStore.findUserByEmail(session.email);
    }

    if (!user) {
      user = serverStore.getUser();
    }

    const { password: _, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({
      success: false,
      user: null,
    });
  }
}
