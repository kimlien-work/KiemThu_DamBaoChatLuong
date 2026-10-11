"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface Stats {
  products: number;
  orders: number;
  customers: number;
  pending: number;
  revenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setStats(d);
      })
      .catch((e) => setError(String(e)));
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <p className="font-bold">Lỗi tải thống kê</p>
        <p className="text-sm mt-1">{error}</p>
        <p className="text-sm mt-2">Kiểm tra kết nối DB (Aiven) và bảng nhan_vien, donhang, mathang…</p>
      </div>
    );
  }

  if (!stats) return <p className="text-slate-500">Đang tải...</p>;

  const cards = [
    { label: "Sản phẩm", value: stats.products, href: "/admin/products", color: "bg-blue-500" },
    { label: "Đơn hàng", value: stats.orders, href: "/admin/orders", color: "bg-violet-500" },
    { label: "Chờ duyệt", value: stats.pending, href: "/admin/orders", color: "bg-amber-500" },
    { label: "Khách hàng", value: stats.customers, href: "/admin/customers", color: "bg-emerald-500" },
    { label: "Doanh thu (hoàn tất)", value: formatPrice(stats.revenue), href: "/admin/orders", color: "bg-rose-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Bảng điều khiển</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition"
          >
            <div className={`w-10 h-10 ${c.color} rounded-lg mb-3 opacity-90`} />
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
