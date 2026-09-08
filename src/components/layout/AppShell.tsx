"use client";

import React from "react";
import { usePathname } from "next/navigation";
import DesktopSidebar from "@/components/layout/DesktopSidebar";
import DesktopHeader from "@/components/layout/DesktopHeader";
import FloatingLevinaButton from "@/components/layout/FloatingLevinaButton";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // On login / register page, show clean standalone full-screen view
  if (pathname.startsWith("/login")) {
    return <main className="w-full min-h-screen">{children}</main>;
  }

  return (
    <div className="w-full min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col lg:flex-row transition-colors duration-200">
      {/* Desktop Sidebar (hidden on mobile, fixed on desktop) */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64 xl:ml-72 w-full transition-all duration-200 overflow-x-hidden">
        {/* Desktop Top Header (hidden on mobile) */}
        <DesktopHeader />

        {/* Responsive Content Container */}
        <main className="w-full flex-1 flex flex-col items-center lg:items-stretch">
          <div className="w-full max-w-lg lg:max-w-7xl mx-auto min-h-screen lg:min-h-0 bg-slate-50 dark:bg-slate-900 lg:bg-transparent lg:dark:bg-transparent shadow-sm lg:shadow-none relative pb-24 lg:pb-12 px-0 lg:px-6 xl:px-8 pt-0 lg:pt-6 transition-colors duration-200">
            {children}
          </div>
        </main>
      </div>

      {/* Floating LEVINA Assistant Button (FAB) - mobile only, hidden on lg */}
      <FloatingLevinaButton />
    </div>
  );
}
