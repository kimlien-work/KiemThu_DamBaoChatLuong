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
  logout: () => Promise<void>;
  updateAdmin: (staff: Staff) => void;
  loaded: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Staff | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/session", { cache: "no-store" })
      .then(async (res) => {
        if (res.status === 401) return null;
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Không thể xác thực phiên đăng nhập");
        return data.user as Staff;
      })
      .then((user) => {
        if (active) setAdmin(user);
      })
      .catch((error: unknown) => {
        console.error("[admin/session]", error);
        if (active) setAdmin(null);
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) return data.error || "Đăng nhập thất bại";
      setAdmin(data.user);
      return null;
    } catch (error) {
      console.error("[admin/login]", error);
      return "Không thể kết nối máy chủ đăng nhập. Vui lòng thử lại.";
    }
  };

  const logout = async () => {
    const res = await fetch("/api/admin/logout", { method: "POST" });
    if (!res.ok) throw new Error("Không thể đăng xuất");
    setAdmin(null);
  };

  const updateAdmin = (staff: Staff) => {
    setAdmin((current) => (current?.id === staff.id ? staff : current));
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, updateAdmin, loaded }}>
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
