import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TransactionProvider } from "@/context/TransactionContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import AppShell from "@/components/layout/AppShell";

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
        <ThemeProvider>
          <AuthProvider>
            <TransactionProvider>
              <AppShell>{children}</AppShell>
            </TransactionProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
