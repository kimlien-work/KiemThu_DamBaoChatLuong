"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import type { Staff } from "@/types";

export default function AdminStaffPage() {
  const [list, setList] = useState<Staff[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ten: "", dien_thoai: "", email: "" });
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    ten: "",
    tendangnhap: "",
    mat_khau: "",
    chucvu_id: 2,
    dien_thoai: "",
    email: "",
  });
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [updateErrors, setUpdateErrors] = useState<Record<string, string>>({});
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
    setShowCreate(false);
    setEditingId(staff.id);
    setForm({
      ten: staff.ten,
      dien_thoai: staff.dien_thoai || "",
      email: staff.email || "",
    });
    setError("");
    setNotice("");
    setUpdateErrors({});
  };

  const validateCreate = () => {
    const errors: Record<string, string> = {};
    if (!createForm.ten.trim()) errors.ten = "Vui lòng nhập họ và tên nhân viên.";
    else if (createForm.ten.trim().length > 100) errors.ten = "Nội dung vượt quá số ký tự cho phép.";

    if (!createForm.tendangnhap.trim()) errors.tendangnhap = "Vui lòng nhập tên đăng nhập.";
    else if (createForm.tendangnhap.trim().length > 50) errors.tendangnhap = "Nội dung vượt quá số ký tự cho phép.";

    if (!createForm.mat_khau.trim()) errors.mat_khau = "Vui lòng nhập mật khẩu.";
    else if (createForm.mat_khau.length > 255) errors.mat_khau = "Nội dung vượt quá số ký tự cho phép.";

    if (!Number.isSafeInteger(createForm.chucvu_id) || createForm.chucvu_id < 1) {
      errors.chucvu_id = "Vui lòng chọn chức vụ.";
    }
    if (createForm.dien_thoai.trim().length > 15) {
      errors.dien_thoai = "Nội dung vượt quá số ký tự cho phép.";
    }
    if (createForm.email.trim()) {
      if (createForm.email.trim().length > 80) {
        errors.email = "Nội dung vượt quá số ký tự cho phép.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email.trim())) {
        errors.email = "Địa chỉ email không hợp lệ.";
      }
    }
    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateCreate()) return;

    setLoading(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ten: createForm.ten,
          tendangnhap: createForm.tendangnhap,
          mat_khau: createForm.mat_khau,
          chucvu_id: createForm.chucvu_id,
          dien_thoai: createForm.dien_thoai,
          email: createForm.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.field) setCreateErrors({ [data.field]: data.error });
        throw new Error(data.error || "Không thể thêm nhân viên");
      }
      const staff = data.staff as Staff;
      setList((current) => [staff, ...current]);
      setCreateForm({
        ten: "",
        tendangnhap: "",
        mat_khau: "",
        chucvu_id: 2,
        dien_thoai: "",
        email: "",
      });
      setCreateErrors({});
      setShowCreate(false);
      setNotice("Đã thêm nhân viên.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể thêm nhân viên");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editingId === null) return;
    const errors: Record<string, string> = {};
    if (!form.ten.trim()) errors.ten = "Vui lòng nhập họ và tên nhân viên.";
    else if (form.ten.trim().length > 100) errors.ten = "Nội dung vượt quá số ký tự cho phép.";
    if (form.dien_thoai.trim().length > 15) errors.dien_thoai = "Nội dung vượt quá số ký tự cho phép.";
    if (form.email.trim()) {
      if (form.email.trim().length > 80) errors.email = "Nội dung vượt quá số ký tự cho phép.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "Địa chỉ email không hợp lệ.";
    }
    setUpdateErrors(errors);
    if (Object.keys(errors).length > 0) return;

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
      if (!res.ok) {
        if (data.field) setUpdateErrors({ [data.field]: data.error });
        throw new Error(data.error || "Không thể cập nhật thông tin");
      }
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
      {admin?.chucvu_id === 1 && !showCreate && (
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setCreateErrors({});
            setShowCreate(true);
          }}
          className="mb-4 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white"
        >
          Thêm nhân viên
        </button>
      )}
      {showCreate && (
        <form onSubmit={handleCreate} className="mb-6 max-w-xl rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-800">Thêm nhân viên</h2>
          {([
            ["ten", "Họ tên *", "text", 100],
            ["tendangnhap", "Tên đăng nhập *", "text", 50],
            ["mat_khau", "Mật khẩu *", "password", 255],
          ] as const).map(([key, label, type, maxLength]) => (
            <label key={key} className="mb-3 block text-sm font-medium">
              {label}
              <input
                type={type}
                required
                maxLength={maxLength}
                value={createForm[key]}
                onChange={(event) => setCreateForm({ ...createForm, [key]: event.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
              {createErrors[key] && <span className="mt-1 block text-xs text-red-600">{createErrors[key]}</span>}
            </label>
          ))}
          <label className="mb-3 block text-sm font-medium">
            Chức vụ *
            <select
              value={createForm.chucvu_id}
              onChange={(event) => setCreateForm({ ...createForm, chucvu_id: Number(event.target.value) })}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              <option value={1}>Quản trị</option>
              <option value={2}>Nhân viên</option>
            </select>
            {createErrors.chucvu_id && <span className="mt-1 block text-xs text-red-600">{createErrors.chucvu_id}</span>}
          </label>
          {([
            ["dien_thoai", "Số điện thoại", "tel", 15],
            ["email", "Email", "email", 80],
          ] as const).map(([key, label, type, maxLength]) => (
            <label key={key} className="mb-3 block text-sm font-medium">
              {label}
              <input
                type={type}
                maxLength={maxLength}
                value={createForm[key]}
                onChange={(event) => setCreateForm({ ...createForm, [key]: event.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
              {createErrors[key] && <span className="mt-1 block text-xs text-red-600">{createErrors[key]}</span>}
            </label>
          ))}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreate(false);
                setCreateErrors({});
              }}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Hủy
            </button>
          </div>
        </form>
      )}
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
            {updateErrors.ten && <span className="mt-1 block text-xs text-red-600">{updateErrors.ten}</span>}
          </label>
          <label className="mb-3 block text-sm font-medium">
            Số điện thoại
            <input
              maxLength={15}
              value={form.dien_thoai}
              onChange={(event) => setForm({ ...form, dien_thoai: event.target.value })}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
            {updateErrors.dien_thoai && <span className="mt-1 block text-xs text-red-600">{updateErrors.dien_thoai}</span>}
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
            {updateErrors.email && <span className="mt-1 block text-xs text-red-600">{updateErrors.email}</span>}
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
