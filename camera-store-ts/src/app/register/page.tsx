"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    ten: "",
    tendangnhap: "",
    matkhau: "",
    email: "",
    dien_thoai: "",
    diachi: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (register(form)) {
      router.push("/");
    } else {
      setError("Tên đăng nhập đã tồn tại!");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-cyan-700 mb-6 text-center">Đăng ký</h1>
      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 shadow-sm space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded">{error}</div>
        )}
        {(
          [
            ["ten", "Họ tên"],
            ["tendangnhap", "Tên đăng nhập"],
            ["matkhau", "Mật khẩu"],
            ["email", "Email"],
            ["dien_thoai", "Điện thoại"],
            ["diachi", "Địa chỉ"],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input
              type={key === "matkhau" ? "password" : key === "email" ? "email" : "text"}
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
          Đăng ký
        </button>
        <p className="text-center text-sm text-gray-500">
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-cyan-600 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
}
