"use client";

import React from "react";
import { Bell, Calendar, Sparkles, Sun, Moon } from "lucide-react";
import { User } from "@/types/finance";
import { useTheme } from "@/context/ThemeContext";

interface HeaderProps {
  user: User;
}

export default function Header({ user }: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between py-4 px-1">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-sm">
            <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-400 text-sm overflow-hidden">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.nama}
                  className="w-full h-full object-cover"
                />
              ) : (
                user.nama.substring(0, 2).toUpperCase()
              )}
            </div>
          </div>
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Selamat Datang</span>
            <span className="inline-block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
              <Sparkles size={11} /> Pro
            </span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {user.nama}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Toggle Dark Mode Button */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
          className="relative w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-750 transition-all duration-150 shadow-xs"
        >
          {isDark ? (
            <Sun size={18} className="text-amber-400 transition-transform rotate-0 scale-100" />
          ) : (
            <Moon size={18} className="text-indigo-600 transition-transform rotate-0 scale-100" />
          )}
        </button>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-xs">
          <Calendar size={13} className="text-emerald-600 dark:text-emerald-400" />
          <span>September 2026</span>
        </div>

        <button
          type="button"
          aria-label="Notifikasi"
          className="relative w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-750 transition shadow-xs"
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-800"></span>
        </button>
      </div>
    </header>
  );
}
