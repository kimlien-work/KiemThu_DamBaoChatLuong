"use client";

import { useEffect, useState } from "react";
import type { Product, Category } from "@/types";
import { formatPrice, imageUrl } from "@/lib/utils";

const empty = {
  tenmathang: "",
  mota: "",
  giagoc: 0,
  giaban: 0,
  soluongton: 0,
  hinhanh: "",
  danhmuc_id: 0,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState("");

  const load = () => {
    fetch("/api/admin/products").then((r) => r.json()).then((d) => Array.isArray(d) && setProducts(d));
    fetch("/api/admin/categories").then((r) => r.json()).then((d) => Array.isArray(d) && setCategories(d));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditId(null);
    setForm({ ...empty, danhmuc_id: categories[0]?.id || 0 });
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({
      tenmathang: p.tenmathang,
      mota: p.mota || "",
      giagoc: Number(p.giagoc),
      giaban: Number(p.giaban),
      soluongton: p.soluongton,
      hinhanh: p.hinhanh || "",
      danhmuc_id: p.danhmuc_id,
    });
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editId ? "PUT" : "POST";
    const body = editId ? { id: editId, ...form } : form;
    const res = await fetch("/api/admin/products", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setMsg(editId ? "Đã cập nhật" : "Đã thêm sản phẩm");
      setShowForm(false);
      load();
    } else {
      const d = await res.json();
      setMsg(d.error || "Lỗi");
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Xóa sản phẩm này?")) return;
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    load();
  };

  const catName = (id: number) => categories.find((c) => c.id === id)?.tendanhmuc || id;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý sản phẩm</h1>
        <button onClick={openAdd} className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700">
          + Thêm sản phẩm
        </button>
      </div>
      {msg && <p className="mb-3 text-sm text-green-600">{msg}</p>}

      {showForm && (
        <form onSubmit={save} className="bg-white border rounded-xl p-5 mb-6 shadow-sm space-y-3">
          <h2 className="font-bold text-lg">{editId ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Tên sản phẩm</label>
              <input required className="w-full border rounded px-3 py-2" value={form.tenmathang}
                onChange={(e) => setForm({ ...form, tenmathang: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Danh mục</label>
              <select className="w-full border rounded px-3 py-2" value={form.danhmuc_id}
                onChange={(e) => setForm({ ...form, danhmuc_id: Number(e.target.value) })}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.tendanhmuc}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Giá gốc</label>
              <input type="number" className="w-full border rounded px-3 py-2" value={form.giagoc}
                onChange={(e) => setForm({ ...form, giagoc: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-sm font-medium">Giá bán</label>
              <input type="number" className="w-full border rounded px-3 py-2" value={form.giaban}
                onChange={(e) => setForm({ ...form, giaban: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-sm font-medium">Tồn kho</label>
              <input type="number" className="w-full border rounded px-3 py-2" value={form.soluongton}
                onChange={(e) => setForm({ ...form, soluongton: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-sm font-medium">Đường dẫn ảnh</label>
              <input className="w-full border rounded px-3 py-2" value={form.hinhanh}
                onChange={(e) => setForm({ ...form, hinhanh: e.target.value })}
                placeholder="images/products/..." />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Mô tả</label>
            <textarea className="w-full border rounded px-3 py-2" rows={3} value={form.mota}
              onChange={(e) => setForm({ ...form, mota: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-cyan-600 text-white px-5 py-2 rounded-lg">Lưu</button>
            <button type="button" onClick={() => setShowForm(false)} className="border px-5 py-2 rounded-lg">Hủy</button>
          </div>
        </form>
      )}

      <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Ảnh</th>
              <th className="p-3">Tên</th>
              <th className="p-3">Danh mục</th>
              <th className="p-3">Giá bán</th>
              <th className="p-3">Tồn</th>
              <th className="p-3">TT</th>
              <th className="p-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.id}</td>
                <td className="p-3">
                  <img src={imageUrl(p.hinhanh)} alt="" className="w-12 h-12 object-contain" />
                </td>
                <td className="p-3 font-medium max-w-[200px] truncate">{p.tenmathang}</td>
                <td className="p-3">{catName(p.danhmuc_id)}</td>
                <td className="p-3 text-red-600">{formatPrice(p.giaban)}</td>
                <td className="p-3">{p.soluongton}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${p.trangthai ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {p.trangthai ? "Hiện" : "Ẩn"}
                  </span>
                </td>
                <td className="p-3 space-x-1">
                  <button onClick={() => openEdit(p)} className="text-amber-600 hover:underline">Sửa</button>
                  <button onClick={() => remove(p.id)} className="text-red-600 hover:underline">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
