"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const ok = await login(username, password);
    setLoading(false);
    if (ok) router.push("/");
    else setError("Tài khoản hoặc mật khẩu không đúng!");
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-cyan-700 mb-6 text-center">Đăng nhập</h1>
      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 shadow-sm space-y-4">
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded">{error}</div>}
        <div>
          <label className="block text-sm font-medium mb-1">Tên đăng nhập</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mật khẩu</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2" required />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-cyan-600 text-white py-2.5 rounded font-medium hover:bg-cyan-700 disabled:opacity-50">
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
        <p className="text-center text-sm text-gray-500">
          Chưa có tài khoản? <Link href="/register" className="text-cyan-600 hover:underline">Đăng ký ngay</Link>
        </p>
      </form>
    </div>
  );
}
