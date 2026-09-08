"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Plus, Bell, Calendar, Sparkles, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTransaction } from "@/context/TransactionContext";
import TransactionModal from "@/components/dashboard/TransactionModal";
import { TransactionType } from "@/types/finance";

export default function DesktopHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { categories, assets, addTransaction } = useTransaction();
  const [showCatatModal, setShowCatatModal] = useState(false);

  const getPageInfo = () => {
    if (pathname === "/") return { title: "Dashboard Overview", subtitle: "Pantau kesehatan keuangan & arus kas harian" };
    if (pathname.startsWith("/transaksi")) return { title: "Catat & Riwayat Transaksi", subtitle: "Pencatatan pengeluaran & pemasukan harian" };
    if (pathname.startsWith("/budgetin")) return { title: "Pos Anggaran (Budgetin)", subtitle: "Atur limit pos belanja & hindari bocor halus" };
    if (pathname.startsWith("/asetku")) return { title: "Manajemen Dompet & Rekening (Asetku)", subtitle: "Lacak saldo tunai, bank, dan e-wallet" };
    if (pathname.startsWith("/bagi-tagihan")) return { title: "Bagi Tagihan & Split Bill", subtitle: "Hitung patungan adil dengan pajak & diskon" };
    if (pathname.startsWith("/pindai-struk")) return { title: "Pindai Struk OCR Otomatis", subtitle: "Foto struk belanja, AI yang menginputnya" };
    if (pathname.startsWith("/whatsapp")) return { title: "Asisten WhatsApp Bot", subtitle: "Catat transaksi instan via pesan WhatsApp" };
    if (pathname.startsWith("/levina")) return { title: "Konsultasi LEVINA 🦊", subtitle: "Asisten AI finansial ramah dan cerdas" };
    return { title: "JajanAja", subtitle: "Aplikasi Finansial Pribadi" };
  };

  const { title } = getPageInfo();

  // Current formatted date
  const todayDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const handleSaveTransaction = async (newTx: {
    tipe: TransactionType;
    jumlah: number;
    categoryId: string;
    assetId: string;
    catatan: string;
  }) => {
    await addTransaction({
      tipe: newTx.tipe,
      jumlah: newTx.jumlah,
      categoryId: newTx.categoryId,
      assetId: newTx.assetId,
      catatan: newTx.catatan,
      sumber: "manual",
    });
    setShowCatatModal(false);
  };

  return (
    <>
      <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-20 transition-colors duration-200">
        {/* Left: Breadcrumbs & Page title */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium mb-0.5">
            <span>JajanAja</span>
            <ChevronRight size={12} />
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{title}</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {title}
          </h1>
        </div>

        {/* Right: Actions, Date, Notifications & User */}
        <div className="flex items-center gap-3">
          {/* Quick Catat Button */}
          <button
            type="button"
            onClick={() => setShowCatatModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs shadow-sm shadow-emerald-600/20 active:scale-[0.98] transition cursor-pointer"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>+ Catat Cepat</span>
          </button>

          {/* Date pill */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
            <Calendar size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span>{todayDate}</span>
          </div>

          {/* Notification bell */}
          <button
            type="button"
            aria-label="Notifikasi"
            className="relative w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center text-slate-600 dark:text-slate-300 transition cursor-pointer"
          >
            <Bell size={16} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
          </button>

          {/* User Profile Pill */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white text-xs overflow-hidden">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt={user.nama} className="w-full h-full object-cover" />
                ) : (
                  user.nama.substring(0, 2).toUpperCase()
                )}
              </div>
              <div className="text-left leading-tight hidden xl:block">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
                  {user.nama}
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                  <Sparkles size={9} /> Pro
                </p>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold hover:bg-slate-800 transition"
            >
              Masuk
            </button>
          )}
        </div>
      </header>

      {/* Quick Catat Modal */}
      {showCatatModal && (
        <TransactionModal
          isOpen={showCatatModal}
          onClose={() => setShowCatatModal(false)}
          type="pengeluaran"
          categories={categories}
          assets={assets}
          onSave={handleSaveTransaction}
        />
      )}
    </>
  );
}
