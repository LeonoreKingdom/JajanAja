import { serverStore } from "../db/store";
import {
  NomorWhatsAppRecord,
  ConnectWhatsAppInput,
  validateConnectWhatsApp,
  normalizeWhatsAppNumber,
} from "../schemas/whatsapp.schema";

/**
 * Mengambil status koneksi nomor WhatsApp akun pengguna
 */
export function getWhatsAppAccount(userId: string = "usr-1"): NomorWhatsAppRecord | undefined {
  return serverStore.getWhatsAppConnection(userId);
}

/**
 * Menghubungkan nomor WhatsApp ke akun pengguna
 */
export function connectWhatsAppAccount(
  input: unknown,
  userId: string = "usr-1"
): {
  success: boolean;
  message?: string;
  data?: NomorWhatsAppRecord;
  errors?: string[];
} {
  const validation = validateConnectWhatsApp(input);
  if (!validation.valid || !validation.data) {
    return {
      success: false,
      message: "Validasi data nomor WhatsApp gagal.",
      errors: validation.errors,
    };
  }

  const payload = validation.data;

  // Cek apakah nomor sudah dipakai akun lain
  const existingWithNumber = serverStore.getWhatsAppByNumber(payload.nomorWhatsApp);
  if (existingWithNumber && existingWithNumber.userId !== userId) {
    return {
      success: false,
      message: `Nomor WhatsApp ${payload.nomorWhatsApp} sudah terhubung ke akun lain.`,
    };
  }

  // Jika defaultAssetId disediakan, cek keberadaan aset
  if (payload.defaultAssetId) {
    const asset = serverStore.getAssetById(payload.defaultAssetId);
    if (!asset) {
      return {
        success: false,
        message: `Akun aset dengan ID '${payload.defaultAssetId}' tidak ditemukan.`,
      };
    }
  }

  const record = serverStore.connectWhatsApp(payload, userId);

  return {
    success: true,
    message: `Nomor WhatsApp ${record.nomorWhatsApp} berhasil dihubungkan ke akun!`,
    data: record,
  };
}

/**
 * Memutuskan koneksi nomor WhatsApp dari akun
 */
export function disconnectWhatsAppAccount(userId: string = "usr-1"): {
  success: boolean;
  message: string;
} {
  const ok = serverStore.disconnectWhatsApp(userId);
  if (!ok) {
    return {
      success: false,
      message: "Akun WhatsApp tidak ditemukan atau sudah terputus.",
    };
  }

  return {
    success: true,
    message: "Koneksi WhatsApp berhasil diputuskan.",
  };
}

export interface ExtractedWebhookMessage {
  from: string;
  text: string;
  messageId?: string;
  timestamp?: string;
}

/**
 * Ekstraksi pesan dari payload webhook WhatsApp (mendukung format Meta Cloud API & simplified JSON)
 */
export function extractWebhookMessage(body: any): ExtractedWebhookMessage | null {
  if (!body || typeof body !== "object") return null;

  // Format 1: Simplified payload { from, message } / { sender, text }
  if (typeof body.from === "string" && typeof body.message === "string") {
    return {
      from: normalizeWhatsAppNumber(body.from),
      text: body.message.trim(),
      messageId: typeof body.messageId === "string" ? body.messageId : undefined,
      timestamp: body.timestamp,
    };
  }
  if (typeof body.sender === "string" && typeof body.text === "string") {
    return {
      from: normalizeWhatsAppNumber(body.sender),
      text: body.text.trim(),
      messageId: typeof body.messageId === "string" ? body.messageId : undefined,
      timestamp: body.timestamp,
    };
  }

  // Format 2: Meta WhatsApp Cloud API standard payload
  try {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (message && message.from) {
      const from = normalizeWhatsAppNumber(message.from);
      let text = "";

      if (message.type === "text" && message.text?.body) {
        text = message.text.body;
      } else if (message.text?.body) {
        text = message.text.body;
      } else if (message.interactive?.button_reply?.title) {
        text = message.interactive.button_reply.title;
      }

      if (text) {
        return {
          from,
          text: text.trim(),
          messageId: message.id,
          timestamp: message.timestamp,
        };
      }
    }
  } catch (err) {
    console.error("Gagal parse payload Meta WhatsApp:", err);
  }

  return null;
}

/**
 * Memproses event webhook pesan masuk dari WhatsApp
 */
export async function handleIncomingWhatsAppWebhook(body: any): Promise<{
  success: boolean;
  message?: string;
  extracted?: ExtractedWebhookMessage;
  registeredUser?: NomorWhatsAppRecord;
  replyText?: string;
}> {
  const extracted = extractWebhookMessage(body);
  if (!extracted || !extracted.text) {
    return {
      success: false,
      message: "Tidak ada pesan teks valid yang dapat diekstrak dari webhook payload.",
    };
  }

  // Cari apakah nomor sudah terhubung ke akun JajanAja
  const userConn = serverStore.getWhatsAppByNumber(extracted.from);

  let replyText = "";
  if (!userConn) {
    replyText = `Halo! Nomor WhatsApp Anda (${extracted.from}) belum terhubung ke akun JajanAja.\n\nSilakan buka menu 'Catat via WhatsApp' di aplikasi JajanAja untuk menghubungkan nomor ini agar dapat mencatat pengeluaran secara otomatis. ✨`;

    // Log pesan dari nomor yang belum terdaftar
    serverStore.addWhatsAppMessageLog({
      nomorPengirim: extracted.from,
      pesanMentah: extracted.text,
      statusProses: "diabaikan",
      balasanBot: replyText,
    });

    return {
      success: true,
      extracted,
      registeredUser: undefined,
      replyText,
    };
  }

  // Nomor terdaftar: Siapkan balasan awal
  replyText = `Halo kak ${userConn.namaProfil || "Teman Jajan"}! Pesan "${extracted.text}" diterima oleh sistem bot JajanAja.`;

  serverStore.addWhatsAppMessageLog({
    whatsappId: userConn.id,
    nomorPengirim: extracted.from,
    pesanMentah: extracted.text,
    statusProses: "berhasil",
    balasanBot: replyText,
  });

  return {
    success: true,
    extracted,
    registeredUser: userConn,
    replyText,
  };
}

