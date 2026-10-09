"use client";

import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Order } from "@/types";
import { formatPrice } from "@/lib/utils";
import { trangThaiText } from "@/types";
import Link from "next/link";

export default function OrderDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    fetch(`/api/orders/${params.id}?customerId=${user.id}`)
      .then((r) => r.json())
      .then((d) => { if (d.id) setOrder(d); });
  }, [user, params.id, router]);

  if (!user) return null;
  if (!order) {
    return (
      <div className="text-center py-12">
        <p>Không tìm thấy đơn hàng.</p>
        <Link href="/orders" className="text-cyan-600 underline mt-2 inline-block">Quay lại</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-cyan-700 mb-6">Chi tiết đơn #{order.id}</h1>
      <div className="bg-white border rounded-lg p-6 shadow-sm space-y-3">
        <p><strong>Ngày đặt:</strong> {new Date(order.ngay).toLocaleString("vi-VN")}</p>
        <p><strong>Trạng thái:</strong>{" "}
          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-sm">{trangThaiText(order.trangthai)}</span>
        </p>
        {order.ghichu && <p><strong>Ghi chú:</strong> {order.ghichu}</p>}
        <h3 className="font-semibold border-t pt-3 mt-3">Sản phẩm</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">Tên</th>
              <th className="py-2 text-center">SL</th>
              <th className="py-2 text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((item, i) => (
              <tr key={i} className="border-b">
                <td className="py-2">{item.tenmathang || `#${item.mathang_id}`}</td>
                <td className="py-2 text-center">{item.soluong}</td>
                <td className="py-2 text-right text-red-600">{formatPrice(item.thanhtien)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-right font-bold text-lg text-red-600">Tổng: {formatPrice(order.tongtien)}</p>
      </div>
      <Link href="/orders" className="inline-block mt-4 text-cyan-600 hover:underline">← Quay lại danh sách</Link>
    </div>
  );
}
