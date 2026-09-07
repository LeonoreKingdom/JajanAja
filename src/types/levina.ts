export interface LevinaBudgetItem {
  kategori: string;
  batas: number;
  terpakai: number;
  sisa: number;
  persentase: number;
  status: "aman" | "waspada" | "habis";
}

export interface LevinaSavingTip {
  id: string;
  kategori: string;
  judul: string;
  deskripsi: string;
  potensiHemat: number;
  ikon?: string;
}

export interface LevinaFeatureGuide {
  featureName: string;
  description: string;
  steps: string[];
  actionLabel: string;
  actionHref: string;
  icon?: string;
}

export interface LevinaChatMessage {
  id: string;
  sender: "user" | "levina";
  text: string;
  timestamp: string;
  tipe?: "text" | "budget_summary" | "saving_tip" | "feature_guide";
  budgetData?: LevinaBudgetItem[];
  savingTips?: LevinaSavingTip[];
  featureGuide?: LevinaFeatureGuide;
  metadata?: Record<string, unknown>;
}
