"use client";

import { useEffect, useState } from "react";
import type { Category } from "@/types";

export default function AdminCategoriesPage() {
  const [list, setList] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const load = (keyword = "") => {
    const query = keyword.trim();
    const url = query
      ? `/api/admin/categories?q=${encodeURIComponent(query)}`
      : "/api/admin/categories";
    fetch(url).then((r) => r.json()).then((d) => Array.isArray(d) && setList(d));
  };
  useEffect(() => { load(); }, []);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const keyword = searchInput.trim();
    setSearchQuery(keyword);
    load(keyword);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    load();
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tendanhmuc: name }),
    });
    setName("");
    load(searchQuery);
  };

  const saveEdit = async (id: number) => {
    await fetch("/api/admin/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, tendanhmuc: editName }),
    });
    setEditId(null);
    load(searchQuery);
  };

  const remove = async (id: number) => {
    if (!confirm("Xóa danh mục này?")) return;
    await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
    load(searchQuery);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Quản lý danh mục</h1>
      <form onSubmit={add} className="flex gap-2 mb-6">
        <input
          className="flex-1 border rounded-lg px-3 py-2"
          placeholder="Tên danh mục mới..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit" className="bg-cyan-600 text-white px-5 py-2 rounded-lg">Thêm</button>
      </form>
      <form onSubmit={search} className="flex gap-2 mb-4">
        <input
          type="search"
          className="flex-1 border rounded-lg px-3 py-2"
          placeholder="Tìm kiếm danh mục theo tên..."
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            if (!e.target.value) {
              setSearchQuery("");
              load();
            }
          }}
        />
        {searchInput && (
          <button type="button" onClick={clearSearch} className="border px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50">
            Xóa
          </button>
        )}
        <button type="submit" className="border border-cyan-600 text-cyan-700 px-5 py-2 rounded-lg hover:bg-cyan-50">
          Tìm kiếm
        </button>
      </form>
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Tên danh mục</th>
              <th className="p-3 w-40">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={3} className="p-6 text-center text-slate-500">
                  Không tìm thấy danh mục phù hợp.
                </td>
              </tr>
            )}
            {list.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3">{c.id}</td>
                <td className="p-3">
                  {editId === c.id ? (
                    <input className="border rounded px-2 py-1 w-full" value={editName}
                      onChange={(e) => setEditName(e.target.value)} />
                  ) : (
                    <span className="font-medium">{c.tendanhmuc}</span>
                  )}
                </td>
                <td className="p-3 space-x-2">
                  {editId === c.id ? (
                    <>
                      <button onClick={() => saveEdit(c.id)} className="text-cyan-600">Lưu</button>
                      <button onClick={() => setEditId(null)} className="text-slate-500">Hủy</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditId(c.id); setEditName(c.tendanhmuc); }} className="text-amber-600">Sửa</button>
                      <button onClick={() => remove(c.id)} className="text-red-600">Xóa</button>
                    </>
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
