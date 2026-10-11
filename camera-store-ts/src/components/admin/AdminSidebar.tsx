"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";

const links = [
  { href: "/admin", label: "Bảng điều khiển", icon: "📊" },
  { href: "/admin/products", label: "Sản phẩm", icon: "📷" },
  { href: "/admin/categories", label: "Danh mục", icon: "📁" },
  { href: "/admin/orders", label: "Đơn hàng", icon: "📦" },
  { href: "/admin/customers", label: "Khách hàng", icon: "👥" },
  { href: "/admin/staff", label: "Nhân viên", icon: "🧑‍💼" },
  { href: "/admin/news", label: "Tin tức", icon: "📰" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { admin, logout } = useAdminAuth();

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-slate-200 flex flex-col shrink-0">
      <div className="p-5 border-b border-slate-700">
        <Link href="/admin" className="text-lg font-bold text-cyan-400">
          📷 Camera Admin
        </Link>
        <p className="text-xs text-slate-400 mt-1">{admin?.ten}</p>
        <p className="text-xs text-slate-500">
          {admin?.ten_chuc_vu || "Nhân viên"}
        </p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map((l) => {
          const active =
            pathname === l.href ||
            (l.href !== "/admin" && pathname.startsWith(l.href));
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition ${
                active
                  ? "bg-cyan-600 text-white"
                  : "hover:bg-slate-800 text-slate-300"
              }`}
            >
              <span>{l.icon}</span> {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-slate-700 space-y-1">
        <Link
          href="/"
          className="block px-3 py-2 text-sm text-slate-400 hover:text-white"
        >
          ← Về cửa hàng
        </Link>
        <button
          onClick={logout}
          className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-lg"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
