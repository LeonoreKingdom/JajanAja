"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  ReceiptText,
  Target,
  Wallet,
  Users,
  ScanLine,
  MessageSquare,
  Sparkles,
  Sun,
  Moon,
  LogOut,
  LogIn,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useTransaction } from "@/context/TransactionContext";

export default function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { totalSaldo, sisaBudgetBulanIni, totalBudgetBulanIni } = useTransaction();

  const navItems = [
    { label: "Dashboard", href: "/", icon: Home },
    { label: "Catat Transaksi", href: "/transaksi", icon: ReceiptText },
    { label: "Budgetin", href: "/budgetin", icon: Target },
    { label: "Asetku", href: "/asetku", icon: Wallet },
    { label: "Bagi Tagihan", href: "/bagi-tagihan", icon: Users },
    { label: "Pindai Struk AI", href: "/pindai-struk", icon: ScanLine },
    { label: "WhatsApp Bot", href: "/whatsapp", icon: MessageSquare },
    {
      label: "Tanya LEVINA",
      href: "/levina",
      icon: Sparkles,
      highlight: true,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const budgetPercent =
    totalBudgetBulanIni > 0
      ? Math.min(
          100,
          Math.round(((totalBudgetBulanIni - sisaBudgetBulanIni) / totalBudgetBulanIni) * 100)
        )
      : 0;

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 fixed left-0 top-0 bottom-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 z-30 p-4 select-none transition-colors duration-200">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center text-xl shadow-md shadow-emerald-500/10 group-hover:scale-105 transition">
            🦊
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                JajanAja
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Teman Finansial Pribadi
            </p>
          </div>
        </Link>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
          className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition cursor-pointer"
        >
          {isDark ? (
            <Sun size={15} className="text-amber-400" />
          ) : (
            <Moon size={15} className="text-indigo-600" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Menu Utama
        </p>

        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                  active
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20"
                    : "bg-purple-50/70 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-950/60 border border-purple-200/60 dark:border-purple-800/40"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300"
                  }`}
                >
                  <Icon size={16} />
                </div>
                <span className="flex-1">{item.label}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/20 dark:bg-purple-900 text-xs">
                  AI 🦊
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs border border-emerald-200/80 dark:border-emerald-800/50"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  active
                    ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400"
                    : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600"
                }`}
              >
                <Icon size={17} />
              </div>
              <span className="flex-1">{item.label}</span>
              {active && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Snapshot Keuangan Mini di Sidebar */}
      <div className="p-3 my-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs space-y-2">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1 font-semibold text-[11px]">
            <TrendingUp size={13} className="text-emerald-500" />
            Ringkasan Keuangan
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Live</span>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">Saldo Semua Aset</p>
          <p className="text-sm font-black text-slate-900 dark:text-slate-100">
            {formatRupiah(totalSaldo)}
          </p>
        </div>
        {totalBudgetBulanIni > 0 && (
          <div className="space-y-1 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
            <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span>Pemakaian Budget</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{budgetPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  budgetPercent > 90
                    ? "bg-rose-500"
                    : budgetPercent > 75
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${budgetPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* User Profile & Auth Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
        {isAuthenticated && user ? (
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white text-xs shrink-0 overflow-hidden">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt={user.nama} className="w-full h-full object-cover" />
                ) : (
                  user.nama.substring(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {user.nama}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  {user.email || "rian.aditya@example.com"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Keluar / Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition"
          >
            <LogIn size={15} />
            <span>Masuk Akun</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
