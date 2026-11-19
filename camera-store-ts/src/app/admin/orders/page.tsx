"use client";

import { useEffect, useState } from "react";
import type { AdminOrder } from "@/types";
import { formatPrice } from "@/lib/utils";
import { trangThaiText } from "@/types";
import { useAdminAuth } from "@/context/AdminAuthContext";
import Link from "next/link";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [detail, setDetail] = useState<AdminOrder | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { admin } = useAdminAuth();
  const isAdmin = admin?.chucvu_id === 1;

  const load = async (keyword = "") => {
    setLoading(true);
    setError("");
    try {
      const params = keyword ? `?q=${encodeURIComponent(keyword)}` : "";
      const res = await fetch(`/api/admin/orders${params}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setOrders([]);
        setError(data.error || "Không thể tải dữ liệu đơn hàng.");
        return;
      }
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
      setError("Không thể tải dữ liệu đơn hàng. Vui lòng kiểm tra kết nối và thử lại.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const keyword = searchInput.trim();
    setSearchQuery(keyword);
    load(keyword);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    load();
  };

  const updateStatus = async (id: number, trangthai: number) => {
    if (!isAdmin) return;
    const res = await fetch("/api/admin/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, trangthai }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Không thể cập nhật trạng thái đơn hàng.");
      return;
    }
    load(searchQuery);
    if (detail?.id === id) {
      const r = await fetch(`/api/admin/orders?id=${id}`);
      if (r.ok) setDetail(await r.json());
    }
  };

  const viewDetail = async (id: number) => {
    const r = await fetch(`/api/admin/orders?id=${id}`);
    if (r.status === 404) {
      setError("Không tìm thấy đơn hàng phù hợp.");
      return;
    }
    if (r.status === 403) {
      setError("Bạn không có quyền xem chi tiết đơn hàng này.");
      return;
    }
    if (!r.ok) {
      const data = await r.json();
      setError(data.error || "Không thể tải dữ liệu đơn hàng.");
      return;
    }
    setError("");
    setDetail(await r.json());
  };

  const badge = (s: number) => {
    const colors: Record<number, string> = {
      0: "bg-amber-100 text-amber-800",
      1: "bg-blue-100 text-blue-800",
      2: "bg-green-100 text-green-800",
      3: "bg-red-100 text-red-800",
    };
    return colors[s] || "bg-gray-100";
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Quản lý đơn hàng</h1>
      <form onSubmit={search} className="flex gap-2 mb-4">
        <input
          type="search"
          className="flex-1 border rounded-lg px-3 py-2"
          placeholder="Nhập mã đơn hàng cần tìm..."
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            if (!e.target.value) {
              setSearchQuery("");
              load();
            }
          }}
        />
        {searchInput && (
          <button type="button" onClick={clearSearch} className="border px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50">
            Xóa
          </button>
        )}
        <button type="submit" className="border border-cyan-600 text-cyan-700 px-4 py-2 rounded-lg hover:bg-cyan-50">
          Tìm kiếm
        </button>
      </form>
      {loading && <p className="mb-4 text-slate-500">Đang tải danh sách đơn hàng...</p>}
      {error && (
        <div className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
          <p>{error}</p>
          <button type="button" onClick={() => load(searchQuery)} className="mt-2 underline">
            Thử lại
          </button>
        </div>
      )}
      <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3">Mã ĐH</th>
              <th className="p-3">Khách hàng</th>
              <th className="p-3">Ngày</th>
              <th className="p-3">Tổng tiền</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {!loading && !error && orders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  Không tìm thấy đơn hàng phù hợp.
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-3 font-bold">#{o.id}</td>
                <td className="p-3">
                  <div className="font-medium">{o.tenkhachhang || "—"}</div>
                  <div className="text-xs text-slate-500">{o.dien_thoai}</div>
                </td>
                <td className="p-3">{new Date(o.ngay).toLocaleString("vi-VN")}</td>
                <td className="p-3 text-red-600 font-bold">{formatPrice(o.tongtien)}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${badge(o.trangthai)}`}>
                    {trangThaiText(o.trangthai)}
                  </span>
                </td>
                <td className="p-3 space-x-1">
                  <button onClick={() => viewDetail(o.id)} className="text-cyan-600 hover:underline text-xs">Chi tiết</button>
                  <Link href={`/admin/orders/${o.id}`} className="text-slate-500 hover:underline text-xs">Mở trang</Link>
                  {isAdmin && o.trangthai === 0 && (
                    <>
                      <button onClick={() => updateStatus(o.id, 1)} className="text-blue-600 hover:underline text-xs">Duyệt & Giao</button>
                      <button onClick={() => updateStatus(o.id, 3)} className="text-red-600 hover:underline text-xs">Hủy</button>
                    </>
                  )}
                  {isAdmin && o.trangthai === 1 && (
                    <button onClick={() => updateStatus(o.id, 2)} className="text-green-600 hover:underline text-xs">Hoàn tất</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-3">Chi tiết đơn #{detail.id}</h2>
            {isAdmin && (
              <p className="text-sm mb-1"><strong>Khách:</strong> {detail.tenkhachhang || "—"}{detail.dien_thoai ? ` — ${detail.dien_thoai}` : ""}</p>
            )}
            <p className="text-sm mb-1"><strong>Ngày:</strong> {new Date(detail.ngay).toLocaleString("vi-VN")}</p>
            <p className="text-sm mb-1"><strong>Trạng thái:</strong> {trangThaiText(detail.trangthai)}</p>
            {detail.ghichu && <p className="text-sm mb-3"><strong>Ghi chú:</strong> {detail.ghichu}</p>}
            <table className="w-full text-sm border-t mt-2">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">SP</th>
                  <th className="py-2 text-center">SL</th>
                  <th className="py-2 text-right">TT</th>
                </tr>
              </thead>
              <tbody>
                {(detail.items || []).map((it, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2">{it.tenmathang || `#${it.mathang_id}`}</td>
                    <td className="py-2 text-center">{it.soluong}</td>
                    <td className="py-2 text-right text-red-600">{formatPrice(it.thanhtien)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-right font-bold text-red-600 mt-2">Tổng: {formatPrice(detail.tongtien)}</p>
            <button onClick={() => setDetail(null)} className="mt-4 w-full border py-2 rounded-lg">Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}
