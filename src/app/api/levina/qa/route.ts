import { NextRequest, NextResponse } from "next/server";
import { LevinaQAService } from "@/server/services/levina-qa.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = body?.prompt || body?.pertanyaan || "";

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "Prompt / pertanyaan wajib diisi" },
        { status: 400 }
      );
    }

    const answer = LevinaQAService.answerQuestion(prompt);

    return NextResponse.json({
      success: true,
      data: answer,
    });
  } catch (error) {
    console.error("Error pada /api/levina/qa:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memproses pertanyaan Q&A" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const prompt = searchParams.get("prompt") || "cek sisa budget";

    const answer = LevinaQAService.answerQuestion(prompt);

    return NextResponse.json({
      success: true,
      data: answer,
    });
  } catch (error) {
    console.error("Error pada GET /api/levina/qa:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data Q&A" },
      { status: 500 }
    );
  }
}
