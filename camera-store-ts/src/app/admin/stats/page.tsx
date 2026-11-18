"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

interface Stats {
  products: number;
  orders: number;
  customers: number;
  pending: number;
  revenue: number;
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [activeRange, setActiveRange] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadStats = (from?: string, to?: string) => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (from && to) {
      params.set("from", from);
      params.set("to", to);
    }

    fetch(`/api/admin/stats${params.size ? `?${params.toString()}` : ""}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setStats(data);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStats();
  }, []);

  const addDays = (dateText: string, days: number) => {
    const date = new Date(`${dateText}T00:00:00`);
    date.setDate(date.getDate() + days);
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  };

  const handleFilter = () => {
    setError("");
    if (!fromDate || !toDate) {
      setError("Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.");
      return;
    }
    if (toDate < fromDate) {
      setError("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.");
      return;
    }
    if (new Date(toDate).getTime() - new Date(fromDate).getTime() > 30 * 86400000) {
      setError("Khoảng thời gian thống kê tối đa là 31 ngày.");
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

  if (!stats && loading) return <p className="text-slate-500">Đang tải thống kê...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Thống kê</h1>

      <div className="bg-white border rounded-xl shadow-sm p-5 mb-6">
        <h2 className="font-bold text-slate-700 mb-4">Lọc doanh thu theo khoảng thời gian</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="stats-from" className="block text-sm text-slate-600 mb-1">Từ ngày</label>
            <input
              id="stats-from"
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="stats-to" className="block text-sm text-slate-600 mb-1">Đến ngày</label>
            <input
              id="stats-to"
              type="date"
              value={toDate}
              min={fromDate || undefined}
              max={fromDate ? addDays(fromDate, 30) : undefined}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>
          <button
            type="button"
            onClick={handleFilter}
            disabled={loading}
            className="h-[42px] px-4 rounded-lg bg-rose-500 text-white font-medium hover:bg-rose-600 disabled:opacity-60"
          >
            Lọc doanh thu
          </button>
          {activeRange && (
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="h-[42px] px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        <p className="text-xs text-slate-500 mt-3">
          {activeRange ? `Khoảng đã chọn: ${activeRange}` : "Tối đa 31 ngày trong mỗi lần lọc."}
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <p className="text-sm text-slate-500">Sản phẩm</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{stats.products}</p>
          </div>
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <p className="text-sm text-slate-500">Tổng đơn hàng</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{stats.orders}</p>
          </div>
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <p className="text-sm text-slate-500">Đơn chờ duyệt</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <p className="text-sm text-slate-500">Doanh thu hoàn tất</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{formatPrice(stats.revenue)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
