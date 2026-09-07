"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import CreateSplitBillForm from "@/components/bagi-tagihan/CreateSplitBillForm";

export default function BuatBagiTagihanBaruPage() {
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col p-4 pb-28 space-y-4 max-w-lg mx-auto w-full">
      {/* Header Halaman */}
      <div className="flex items-center gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-base font-black text-slate-900 flex items-center gap-1.5">
            <span>Bagi Tagihan Baru</span>
            <span className="text-blue-600">📝</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">
            Atur nominal patungan bersama teman
          </p>
        </div>
      </div>

      {/* Formulir Bagi Tagihan */}
      <CreateSplitBillForm
        onSuccess={() => {
          router.push("/bagi-tagihan");
        }}
        onCancel={() => {
          router.back();
        }}
      />

      <BottomNav />
    </div>
  );
}
