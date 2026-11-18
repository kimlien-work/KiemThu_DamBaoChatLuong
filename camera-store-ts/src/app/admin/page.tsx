"use client";

import { useCallback, useEffect, useState } from "react";
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
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [activeRange, setActiveRange] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterError, setFilterError] = useState("");

  const loadStats = useCallback((from?: string, to?: string) => {
    setLoading(true);
    setError("");
    setFilterError("");
    const params = new URLSearchParams();
    if (from && to) {
      params.set("from", from);
      params.set("to", to);
    }
    fetch(`/api/admin/stats${params.toString() ? `?${params.toString()}` : ""}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setStats(d);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const addDays = (dateText: string, days: number) => {
    const date = new Date(`${dateText}T00:00:00`);
    date.setDate(date.getDate() + days);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleFromChange = (value: string) => {
    setFromDate(value);
    if (toDate && value) {
      if (toDate < value) setToDate(value);
      else if (new Date(toDate).getTime() - new Date(value).getTime() > 30 * 86400000) {
        setToDate(addDays(value, 30));
      }
    }
  };

  const handleFilter = () => {
    if (!fromDate || !toDate) {
      setFilterError("Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.");
      return;
    }
    if (toDate < fromDate) {
      setFilterError("Ngày bắt đầu phải trước ngày kết thúc.");
      return;
    }
    if (new Date(toDate).getTime() - new Date(fromDate).getTime() > 30 * 86400000) {
      setFilterError("Khoảng thời gian thống kê doanh thu tối đa 31 ngày.");
      return;
    }
    setActiveRange(`${fromDate} đến ${toDate}`);
    loadStats(fromDate, toDate);
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setActiveRange("");
    loadStats();
  };

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
    {
      label: activeRange ? "Doanh thu theo khoảng lọc" : "Doanh thu (hoàn tất)",
      value: formatPrice(stats.revenue),
      href: "/admin/orders",
      color: "bg-rose-500",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Bảng điều khiển</h1>
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="revenue-from" className="block text-sm font-medium text-slate-600 mb-1">
              Từ ngày
            </label>
            <input
              id="revenue-from"
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => handleFromChange(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-slate-700"
            />
          </div>
          <div>
            <label htmlFor="revenue-to" className="block text-sm font-medium text-slate-600 mb-1">
              Đến ngày
            </label>
            <input
              id="revenue-to"
              type="date"
              value={toDate}
              min={fromDate || undefined}
              max={fromDate ? addDays(fromDate, 30) : undefined}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-slate-700"
            />
          </div>
          <button
            type="button"
            onClick={handleFilter}
            disabled={loading}
            className="h-[42px] px-4 rounded-lg bg-rose-500 text-white font-medium hover:bg-rose-600 disabled:opacity-60"
          >
            {loading ? "Đang lọc..." : "Lọc doanh thu"}
          </button>
          {activeRange && (
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="h-[42px] px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {activeRange ? `Doanh thu: ${activeRange}` : "Khoảng thời gian tối đa 31 ngày (1 tháng)."}
        </p>
        {filterError && (
          <p className="text-sm text-red-600 mt-2">{filterError}</p>
        )}
      </div>
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
