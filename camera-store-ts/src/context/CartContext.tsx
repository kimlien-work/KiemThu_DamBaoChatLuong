"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { CartItem } from "@/types";

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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch {}
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, loaded]);

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
