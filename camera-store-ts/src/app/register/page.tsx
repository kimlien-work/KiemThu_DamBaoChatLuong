"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    ten: "", tendangnhap: "", matkhau: "", xacnhanmatkhau: "", email: "", dien_thoai: "", diachi: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (form.matkhau !== form.xacnhanmatkhau) {
      setLoading(false);
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    const err = await register({
      ten: form.ten,
      tendangnhap: form.tendangnhap,
      matkhau: form.matkhau,
      email: form.email,
      dien_thoai: form.dien_thoai,
      diachi: form.diachi,
    });
    setLoading(false);
    if (err) setError(err);
    else router.push("/");
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-cyan-700 mb-6 text-center">Đăng ký</h1>
      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 shadow-sm space-y-4">
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded">{error}</div>}
        {([
          ["ten", "Họ tên"],
          ["tendangnhap", "Tên đăng nhập"],
          ["matkhau", "Mật khẩu"],
          ["xacnhanmatkhau", "Xác nhận mật khẩu"],
          ["email", "Email"],
          ["dien_thoai", "Điện thoại"],
          ["diachi", "Địa chỉ"],
        ] as const).map(([key, label]) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <div className={key === "matkhau" || key === "xacnhanmatkhau" ? "flex" : undefined}>
              <input
                type={key === "matkhau" || key === "xacnhanmatkhau" ? (showPassword ? "text" : "password") : key === "dien_thoai" ? "tel" : key === "email" ? "email" : "text"}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className={`w-full border px-3 py-2 ${key === "matkhau" || key === "xacnhanmatkhau" ? "min-w-0 flex-1 rounded-l" : "rounded"} ${key === "matkhau" || key === "xacnhanmatkhau" ? "rounded-r-none" : ""}`}
                required={key !== "email"}
                {...(key === "email" ? {
                  title: "Vui lòng nhập email đúng định dạng, ví dụ ten@example.com",
                } : {})}
                {...(key === "dien_thoai" ? {
                  inputMode: "numeric" as const,
                  maxLength: 12,
                  pattern: "[0-9]{10,12}",
                  title: "Số điện thoại phải có từ 10 đến 12 chữ số, không chứa khoảng trắng hoặc ký tự khác",
                } : {})}
              />
              {(key === "matkhau" || key === "xacnhanmatkhau") && (
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="border border-l-0 rounded-r px-3 text-sm text-cyan-700 hover:bg-gray-50" aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>
                  {showPassword ? "Ẩn" : "Hiện"}
                </button>
              )}
            </div>
          </div>
        ))}
        <button type="submit" disabled={loading} className="w-full bg-cyan-600 text-white py-2.5 rounded font-medium hover:bg-cyan-700 disabled:opacity-50">
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>
        <p className="text-center text-sm text-gray-500">
          Đã có tài khoản? <Link href="/login" className="text-cyan-600 hover:underline">Đăng nhập</Link>
        </p>
      </form>
    </div>
  );
}
