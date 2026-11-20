"use client";

import Link from "next/link";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminDashboardPage() {
  const { admin } = useAdminAuth();
  const isAdmin = admin?.chucvu_id === 1;
  const role = isAdmin
    ? "Quản trị viên"
    : admin?.ten_chuc_vu || "Nhân viên";

  const shortcuts = [
    { href: "/admin/products", label: "Quản lý sản phẩm" },
    { href: "/admin/orders", label: "Xem đơn hàng" },
    ...(isAdmin
      ? [
          { href: "/admin/customers", label: "Quản lý khách hàng" },
          { href: "/admin/staff", label: "Quản lý nhân viên" },
          { href: "/admin/stats", label: "Xem thống kê" },
        ]
      : [{ href: "/admin/staff", label: "Thông tin cá nhân" }]),
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        Bảng điều khiển
      </h1>
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <p className="text-lg font-semibold text-slate-800">
          Xin chào, {admin?.ten}
        </p>
        <p className="mt-2 text-slate-600">
          Bạn đã đăng nhập với vai trò{" "}
          <span className="font-semibold text-cyan-700">{role}</span>.
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {isAdmin
            ? "Bạn có quyền quản lý toàn bộ cửa hàng."
            : "Các thao tác quản trị được giới hạn theo quyền nhân viên."}
        </p>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold text-slate-800">
          Truy cập nhanh
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {shortcuts.map((shortcut) => (
            <Link
              key={shortcut.href}
              href={shortcut.href}
              className="rounded-lg border bg-white p-4 text-sm font-medium text-cyan-700 transition hover:border-cyan-500 hover:bg-cyan-50"
            >
              {shortcut.label} →
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
