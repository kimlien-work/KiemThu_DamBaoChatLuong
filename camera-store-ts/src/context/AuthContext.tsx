"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Customer } from "@/types";
import { customers } from "@/data/mock";

interface AuthContextType {
  user: Customer | null;
  login: (username: string, password: string) => boolean;
  register: (data: Omit<Customer, "id">) => boolean;
  logout: () => void;
  updateProfile: (data: Partial<Customer>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Customer | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {}
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      if (user) localStorage.setItem("user", JSON.stringify(user));
      else localStorage.removeItem("user");
    }
  }, [user, loaded]);

  const login = (username: string, password: string) => {
    const found = customers.find(
      (c) => c.tendangnhap === username && c.matkhau === password
    );
    if (found) {
      setUser(found);
      return true;
    }
    // Also check local registered users
    const localUsers = JSON.parse(localStorage.getItem("localUsers") || "[]") as Customer[];
    const local = localUsers.find(
      (c) => c.tendangnhap === username && c.matkhau === password
    );
    if (local) {
      setUser(local);
      return true;
    }
    return false;
  };

  const register = (data: Omit<Customer, "id">) => {
    const all = [
      ...customers,
      ...(JSON.parse(localStorage.getItem("localUsers") || "[]") as Customer[]),
    ];
    if (all.some((c) => c.tendangnhap === data.tendangnhap)) return false;
    const newUser: Customer = { ...data, id: Date.now() };
    const localUsers = JSON.parse(localStorage.getItem("localUsers") || "[]") as Customer[];
    localUsers.push(newUser);
    localStorage.setItem("localUsers", JSON.stringify(localUsers));
    setUser(newUser);
    return true;
  };

  const logout = () => setUser(null);

  const updateProfile = (data: Partial<Customer>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    // update localUsers if needed
    const localUsers = JSON.parse(localStorage.getItem("localUsers") || "[]") as Customer[];
    const idx = localUsers.findIndex((c) => c.id === user.id);
    if (idx >= 0) {
      localUsers[idx] = updated;
      localStorage.setItem("localUsers", JSON.stringify(localUsers));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
