"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { categories } from "@/data/mock";
import { useState } from "react";

export default function Header() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-cyan-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-cyan-600">📷 Camera Store</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-cyan-600 font-medium">
              Trang chủ
            </Link>
            <div className="relative group">
              <button className="text-gray-700 hover:text-cyan-600 font-medium flex items-center gap-1">
                Danh mục ▾
              </button>
              <div className="absolute left-0 top-full mt-1 w-48 bg-white shadow-lg rounded-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/category/${c.id}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-600"
                  >
                    {c.tendanhmuc}
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/news" className="text-gray-700 hover:text-cyan-600 font-medium">
              Tin tức
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative text-gray-700 hover:text-cyan-600">
              <span className="text-xl">🛒</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group">
                <button className="text-sm font-medium text-cyan-700 hover:text-cyan-900">
                  {user.ten} ▾
                </button>
                <div className="absolute right-0 top-full mt-1 w-44 bg-white shadow-lg rounded-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-cyan-50">
                    Hồ sơ
                  </Link>
                  <Link href="/orders" className="block px-4 py-2 text-sm hover:bg-cyan-50">
                    Đơn hàng
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="text-sm px-3 py-1.5 rounded border border-cyan-500 text-cyan-600 hover:bg-cyan-50"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="text-sm px-3 py-1.5 rounded bg-cyan-600 text-white hover:bg-cyan-700"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            <button className="md:hidden text-xl" onClick={() => setOpen(!open)}>
              ☰
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden pb-4 border-t">
            <Link href="/" className="block py-2" onClick={() => setOpen(false)}>
              Trang chủ
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.id}`}
                className="block py-2 pl-4 text-sm"
                onClick={() => setOpen(false)}
              >
                {c.tendanhmuc}
              </Link>
            ))}
            <Link href="/news" className="block py-2" onClick={() => setOpen(false)}>
              Tin tức
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
