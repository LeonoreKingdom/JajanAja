import { serverStore } from "../db/store";
import { LevinaChatMessageRecord } from "../schemas/levina.schema";
import { LevinaIntentService } from "./levina-intent.service";
import { LevinaQAService } from "./levina-qa.service";
import { LevinaSavingTipsService } from "./levina-saving-tips.service";
import { LevinaGuideService } from "./levina-guide.service";

export interface SendChatMessageInput {
  message: string;
  userId?: string;
}

export interface ChatResponseResult {
  userMessage: LevinaChatMessageRecord;
  botMessage: LevinaChatMessageRecord;
  intent: ReturnType<typeof LevinaIntentService.detectIntent>;
  context?: {
    historyLength: number;
    previousTopic?: string;
    resolvedQuery?: string;
  };
}

/**
 * Service orkestrasi chatbot LEVINA untuk pengiriman pesan,
 * pemrosesan intent, dan persistensi riwayat percakapan dengan konteks dialog.
 */
export class LevinaChatService {
  /**
   * Mengambil riwayat percakapan terakhir sebagai konteks percakapan
   */
  static getRecentContext(userId: string = "usr-1", limit: number = 6): {
    history: LevinaChatMessageRecord[];
    previousTopic?: string;
    lastBotMessage?: LevinaChatMessageRecord;
    lastUserMessage?: LevinaChatMessageRecord;
  } {
    const history = serverStore.getLevinaMessages(userId, limit);
    const lastBotMessage = [...history].reverse().find((m) => m.sender === "levina");
    const lastUserMessage = [...history].reverse().find((m) => m.sender === "user");

    let previousTopic: string | undefined;

    if (lastBotMessage) {
      if (lastBotMessage.tipe === "budget_summary" && lastBotMessage.budgetData?.[0]) {
        previousTopic = lastBotMessage.budgetData[0].kategori;
      } else if (lastBotMessage.tipe === "feature_guide" && lastBotMessage.featureGuide) {
        previousTopic = lastBotMessage.featureGuide.featureName;
      } else if (lastBotMessage.tipe === "saving_tip") {
        previousTopic = "saran_hemat";
      } else if (lastBotMessage.text.toLowerCase().includes("kopi")) {
        previousTopic = "Kopi & Jajan";
      } else if (lastBotMessage.text.toLowerCase().includes("makan")) {
        previousTopic = "Makan & Minum";
      }
    }

    return {
      history,
      previousTopic,
      lastBotMessage,
      lastUserMessage,
    };
  }

  /**
   * Mengirim pesan baru dari pengguna ke LEVINA dan menghasilkan balasan cerdas
   * dengan memanfaatkan riwayat chat sebelumnya sebagai konteks.
   */
  static async sendMessage(input: SendChatMessageInput): Promise<ChatResponseResult> {
    const text = (input.message || "").trim();
    if (!text) {
      throw new Error("Pesan tidak boleh kosong");
    }

    const userId = input.userId || "usr-1";

    // 1. Ambil riwayat percakapan sebelumnya sebagai konteks sebelum menyimpan pesan baru
    const recentContext = this.getRecentContext(userId, 6);

    // 2. Simpan pesan pengguna ke database / serverStore
    const userMessage = serverStore.addLevinaMessage({
      userId,
      sender: "user",
      text,
      tipe: "text",
    });

    // 3. Evaluasi apakah pertanyaan memerlukan konteks dari dialog sebelumnya
    let resolvedQuery = text;
    const lower = text.toLowerCase();
    const isContextualFollowUp =
      lower.startsWith("kalau ") ||
      lower.startsWith("gimana kalau") ||
      lower.includes("tadi") ||
      lower.includes("itu") ||
      lower.includes("lanjut") ||
      lower.includes("ada saran lain") ||
      lower.includes("yang mana");

    if (isContextualFollowUp && recentContext.previousTopic) {
      resolvedQuery = `${text} (konteks topik sebelumnya: ${recentContext.previousTopic})`;
    }

    // 4. Deteksi intent pesan
    const intent = LevinaIntentService.detectIntent(resolvedQuery);

    // 5. Proses balasan berdasarkan intent yang terdeteksi & riwayat
    let replyText = "";
    let replyTipe: "text" | "budget_summary" | "saving_tip" | "feature_guide" = "text";
    let budgetData: import("@/types/levina").LevinaBudgetItem[] | undefined;
    let savingTips: import("@/types/levina").LevinaSavingTip[] | undefined;
    let featureGuide: import("@/types/levina").LevinaFeatureGuide | undefined;

    switch (intent.intent) {
      case "sapaan":
        replyText =
          "Halo kak! Senang ngobrol lagi denganmu. Aku LEVINA, maskot rubah pintar & teman finansial setiamu di JajanAja 🦊✨.\n\nTugas utamaku adalah membantu kamu melacak uang jajan, menyusun budget bulanan, dan mencegah kebocoran dompet tanpa bikin hidup kamu kaku! Ada yang bisa LEVINA bantu?";
        replyTipe = "text";
        break;

      case "tanya_budget":
      case "tanya_pengeluaran":
      case "tanya_aset": {
        const qaAnswer = LevinaQAService.answerQuestion(resolvedQuery, userId);
        replyText = qaAnswer.text;
        replyTipe = qaAnswer.tipe;
        budgetData = qaAnswer.budgetData;
        break;
      }

      case "saran_hemat": {
        const tipsResult = LevinaSavingTipsService.generateTips(userId);
        replyText = tipsResult.text;
        replyTipe = tipsResult.tipe;
        savingTips = tipsResult.tips;
        break;
      }

      case "panduan_fitur": {
        const guideKey = intent.featureTarget ? intent.featureTarget.replace("_", "-") : resolvedQuery;
        const guideResult = LevinaGuideService.generateGuide(guideKey);
        replyText = guideResult.text;
        replyTipe = guideResult.tipe;
        featureGuide = guideResult.featureGuide;
        break;
      }

      case "umum":
      default: {
        // Coba evaluasi Q&A umum
        const qaGeneral = LevinaQAService.handleGeneralFinancialOverview();
        replyText = qaGeneral.text;
        replyTipe = qaGeneral.tipe;
        budgetData = qaGeneral.budgetData;
        break;
      }
    }

    // 6. Simpan balasan bot LEVINA ke database / serverStore
    const botMessage = serverStore.addLevinaMessage({
      userId,
      sender: "levina",
      text: replyText,
      tipe: replyTipe,
      budgetData,
      savingTips,
      featureGuide,
    });

    return {
      userMessage,
      botMessage,
      intent,
      context: {
        historyLength: recentContext.history.length,
        previousTopic: recentContext.previousTopic,
        resolvedQuery: isContextualFollowUp ? resolvedQuery : undefined,
      },
    };
  }

  /**
   * Mengambil riwayat percakapan LEVINA
   */
  static getHistory(userId: string = "usr-1", limit: number = 50): LevinaChatMessageRecord[] {
    return serverStore.getLevinaMessages(userId, limit);
  }

  /**
   * Mengosongkan riwayat percakapan
   */
  static clearHistory(userId: string = "usr-1"): void {
    serverStore.clearLevinaMessages(userId);
  }

  /**
   * Me-reset riwayat percakapan ke default onboarding
   */
  static resetHistory(userId: string = "usr-1"): LevinaChatMessageRecord[] {
    return serverStore.resetLevinaMessages(userId);
  }
}
