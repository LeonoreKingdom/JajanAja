"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User } from "@/types/finance";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (nama: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginDemo: () => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data?.data?.user) {
          setUser(data.data.user);
          try {
            localStorage.setItem("jajanaja_cached_user", JSON.stringify(data.data.user));
          } catch {
            // ignore localStorage quota or privacy error
          }
          return;
        }
      }
      // If unauthorized, clear user
      setUser(null);
      try {
        localStorage.removeItem("jajanaja_cached_user");
      } catch {
        // ignore
      }
    } catch {
      // Offline fallback: try reading cached user
      try {
        const cached = localStorage.getItem("jajanaja_cached_user");
        if (cached) {
          setUser(JSON.parse(cached));
        }
      } catch {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.data?.user) {
        setUser(data.data.user);
        try {
          localStorage.setItem("jajanaja_cached_user", JSON.stringify(data.data.user));
        } catch {
          // ignore
        }
        return { success: true };
      }
      return { success: false, message: data.message || "Email atau password salah." };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan jaringan.";
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (nama: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, email, password }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.data?.user) {
        setUser(data.data.user);
        try {
          localStorage.setItem("jajanaja_cached_user", JSON.stringify(data.data.user));
        } catch {
          // ignore
        }
        return { success: true };
      }
      return { success: false, message: data.message || "Gagal mendaftar akun." };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan jaringan.";
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = async () => {
    return login("rian.aditya@example.com", "password123");
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      setUser(null);
      try {
        localStorage.removeItem("jajanaja_cached_user");
      } catch {
        // ignore
      }
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        loginDemo,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
