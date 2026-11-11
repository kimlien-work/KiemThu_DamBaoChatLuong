"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { isValidPassword } from "@/lib/utils";

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ ten: "", email: "", dien_thoai: "", dia_chi: "" });
  const [msg, setMsg] = useState("");
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    setForm({
      ten: user.ten || "",
      email: user.email || "",
      dien_thoai: user.dien_thoai || "",
      dia_chi: user.dia_chi || "",
    });
  }, [user, router]);

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(form);
    setMsg("Cập nhật thành công!");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg("");
    setPasswordError("");
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError("Mật khẩu xác nhận không khớp");
      return;
    }
    if (!isValidPassword(passwordForm.next)) {
      setPasswordError("Mật khẩu mới phải có ít nhất 8 ký tự, gồm 1 chữ viết hoa và 1 ký tự đặc biệt");
      return;
    }

    setChangingPassword(true);
    const error = await changePassword(passwordForm.current, passwordForm.next);
    setChangingPassword(false);
    if (error) {
      setPasswordError(error);
      return;
    }
    setPasswordForm({ current: "", next: "", confirm: "" });
    setPasswordMsg("Đổi mật khẩu thành công!");
  };

  const passwordFields = [
    ["current", "Mật khẩu hiện tại"],
    ["next", "Mật khẩu mới"],
    ["confirm", "Xác nhận mật khẩu mới"],
  ] as const;

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-cyan-700 mb-6">Hồ sơ của tôi</h1>
      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 shadow-sm space-y-4">
        {msg && <div className="bg-green-50 text-green-700 text-sm p-3 rounded">{msg}</div>}
        <div>
          <label className="block text-sm font-medium mb-1">Tên đăng nhập</label>
          <input type="text" value={user.tendangnhap || ""} disabled className="w-full border rounded px-3 py-2 bg-gray-50" />
        </div>
        {([
          ["ten", "Họ tên"],
          ["email", "Email"],
          ["dien_thoai", "Điện thoại"],
          ["dia_chi", "Địa chỉ"],
        ] as const).map(([key, label]) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input
              type={key === "dien_thoai" ? "tel" : key === "email" ? "email" : "text"}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="w-full border rounded px-3 py-2"
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
          </div>
        ))}
        <button type="submit" className="w-full bg-cyan-600 text-white py-2.5 rounded font-medium hover:bg-cyan-700">
          Lưu thay đổi
        </button>
      </form>

      <h2 className="text-xl font-bold text-cyan-700 mt-8 mb-4">Đổi mật khẩu</h2>
      <form onSubmit={handleChangePassword} className="bg-white border rounded-lg p-6 shadow-sm space-y-4">
        {passwordMsg && <div className="bg-green-50 text-green-700 text-sm p-3 rounded">{passwordMsg}</div>}
        {passwordError && <div className="bg-red-50 text-red-600 text-sm p-3 rounded">{passwordError}</div>}
        {passwordFields.map(([key, label]) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <div className="flex">
              <input
                type={showPasswords ? "text" : "password"}
                value={passwordForm[key]}
                onChange={(e) => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                className="min-w-0 flex-1 border rounded-l px-3 py-2"
                required
                {...(key === "next" ? {
                  minLength: 8,
                  title: "Mật khẩu cần ít nhất 8 ký tự, gồm 1 chữ viết hoa và 1 ký tự đặc biệt",
                } : {})}
              />
              {key === "current" && (
                <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="border border-l-0 rounded-r px-3 text-sm text-cyan-700 hover:bg-gray-50" aria-label={showPasswords ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>
                  {showPasswords ? "Ẩn" : "Hiện"}
                </button>
              )}
            </div>
            {key === "next" && (
              <p className="mt-1 text-xs text-gray-500">
                Tối thiểu 8 ký tự, gồm ít nhất 1 chữ viết hoa và 1 ký tự đặc biệt.
              </p>
            )}
          </div>
        ))}
        <button type="submit" disabled={changingPassword} className="w-full bg-cyan-600 text-white py-2.5 rounded font-medium hover:bg-cyan-700 disabled:opacity-50">
          {changingPassword ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
        </button>
      </form>
    </div>
  );
}
