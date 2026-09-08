"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Sparkles, Sun, Moon, LogIn, LogOut, User as UserIcon } from "lucide-react";
import { User } from "@/types/finance";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  user?: User;
}

export default function Header({ user: propUser }: HeaderProps) {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const { user: authUser, isAuthenticated, logout } = useAuth();

  const currentUser = authUser || propUser;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="flex items-center justify-between py-3.5 px-1">
      {/* User Profile / Info (Left) */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-sm">
            <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-400 text-sm overflow-hidden">
              {isAuthenticated && currentUser?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.nama}
                  className="w-full h-full object-cover"
                />
              ) : isAuthenticated && currentUser?.nama ? (
                currentUser.nama.substring(0, 2).toUpperCase()
              ) : (
                <UserIcon size={18} className="text-slate-400" />
              )}
            </div>
          </div>
          {isAuthenticated && (
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
          )}
        </div>

        <div>
          {isAuthenticated && currentUser ? (
            <>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>Selamat Datang</span>
                <span className="inline-block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                  <Sparkles size={11} /> Pro
                </span>
              </div>
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {currentUser.nama}
              </h1>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
                <span>Mode Tamu / Demo</span>
              </div>
              <h1 className="text-base font-bold text-slate-700 dark:text-slate-300 tracking-tight">
                Belum Masuk
              </h1>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons (Right) */}
      <div className="flex items-center gap-2">
        {/* Toggle Dark/Light Mode Button */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
          className="relative w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-150 shadow-2xs cursor-pointer"
        >
          {isDark ? (
            <Sun size={17} className="text-amber-400" />
          ) : (
            <Moon size={17} className="text-indigo-600" />
          )}
        </button>

        {/* If Logged In: Notifications & Logout Button */}
        {isAuthenticated && currentUser ? (
          <>
            <button
              type="button"
              aria-label="Notifikasi"
              className="relative w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-2xs cursor-pointer"
            >
              <Bell size={16} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-800" />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              title="Keluar / Logout Akun"
              aria-label="Keluar"
              className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition shadow-2xs cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </>
        ) : (
          /* If Not Logged In: Direct Login Button */
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition cursor-pointer"
          >
            <LogIn size={14} />
            <span>Masuk</span>
          </Link>
        )}
      </div>
    </header>
  );
}
