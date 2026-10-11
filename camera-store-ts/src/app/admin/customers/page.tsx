"use client";

import { useEffect, useState } from "react";
import type { Customer } from "@/types";

export default function AdminCustomersPage() {
  const [list, setList] = useState<Customer[]>([]);

  const load = () => {
    fetch("/api/admin/customers").then((r) => r.json()).then((d) => Array.isArray(d) && setList(d));
  };
  useEffect(() => { load(); }, []);

  const toggle = async (id: number, current: number) => {
    await fetch("/api/admin/customers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, trangthai: current ? 0 : 1 }),
    });
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Quản lý khách hàng</h1>
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
              <th className="p-3">TT</th>
              <th className="p-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3">{c.id}</td>
                <td className="p-3 font-medium">{c.ten}</td>
                <td className="p-3">{c.tendangnhap}</td>
                <td className="p-3">{c.dien_thoai}</td>
                <td className="p-3">{c.email}</td>
                <td className="p-3 max-w-[160px] truncate">{c.dia_chi}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${c.trangthai ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {c.trangthai ? "Active" : "Khóa"}
                  </span>
                </td>
                <td className="p-3">
                  <button onClick={() => toggle(c.id, c.trangthai)} className="text-sm text-cyan-600 hover:underline">
                    {c.trangthai ? "Khóa" : "Mở"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
