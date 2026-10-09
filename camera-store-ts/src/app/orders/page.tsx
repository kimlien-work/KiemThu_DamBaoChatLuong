"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Order } from "@/types";

function formatPrice(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    const all = JSON.parse(localStorage.getItem("orders") || "[]") as Order[];
    setOrders(all.filter((o) => o.khach_hang_id === user.id).reverse());
  }, [user, router]);

  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-cyan-700 mb-6">Đơn hàng của tôi</h1>
      {orders.length === 0 ? (
        <p className="text-center text-gray-500 py-12">Bạn chưa có đơn hàng nào.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex flex-wrap justify-between gap-2 mb-2">
                <span className="font-medium">#{o.id}</span>
                <span className="text-sm text-gray-500">
                  {new Date(o.ngaydat).toLocaleString("vi-VN")}
                </span>
                <span className="text-sm bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                  {o.trangthai}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Địa chỉ: {o.diachi}</p>
              <p className="font-bold text-red-600 mb-2">{formatPrice(o.tongtien)}</p>
              <Link
                href={`/orders/${o.id}`}
                className="text-sm text-cyan-600 hover:underline"
              >
                Xem chi tiết →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
