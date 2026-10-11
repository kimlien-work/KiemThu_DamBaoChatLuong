"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import type { Staff } from "@/types";

interface AdminAuthContextType {
  admin: Staff | null;
  login: (username: string, password: string) => Promise<string | null>;
  logout: () => void;
  loaded: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Staff | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin_user");
    if (saved) {
      try {
        setAdmin(JSON.parse(saved));
      } catch {}
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (admin) localStorage.setItem("admin_user", JSON.stringify(admin));
    else localStorage.removeItem("admin_user");
  }, [admin, loaded]);

  const login = async (username: string, password: string) => {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) return data.error || "Đăng nhập thất bại";
    setAdmin(data.user);
    return null;
  };

  const logout = () => setAdmin(null);

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, loaded }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx)
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
