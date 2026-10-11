"use client";

import { useAdminAuth } from "@/context/AdminAuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const err = await login(username, password);
    setLoading(false);
    if (err) setError(err);
    else router.push("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">📷 Camera Store</h1>
          <p className="text-slate-500 mt-1">Đăng nhập trang quản trị</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Tên đăng nhập (Email)</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="abc@abc.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 text-white py-2.5 rounded-lg font-medium hover:bg-cyan-700 disabled:opacity-50"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
        <p className="text-xs text-slate-400 text-center mt-4">
          Demo: abc@abc.com / abc
        </p>
      </div>
    </div>
  );
}
