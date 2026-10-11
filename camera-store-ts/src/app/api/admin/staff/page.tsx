"use client";

import { useEffect, useState } from "react";
import type { Staff } from "@/types";

export default function AdminStaffPage() {
  const [list, setList] = useState<Staff[]>([]);

  useEffect(() => {
    fetch("/api/admin/staff").then((r) => r.json()).then((d) => Array.isArray(d) && setList(d));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Quản lý nhân viên</h1>
      <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Họ tên</th>
              <th className="p-3">Đăng nhập</th>
              <th className="p-3">Chức vụ</th>
              <th className="p-3">SĐT</th>
              <th className="p-3">Email</th>
              <th className="p-3">TT</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-3">{s.id}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
