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
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryId, setCategoryId] = useState(0);
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (
    keyword = searchQuery,
    selectedCategory = categoryId,
    selectedSort = sort
  ) => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    if (selectedCategory > 0) params.set("categoryId", String(selectedCategory));
    if (selectedSort !== "default") params.set("sort", selectedSort);

    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch(`/api/admin/products${params.size ? `?${params}` : ""}`, { cache: "no-store" }),
        fetch("/api/admin/categories", { cache: "no-store" }),
      ]);
      const [productsData, categoriesData] = await Promise.all([
        productsResponse.json(),
        categoriesResponse.json(),
      ]);

      if (!productsResponse.ok) {
        throw new Error(productsData.error || "Không thể tải danh sách mặt hàng.");
      }
      if (!categoriesResponse.ok) {
        throw new Error(categoriesData.error || "Không thể tải danh mục.");
      }

      setProducts(Array.isArray(productsData) ? productsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (e) {
      setProducts([]);
      setError(
        e instanceof Error
          ? e.message
          : "Không thể tải danh sách mặt hàng. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const keyword = searchInput.trim();
    setSearchQuery(keyword);
    load(keyword, categoryId, sort);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    load("", categoryId, sort);
  };

  const changeCategory = (value: number) => {
    setCategoryId(value);
    load(searchQuery, value, sort);
  };

  const changeSort = (value: string) => {
    setSort(value);
    load(searchQuery, categoryId, value);
  };

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

      <form onSubmit={submitSearch} className="bg-white border rounded-xl p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px_220px_auto] gap-3">
          <input
            type="search"
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Tìm kiếm mặt hàng theo tên..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              if (!e.target.value) {
                setSearchQuery("");
                load("", categoryId, sort);
              }
            }}
          />
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={categoryId}
            onChange={(e) => changeCategory(Number(e.target.value))}
            aria-label="Lọc theo danh mục"
          >
            <option value={0}>Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.tendanhmuc}</option>
            ))}
          </select>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={sort}
            onChange={(e) => changeSort(e.target.value)}
            aria-label="Sắp xếp mặt hàng"
          >
            <option value="default">Mặc định</option>
            <option value="name_asc">Tên: A → Z</option>
            <option value="name_desc">Tên: Z → A</option>
            <option value="price_asc">Giá: thấp → cao</option>
            <option value="price_desc">Giá: cao → thấp</option>
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
          </select>
          <div className="flex gap-2">
            {searchInput && (
              <button type="button" onClick={clearSearch} className="border px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50">
                Xóa
              </button>
            )}
            <button type="submit" className="border border-cyan-600 text-cyan-700 px-4 py-2 rounded-lg hover:bg-cyan-50">
              Tìm kiếm
            </button>
          </div>
        </div>
      </form>

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

      {loading && (
        <div className="bg-white border rounded-xl p-8 text-center text-slate-500 shadow-sm">
          Đang tải danh sách mặt hàng...
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center shadow-sm">
          <p className="text-red-700 mb-3">Không thể tải danh sách mặt hàng. Vui lòng thử lại sau.</p>
          <button
            type="button"
            onClick={() => load(searchQuery, categoryId, sort)}
            className="border border-red-300 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100"
          >
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && (
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
            {products.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-500">
                  Không tìm thấy mặt hàng phù hợp.
                </td>
              </tr>
            )}
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
      )}
    </div>
  );
}
