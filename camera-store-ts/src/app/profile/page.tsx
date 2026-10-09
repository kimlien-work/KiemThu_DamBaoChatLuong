"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    ten: "",
    email: "",
    dien_thoai: "",
    diachi: "",
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    setForm({
      ten: user.ten,
      email: user.email,
      dien_thoai: user.dien_thoai,
      diachi: user.diachi,
    });
  }, [user, router]);

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(form);
    setMsg("Cập nhật thành công!");
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-cyan-700 mb-6">Hồ sơ của tôi</h1>
      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 shadow-sm space-y-4">
        {msg && <div className="bg-green-50 text-green-700 text-sm p-3 rounded">{msg}</div>}
        <div>
          <label className="block text-sm font-medium mb-1">Tên đăng nhập</label>
          <input
            type="text"
            value={user.tendangnhap}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-50"
          />
        </div>
        {(
          [
            ["ten", "Họ tên"],
            ["email", "Email"],
            ["dien_thoai", "Điện thoại"],
            ["diachi", "Địa chỉ"],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input
              type="text"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
        ))}
        <button
          type="submit"
          className="w-full bg-cyan-600 text-white py-2.5 rounded font-medium hover:bg-cyan-700"
        >
          Lưu thay đổi
        </button>
      </form>
    </div>
  );
}
