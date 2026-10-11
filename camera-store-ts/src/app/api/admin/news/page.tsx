"use client";

import { useEffect, useState } from "react";
import type { News } from "@/types";

const empty = { tieude: "", tomtat: "", noidung: "", hinhanh: "" };

export default function AdminNewsPage() {
  const [list, setList] = useState<News[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [show, setShow] = useState(false);

  const load = () => {
    fetch("/api/admin/news").then((r) => r.json()).then((d) => Array.isArray(d) && setList(d));
  };
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editId ? "PUT" : "POST";
    const body = editId ? { id: editId, ...form } : form;
    await fetch("/api/admin/news", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setShow(false);
    setEditId(null);
    setForm(empty);
    load();
  };

  const remove = async (id: number) => {
    if (!confirm("Xóa bài viết?")) return;
    await fetch(`/api/admin/news?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý tin tức</h1>
        <button
          onClick={() => { setEditId(null); setForm(empty); setShow(true); }}
          className="bg-cyan-600 text-white px-4 py-2 rounded-lg"
        >
          + Thêm bài viết
        </button>
      </div>

      {show && (
        <form onSubmit={save} className="bg-white border rounded-xl p-5 mb-6 space-y-3 shadow-sm">
          <input required className="w-full border rounded px-3 py-2" placeholder="Tiêu đề"
            value={form.tieude} onChange={(e) => setForm({ ...form, tieude: e.target.value })} />
          <input className="w-full border rounded px-3 py-2" placeholder="Tóm tắt"
            value={form.tomtat} onChange={(e) => setForm({ ...form, tomtat: e.target.value })} />
          <textarea className="w-full border rounded px-3 py-2" rows={5} placeholder="Nội dung"
            value={form.noidung} onChange={(e) => setForm({ ...form, noidung: e.target.value })} />
          <input className="w-full border rounded px-3 py-2" placeholder="URL ảnh"
            value={form.hinhanh} onChange={(e) => setForm({ ...form, hinhanh: e.target.value })} />
          <div className="flex gap-2">
            <button type="submit" className="bg-cyan-600 text-white px-5 py-2 rounded-lg">Lưu</button>
            <button type="button" onClick={() => setShow(false)} className="border px-5 py-2 rounded-lg">Hủy</button>
          </div>
        </form>
      )}

      <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Tiêu đề</th>
              <th className="p-3">Ngày</th>
              <th className="p-3">Xem</th>
              <th className="p-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.map((n) => (
              <tr key={n.id} className="border-t">
                <td className="p-3">{n.id}</td>
                <td className="p-3 font-medium max-w-[280px] truncate">{n.tieude}</td>
                <td className="p-3">{n.ngaydang ? new Date(n.ngaydang).toLocaleDateString("vi-VN") : "—"}</td>
                <td className="p-3">{n.luotxem}</td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => {
                      setEditId(n.id);
                      setForm({
                        tieude: n.tieude,
                        tomtat: n.tomtat || "",
                        noidung: n.noidung || "",
                        hinhanh: n.hinhanh || "",
                      });
                      setShow(true);
                    }}
                    className="text-amber-600"
                  >
                    Sửa
                  </button>
                  <button onClick={() => remove(n.id)} className="text-red-600">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
