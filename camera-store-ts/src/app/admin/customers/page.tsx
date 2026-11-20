"use client";

import { useCallback, useEffect, useState } from "react";
import type { Customer } from "@/types";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminCustomersPage() {
  const [list, setList] = useState<Customer[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "locked">("all");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const { admin } = useAdminAuth();
  const isAdmin = admin?.chucvu_id === 1;

  const load = useCallback(async (keyword = "", selectedStatus: "all" | "active" | "locked" = "all") => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (keyword) params.set("q", keyword);
      if (selectedStatus !== "all") params.set("status", selectedStatus);
      const query = params.toString();
      const res = await fetch(`/api/admin/customers${query ? `?${query}` : ""}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể tải dữ liệu khách hàng.");
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      setList([]);
      setError(e instanceof Error ? e.message : "Không thể tải dữ liệu khách hàng.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load("", "all"); }, [load]);

  const toggle = async (id: number, current: number) => {
    if (!isAdmin || processingId !== null) return;
    const nextStatus = current ? 0 : 1;
    const action = current ? "khóa" : "mở khóa";
    if (!window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản khách hàng #${id} không?`)) return;

    setProcessingId(id);
    setError("");
    try {
      const res = await fetch("/api/admin/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, trangthai: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể cập nhật trạng thái tài khoản.");
      await load(searchQuery, status);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể cập nhật trạng thái tài khoản.");
    } finally {
      setProcessingId(null);
    }
  };

  const search = (event: React.FormEvent) => {
    event.preventDefault();
    const keyword = searchInput.trim();
    setSearchQuery(keyword);
    load(keyword, status);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    load("", status);
  };

  const changeStatus = (nextStatus: "all" | "active" | "locked") => {
    setStatus(nextStatus);
    load(searchQuery, nextStatus);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Quản lý khách hàng</h1>
      <form onSubmit={search} className="mb-4 flex flex-wrap gap-2">
        <input
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Tìm theo tên, SĐT hoặc mã khách hàng..."
          className="min-w-[280px] flex-1 rounded-lg border px-3 py-2"
        />
        {searchInput && (
          <button type="button" onClick={clearSearch} className="rounded-lg border px-4 py-2 text-slate-600">
            Xóa
          </button>
        )}
        <button type="submit" className="rounded-lg border border-cyan-600 px-4 py-2 text-cyan-700">
          Tìm kiếm
        </button>
        <select
          value={status}
          onChange={(event) => changeStatus(event.target.value as "all" | "active" | "locked")}
          className="rounded-lg border px-3 py-2"
          aria-label="Lọc trạng thái khách hàng"
        >
          <option value="all">Tất cả khách hàng</option>
          <option value="active">Đang hoạt động</option>
          <option value="locked">Đã khóa</option>
        </select>
      </form>
      {loading && <p className="mb-4 text-slate-500">Đang tải danh sách khách hàng...</p>}
      {error && <p className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Họ tên</th>
              <th className="p-3">Đăng nhập</th>
              <th className="p-3">SĐT</th>
              <th className="p-3">Email</th>
              <th className="p-3">Địa chỉ</th>
              <th className="p-3">Điểm tích lũy</th>
              <th className="p-3">TT</th>
              <th className="p-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {!loading && !error && list.length === 0 && (
              <tr>
                <td colSpan={9} className="p-6 text-center text-slate-500">
                  Không tìm thấy khách hàng phù hợp.
                </td>
              </tr>
            )}
            {list.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3">{c.id}</td>
                <td className="p-3 font-medium">{c.ten}</td>
                <td className="p-3">{c.tendangnhap}</td>
                <td className="p-3">{c.dien_thoai}</td>
                <td className="p-3">{c.email}</td>
                <td className="p-3 max-w-[160px] truncate">{c.dia_chi}</td>
                <td className="p-3 font-medium">{Number(c.diem_tich_luy || 0).toLocaleString("vi-VN")}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${c.trangthai ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {c.trangthai ? "Active" : "Khóa"}
                  </span>
                </td>
                <td className="p-3">
                  {isAdmin && (
                    <button
                      onClick={() => toggle(c.id, c.trangthai)}
                      disabled={processingId === c.id}
                      className="text-sm text-cyan-600 hover:underline disabled:opacity-50"
                    >
                      {processingId === c.id ? "Đang xử lý..." : c.trangthai ? "Khóa" : "Mở"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
