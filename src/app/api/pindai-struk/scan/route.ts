import { NextRequest, NextResponse } from "next/server";
import { scanReceiptImage } from "@/server/services/receipt.service";

/**
 * POST /api/pindai-struk/scan
 * Memproses gambar struk belanja (kamera / unggahan) melalui OCR dan ekstraksi data
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let image: string | undefined;
    let sampleTitle: string | undefined;
    let filename: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      sampleTitle = (formData.get("sampleTitle") as string) || undefined;

      if (file && typeof file === "object" && "arrayBuffer" in file) {
        const buffer = await (file as Blob).arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const type = (file as Blob).type || "image/jpeg";
        image = `data:${type};base64,${base64}`;
        filename = (file as File).name;
      }
    } else {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return NextResponse.json(
          {
            success: false,
            message: "Request body harus berupa JSON atau multipart form data yang valid.",
          },
          { status: 400 }
        );
      }

      const parsed = body as Record<string, unknown>;
      image = typeof parsed.image === "string" ? parsed.image : undefined;
      sampleTitle = typeof parsed.sampleTitle === "string" ? parsed.sampleTitle : undefined;
      filename = typeof parsed.filename === "string" ? parsed.filename : undefined;
    }

    const { scanResult, record } = await scanReceiptImage({
      image,
      sampleTitle,
      filename,
    });

    return NextResponse.json({
      success: true,
      message: "Pemindaian struk berhasil diekstraksi.",
      data: {
        scanId: record.id,
        result: scanResult,
      },
    });
  } catch (error) {
    console.error("POST /api/pindai-struk/scan error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal saat memindai struk belanja.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
