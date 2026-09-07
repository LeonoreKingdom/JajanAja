export interface SplitParticipant {
  id: string;
  nama: string;
  bagian: number;
  sudahBayar: boolean;
  avatar?: string;
  nomorHp?: string;
}

export type SplitMethod = "sama_rata" | "nominal_bebas";

export interface SplitBillGroup {
  id: string;
  judul: string;
  totalTagihan: number;
  tanggal: string;
  metode: SplitMethod;
  namaToko?: string;
  transactionId?: string;
  peserta: SplitParticipant[];
  status: "aktif" | "selesai";
  catatan?: string;
  createdAt: string;
  updatedAt: string;
}
