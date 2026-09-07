import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TransactionProvider } from "@/context/TransactionContext";
import { ThemeProvider } from "@/context/ThemeContext";
import FloatingLevinaButton from "@/components/layout/FloatingLevinaButton";

export const metadata: Metadata = {
  title: "JajanAja — Teman Finansial Pribadimu",
  description:
    "Aplikasi financial tracking cerdas dengan pencatatan pengeluaran (JajanAja), pemasukan (NabungAja), pos budget bulanan (Budgetin), pengaturan aset (Asetku), dan asisten maskot LEVINA.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-start transition-colors duration-200">
        {/* Container Mobile First */}
        <ThemeProvider>
          <div className="w-full max-w-lg min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 relative pb-24 shadow-sm flex flex-col transition-colors duration-200">
            <TransactionProvider>
              {children}
              {/* Floating LEVINA Assistant Button (FAB) */}
              <FloatingLevinaButton />
            </TransactionProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
