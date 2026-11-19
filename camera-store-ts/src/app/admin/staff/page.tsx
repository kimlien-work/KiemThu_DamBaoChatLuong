"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import type { Staff } from "@/types";

export default function AdminStaffPage() {
  const [list, setList] = useState<Staff[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ten: "", dien_thoai: "", email: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const { admin, updateAdmin } = useAdminAuth();

  useEffect(() => {
    let active = true;
    fetch("/api/admin/staff")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Không thể tải thông tin nhân viên");
        if (active && Array.isArray(data)) setList(data);
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : "Không thể tải thông tin nhân viên");
      });
    return () => {
      active = false;
    };
  }, []);

  const startEditing = (staff: Staff) => {
    setEditingId(staff.id);
    setForm({
      ten: staff.ten,
      dien_thoai: staff.dien_thoai || "",
      email: staff.email || "",
    });
    setError("");
    setNotice("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editingId === null) return;
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch(`/api/admin/staff/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể cập nhật thông tin");
      const updated = data.staff as Staff;
      setList((current) => current.map((staff) => (staff.id === updated.id ? updated : staff)));
      updateAdmin(updated);
      setEditingId(null);
      setNotice("Đã cập nhật thông tin nhân viên.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">
        {admin?.chucvu_id === 1 ? "Quản lý nhân viên" : "Thông tin nhân viên"}
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        Nhân viên chỉ xem và cập nhật được hồ sơ của mình.
      </p>
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{notice}</p>}
      {editingId !== null && (
        <form onSubmit={handleSubmit} className="mb-6 max-w-xl rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-800">
            Cập nhật hồ sơ {list.find((staff) => staff.id === editingId)?.ma_nhan_vien}
          </h2>
          <label className="mb-3 block text-sm font-medium">
            Họ tên
            <input
              required
              maxLength={100}
              value={form.ten}
              onChange={(event) => setForm({ ...form, ten: event.target.value })}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="mb-3 block text-sm font-medium">
            Số điện thoại
            <input
              maxLength={15}
              value={form.dien_thoai}
              onChange={(event) => setForm({ ...form, dien_thoai: event.target.value })}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="mb-4 block text-sm font-medium">
            Email
            <input
              type="email"
              maxLength={80}
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Hủy
            </button>
          </div>
        </form>
      )}
      <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3">Mã nhân viên</th>
              <th className="p-3">Họ tên</th>
              <th className="p-3">Đăng nhập</th>
              <th className="p-3">Chức vụ</th>
              <th className="p-3">SĐT</th>
              <th className="p-3">Email</th>
              <th className="p-3">TT</th>
              <th className="p-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-3 font-mono">{s.ma_nhan_vien}</td>
                <td className="p-3 font-medium">{s.ten}</td>
                <td className="p-3">{s.tendangnhap}</td>
                <td className="p-3">{s.ten_chuc_vu || s.chucvu_id}</td>
                <td className="p-3">{s.dien_thoai}</td>
                <td className="p-3">{s.email}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${s.trangthai ? "bg-green-100 text-green-700" : "bg-gray-100"}`}>
                    {s.trangthai ? "Active" : "Off"}
                  </span>
                </td>
                <td className="p-3">
                  {(admin?.chucvu_id === 1 || admin?.id === s.id) && (
                    <button
                      type="button"
                      onClick={() => startEditing(s)}
                      className="text-cyan-700 hover:underline"
                    >
                      Sửa
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
