import {
  LevinaBudgetItem,
  LevinaSavingTip,
  LevinaFeatureGuide,
} from "@/types/levina";

export interface LevinaChatSessionRecord {
  id: string;
  userId: string;
  judul: string;
  createdAt: string;
  updatedAt: string;
}

export interface LevinaChatMessageRecord {
  id: string;
  sesiId?: string;
  userId: string;
  sender: "user" | "levina";
  text: string;
  tipe: "text" | "budget_summary" | "saving_tip" | "feature_guide";
  budgetData?: LevinaBudgetItem[];
  savingTips?: LevinaSavingTip[];
  featureGuide?: LevinaFeatureGuide;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface SendLevinaMessageInput {
  text: string;
  sesiId?: string;
  userId?: string;
}

/**
 * Validasi payload pengiriman pesan chat ke LEVINA
 */
export function validateSendLevinaMessage(input: unknown): {
  valid: boolean;
  errors: string[];
  data?: SendLevinaMessageInput;
} {
  const errors: string[] = [];

  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Data pesan chat tidak valid."] };
  }

  const raw = input as Record<string, unknown>;
  const text =
    typeof raw.text === "string"
      ? raw.text.trim()
      : typeof raw.message === "string"
      ? raw.message.trim()
      : typeof raw.prompt === "string"
      ? raw.prompt.trim()
      : "";

  if (!text) {
    errors.push("Isi pesan chat tidak boleh kosong.");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      text,
      sesiId: typeof raw.sesiId === "string" ? raw.sesiId.trim() : undefined,
      userId: typeof raw.userId === "string" ? raw.userId.trim() : "usr-1",
    },
  };
}
