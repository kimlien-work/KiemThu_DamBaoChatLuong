"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { CartItem } from "@/types";
import { useAuth } from "./AuthContext";

interface CartContextType {
  cart: CartItem[];
  addToCart: (id: number, soluong?: number) => void;
  updateQuantity: (id: number, soluong: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, authLoaded } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [ownerKey, setOwnerKey] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoaded) return;

    const nextOwnerKey = user ? `cart:user:${user.id}` : "cart:guest";
    if (ownerKey === nextOwnerKey) return;

    if (ownerKey) {
      localStorage.setItem(ownerKey, JSON.stringify(cart));
    }

    let saved = localStorage.getItem(nextOwnerKey);
    if (saved === null) {
      saved = localStorage.getItem("cart");
      if (saved !== null) localStorage.setItem(nextOwnerKey, saved);
    }
    localStorage.removeItem("cart");

    if (saved !== null) {
      try {
        const parsed: unknown = JSON.parse(saved);
        setCart(
          Array.isArray(parsed)
            ? parsed.filter(
                (item): item is CartItem =>
                  typeof item?.id === "number" &&
                  typeof item?.soluong === "number" &&
                  item.soluong > 0
              )
            : []
        );
      } catch {
        setCart([]);
      }
    } else {
      setCart([]);
    }
    setOwnerKey(nextOwnerKey);
  }, [authLoaded, user, ownerKey, cart]);

  useEffect(() => {
    const activeOwnerKey = user ? `cart:user:${user.id}` : "cart:guest";
    if (authLoaded && ownerKey === activeOwnerKey) {
      localStorage.setItem(ownerKey, JSON.stringify(cart));
    }
  }, [authLoaded, user, ownerKey, cart]);

  const addToCart = (id: number, soluong = 1) => {
    setCart((prev) => {
      const exist = prev.find((i) => i.id === id);
      if (exist) {
        return prev.map((i) =>
          i.id === id ? { ...i, soluong: i.soluong + soluong } : i
        );
      }
      return [...prev, { id, soluong }];
    });
  };

  const updateQuantity = (id: number, soluong: number) => {
    if (soluong < 1) return;
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, soluong } : i))
    );
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, i) => sum + i.soluong, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, totalItems }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
