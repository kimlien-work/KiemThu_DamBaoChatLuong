"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { products, addOrder } from "@/data/mock";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

function formatPrice(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [diachi, setDiachi] = useState("");
  const [ghichu, setGhichu] = useState("");
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState(0);

  useEffect(() => {
    if (user) setDiachi(user.diachi || "");
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="mb-4">Vui lòng đăng nhập để thanh toán.</p>
        <button
          onClick={() => router.push("/login")}
          className="bg-cyan-600 text-white px-6 py-2 rounded"
        >
          Đăng nhập
        </button>
      </div>
    );
  }

  const items = cart
    .map((c) => {
      const p = products.find((x) => x.id === c.id);
      return p ? { ...p, soluong: c.soluong } : null;
    })
    .filter(Boolean) as (typeof products[0] & { soluong: number })[];

  const tongtien = items.reduce((s, i) => s + i.giaban * i.soluong, 0);

  if (items.length === 0 && !done) {
    return (
      <div className="text-center py-12">
        <p>Giỏ hàng trống.</p>
        <button onClick={() => router.push("/")} className="mt-4 text-cyan-600 underline">
          Về trang chủ
        </button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diachi.trim()) {
      alert("Vui lòng nhập địa chỉ giao hàng");
      return;
    }
    const order = {
      id: Date.now(),
      khach_hang_id: user.id,
      ngaydat: new Date().toISOString(),
      tongtien,
      diachi,
      ghichu,
      trangthai: "Chờ xử lý",
      items: items.map((i) => ({
        mathang_id: i.id,
        dongia: i.giaban,
        soluong: i.soluong,
        thanhtien: i.giaban * i.soluong,
        tenmathang: i.tenmathang,
        hinhanh: i.hinhanh,
      })),
    };
    addOrder(order);
    // save to localStorage for persistence in demo
    const saved = JSON.parse(localStorage.getItem("orders") || "[]");
    saved.push(order);
    localStorage.setItem("orders", JSON.stringify(saved));
    clearCart();
    setOrderId(order.id);
    setDone(true);
  };

  if (done) {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <p className="text-5xl mb-4">✅</p>
        <h2 className="text-2xl font-bold text-green-600 mb-2">Đặt hàng thành công!</h2>
        <p className="text-gray-600 mb-1">Mã đơn hàng: <strong>#{orderId}</strong></p>
        <p className="text-gray-600 mb-6">Chúng tôi sẽ liên hệ và giao hàng sớm nhất (COD).</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push("/orders")}
            className="bg-cyan-600 text-white px-5 py-2 rounded"
          >
            Xem đơn hàng
          </button>
          <button
            onClick={() => router.push("/")}
            className="border px-5 py-2 rounded"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-cyan-700 mb-6">Thanh toán (COD)</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white border rounded-lg p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium mb-1">Họ tên</label>
          <input
            type="text"
            value={user.ten}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Điện thoại</label>
          <input
            type="text"
            value={user.dien_thoai}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Địa chỉ giao hàng *</label>
          <textarea
            value={diachi}
            onChange={(e) => setDiachi(e.target.value)}
            rows={3}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ghi chú</label>
          <input
            type="text"
            value={ghichu}
            onChange={(e) => setGhichu(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Ghi chú thêm (nếu có)"
          />
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Đơn hàng ({items.length} sản phẩm)</h3>
          {items.map((i) => (
            <div key={i.id} className="flex justify-between text-sm py-1">
              <span>
                {i.tenmathang} × {i.soluong}
              </span>
              <span className="text-red-600">{formatPrice(i.giaban * i.soluong)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
            <span>Tổng thanh toán</span>
            <span className="text-red-600">{formatPrice(tongtien)}</span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-red-500 text-white py-3 rounded font-bold hover:bg-red-600"
        >
          Xác nhận đặt hàng
        </button>
      </form>
    </div>
  );
}
