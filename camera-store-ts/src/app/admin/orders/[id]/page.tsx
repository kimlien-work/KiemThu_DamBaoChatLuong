"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { AdminOrder } from "@/types";
import { formatPrice } from "@/lib/utils";
import { trangThaiText } from "@/types";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { admin } = useAdminAuth();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const isAdmin = admin?.chucvu_id === 1;

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      const res = await fetch(`/api/admin/orders?id=${encodeURIComponent(id)}`, { cache: "no-store" });
      const data = await res.json();
      if (res.status === 404) {
        setError("Không tìm thấy đơn hàng phù hợp.");
      } else if (res.status === 400) {
        setError(data.error || "Mã đơn hàng không hợp lệ. Vui lòng kiểm tra lại.");
      } else if (res.status === 403) {
        setError("Bạn không có quyền xem chi tiết đơn hàng này.");
      } else if (!res.ok) {
        setError(data.error || "Không thể tải dữ liệu đơn hàng.");
      } else {
        setOrder(data);
      }
    } catch {
      setError("Không thể tải dữ liệu đơn hàng. Vui lòng kiểm tra kết nối và thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [params.id]);

  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-cyan-600 hover:underline">← Quay lại danh sách</Link>
      <h1 className="text-2xl font-bold text-slate-800 mt-4 mb-6">Chi tiết đơn hàng</h1>
      {loading && <p className="text-slate-500">Đang tải dữ liệu đơn hàng...</p>}
      {!loading && error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-red-700">
          <p>{error}</p>
          <button type="button" onClick={load} className="mt-3 underline">Thử lại</button>
        </div>
      )}
      {!loading && order && (
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-3">Đơn #{order.id}</h2>
          {isAdmin && (
            <p className="text-sm mb-1"><strong>Khách:</strong> {order.tenkhachhang || "—"}{order.dien_thoai ? ` — ${order.dien_thoai}` : ""}</p>
          )}
          <p className="text-sm mb-1"><strong>Ngày:</strong> {new Date(order.ngay).toLocaleString("vi-VN")}</p>
          <p className="text-sm mb-1"><strong>Trạng thái:</strong> {trangThaiText(order.trangthai)}</p>
          {isAdmin && order.ghichu && <p className="text-sm mb-3"><strong>Ghi chú:</strong> {order.ghichu}</p>}
          <table className="w-full text-sm border-t mt-3">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Sản phẩm</th>
                <th className="py-2 text-center">Số lượng</th>
                <th className="py-2 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{item.tenmathang || `#${item.mathang_id}`}</td>
                  <td className="py-2 text-center">{item.soluong}</td>
                  <td className="py-2 text-right text-red-600">{formatPrice(item.thanhtien)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-right font-bold text-red-600 mt-3">Tổng: {formatPrice(order.tongtien)}</p>
        </div>
      )}
    </div>
  );
}
