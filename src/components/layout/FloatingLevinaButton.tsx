"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, MessageCircle, X } from "lucide-react";

export default function FloatingLevinaButton() {
  const pathname = usePathname();
  const [showTooltip, setShowTooltip] = useState(true);

  // Sembunyikan floating button jika pengguna sudah berada di halaman percakapan LEVINA
  if (pathname === "/levina") {
    return null;
  }

  return (
    <aside
      aria-label="Asisten Keuangan LEVINA"
      className="fixed bottom-20 right-4 z-40 flex flex-col items-end pointer-events-auto select-none animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      {/* Tooltip Mini / Sapaan Bubble */}
      {showTooltip && (
        <div className="mb-2 relative bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-purple-100 dark:border-purple-900/60 shadow-lg rounded-2xl py-1.5 px-3 flex items-center gap-2 max-w-[200px]">
          <span className="text-sm">🦊</span>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100 truncate">
              Tanya LEVINA
            </p>
            <p className="text-[9px] text-purple-600 dark:text-purple-400 truncate">
              Cek budget & bocor halus
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            aria-label="Tutup sapaan"
          >
            <X size={12} />
          </button>
          {/* Segitiga arah balon bicara */}
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white dark:bg-slate-800 border-r border-b border-purple-100 dark:border-purple-900/60 rotate-45"></div>
        </div>
      )}

      {/* Floating Action Button (FAB) Maskot */}
      <Link
        href="/levina"
        aria-label="Buka Chatbot Teman Finansial LEVINA"
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white shadow-xl shadow-purple-500/25 dark:shadow-purple-950/50 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-800"
      >
        {/* Glow Ring Pulse */}
        <span className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-20 group-hover:opacity-40"></span>

        {/* Ikon Maskot Rubah */}
        <div className="relative flex items-center justify-center">
          <span className="text-2xl transition-transform duration-200 group-hover:scale-110">
            🦊
          </span>
          {/* Badge Bintang Sparkle */}
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-xs">
            <Sparkles size={10} strokeWidth={3} />
          </div>
        </div>
      </Link>
    </aside>
  );
}
