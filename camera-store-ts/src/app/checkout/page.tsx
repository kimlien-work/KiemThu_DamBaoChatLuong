"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { Product } from "@/types";
import { formatPrice, isValidAddress, isValidFullName, isValidPhoneNumber } from "@/lib/utils";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [nguoiNhan, setNguoiNhan] = useState("");
  const [sdtNhan, setSdtNhan] = useState("");
  const [diachi, setDiachi] = useState("");
  const [ghichu, setGhichu] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setNguoiNhan(user.ten || "");
    setSdtNhan(user.dien_thoai || "");
    if (user.dia_chi) setDiachi(user.dia_chi);
  }, [user]);

  useEffect(() => {
    if (cart.length === 0) return;
    fetch(`/api/products?ids=${cart.map((c) => c.id).join(",")}`)
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setProducts(d); });
  }, [cart]);

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="mb-4">Vui lòng đăng nhập để thanh toán.</p>
        <button onClick={() => router.push("/login")} className="bg-cyan-600 text-white px-6 py-2 rounded">Đăng nhập</button>
      </div>
    );
  }

  const items = cart
    .map((c) => {
      const p = products.find((x) => x.id === c.id);
      return p ? { ...p, soluong: c.soluong } : null;
    })
    .filter(Boolean) as (Product & { soluong: number })[];

  const tongtien = items.reduce((s, i) => s + Number(i.giaban) * i.soluong, 0);

  if (items.length === 0 && !done) {
    return (
      <div className="text-center py-12">
        <p>Giỏ hàng trống.</p>
        <button onClick={() => router.push("/")} className="mt-4 text-cyan-600 underline">Về trang chủ</button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nguoiNhan.trim()) { alert("Vui lòng nhập họ tên người nhận"); return; }
    if (!isValidFullName(nguoiNhan)) { alert("Họ tên người nhận tối đa 100 ký tự"); return; }
    if (!sdtNhan.trim()) { alert("Vui lòng nhập số điện thoại người nhận"); return; }
    if (!isValidPhoneNumber(sdtNhan)) { alert("Số điện thoại người nhận phải có từ 10 đến 12 chữ số"); return; }
    if (!diachi.trim()) { alert("Vui lòng nhập địa chỉ giao hàng"); return; }
    if (!isValidAddress(diachi)) { alert("Địa chỉ giao hàng tối đa 255 ký tự"); return; }
    const overStock = items.find((item) => item.soluong > item.soluongton);
    if (overStock) {
      alert(`Sản phẩm "${overStock.tenmathang}" chỉ còn ${overStock.soluongton} sản phẩm trong kho`);
      router.push("/cart");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          khach_hang_id: user.id,
          tongtien,
          nguoi_nhan: { ten: nguoiNhan.trim(), dien_thoai: sdtNhan, diachi: diachi.trim() },
          ghichu,
          items: items.map((i) => ({
            mathang_id: i.id,
            dongia: Number(i.giaban),
            soluong: i.soluong,
            thanhtien: Number(i.giaban) * i.soluong,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi đặt hàng");
      clearCart();
      setOrderId(data.orderId);
      setDone(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi đặt hàng");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <p className="text-5xl mb-4">✅</p>
        <h2 className="text-2xl font-bold text-green-600 mb-2">Đặt hàng thành công!</h2>
        <p className="text-gray-600 mb-1">Mã đơn hàng: <strong>#{orderId}</strong></p>
        <p className="text-gray-600 mb-6">Chúng tôi sẽ liên hệ và giao hàng sớm nhất (COD).</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => router.push("/orders")} className="bg-cyan-600 text-white px-5 py-2 rounded">Xem đơn hàng</button>
          <button onClick={() => router.push("/")} className="border px-5 py-2 rounded">Về trang chủ</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-cyan-700 mb-6">Thanh toán (COD)</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white border rounded-lg p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium mb-1">Họ tên người nhận *</label>
          <input type="text" value={nguoiNhan} onChange={(e) => setNguoiNhan(e.target.value)} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Số điện thoại người nhận *</label>
          <input type="tel" value={sdtNhan} onChange={(e) => setSdtNhan(e.target.value)} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Địa chỉ giao hàng *</label>
          <textarea value={diachi} onChange={(e) => setDiachi(e.target.value)} rows={3} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ghi chú</label>
          <input type="text" value={ghichu} onChange={(e) => setGhichu(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Ghi chú thêm (nếu có)" />
        </div>
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Đơn hàng ({items.length} sản phẩm)</h3>
          {items.map((i) => (
            <div key={i.id} className="flex justify-between text-sm py-1">
              <span>{i.tenmathang} × {i.soluong}</span>
              <span className="text-red-600">{formatPrice(Number(i.giaban) * i.soluong)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
            <span>Tổng thanh toán</span>
            <span className="text-red-600">{formatPrice(tongtien)}</span>
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-red-500 text-white py-3 rounded font-bold hover:bg-red-600 disabled:opacity-50">
          {loading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
        </button>
      </form>
    </div>
  );
}
