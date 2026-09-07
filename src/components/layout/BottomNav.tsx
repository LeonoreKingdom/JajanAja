"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ReceiptText, Target, Wallet } from "lucide-react";

interface BottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const pathname = usePathname();

  const getActiveState = (id: string, href: string) => {
    if (activeTab) return activeTab === id;
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  // Tepat 4 menu navigasi utama (LEVINA kini berupa floating button terpisah di kanan bawah)
  const navItems = [
    { id: "dashboard", label: "Dashboard", href: "/", icon: Home },
    { id: "transaksi", label: "Catat", href: "/transaksi", icon: ReceiptText },
    { id: "budgetin", label: "Budgetin", href: "/budgetin", icon: Target },
    { id: "asetku", label: "Asetku", href: "/asetku", icon: Wallet },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-2 py-2 max-w-lg mx-auto shadow-lg transition-colors duration-200">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = getActiveState(item.id, item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => onTabChange?.(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-150 ${
                isActive
                  ? "text-emerald-600 dark:text-emerald-400 font-bold scale-105"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
              }`}
            >
              <Icon size={21} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 bg-emerald-600 dark:bg-emerald-400 rounded-full mt-0.5"></span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
