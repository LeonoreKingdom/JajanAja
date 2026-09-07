import { NextRequest, NextResponse } from "next/server";
import { detectLevinaIntent } from "@/server/services/levina-intent.service";

/**
 * POST /api/levina/intent
 * Endpoint untuk mendeteksi intent dan entitas pertanyaan pengguna pada LEVINA
 */
export async function POST(request: NextRequest) {
  try {
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

    const raw = body as Record<string, unknown>;
    const prompt =
      typeof raw.prompt === "string"
        ? raw.prompt
        : typeof raw.text === "string"
        ? raw.text
        : typeof raw.query === "string"
        ? raw.query
        : "";

    if (!prompt.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Field 'prompt' atau 'text' wajib disertakan.",
        },
        { status: 400 }
      );
    }

    const result = detectLevinaIntent(prompt);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/levina/intent error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal saat mendeteksi intent.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/levina/intent?q=...
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || searchParams.get("prompt") || "";

    if (!q.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Query parameter '?q=...' wajib disertakan.",
        },
        { status: 400 }
      );
    }

    const result = detectLevinaIntent(q);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/levina/intent error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal saat mendeteksi intent.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
