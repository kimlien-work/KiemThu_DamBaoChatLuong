"use client";

import { useCart } from "@/context/CartContext";
import { products } from "@/data/mock";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

function formatPrice(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const items = cart
    .map((c) => {
      const p = products.find((x) => x.id === c.id);
      return p ? { ...p, soluong: c.soluong } : null;
    })
    .filter(Boolean) as (typeof products[0] & { soluong: number })[];

  const tongtien = items.reduce((s, i) => s + i.giaban * i.soluong, 0);

  const handleCheckout = () => {
    if (!user) {
      alert("Vui lòng đăng nhập để thanh toán!");
      router.push("/login");
      return;
    }
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-xl font-bold mb-2">Giỏ hàng của bạn đang trống!</h2>
        <Link href="/" className="inline-block mt-4 bg-cyan-600 text-white px-6 py-2 rounded hover:bg-cyan-700">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-cyan-700 mb-6">Giỏ hàng</h1>
      <div className="overflow-x-auto">
        <table className="w-full bg-white border rounded-lg shadow-sm">
          <thead className="bg-cyan-50">
            <tr className="text-left text-sm">
              <th className="p-3">Hình</th>
              <th className="p-3">Tên mặt hàng</th>
              <th className="p-3 text-center">Đơn giá</th>
              <th className="p-3 text-center">Số lượng</th>
              <th className="p-3 text-center">Thành tiền</th>
              <th className="p-3 text-center">Xóa</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-3">
                  <img src={item.hinhanh} alt="" className="w-14 h-14 object-contain" />
                </td>
                <td className="p-3">
                  <Link href={`/product/${item.id}`} className="font-medium hover:text-cyan-600">
                    {item.tenmathang}
                  </Link>
                </td>
                <td className="p-3 text-center">{formatPrice(item.giaban)}</td>
                <td className="p-3 text-center">
                  <input
                    type="number"
                    min={1}
                    max={item.soluongton}
                    value={item.soluong}
                    onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                    className="w-16 border rounded text-center py-1"
                  />
                </td>
                <td className="p-3 text-center text-red-600 font-bold">
                  {formatPrice(item.giaban * item.soluong)}
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 text-lg"
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={4} className="p-3 text-right font-bold">
                Tổng cộng:
              </td>
              <td className="p-3 text-center text-red-600 font-bold text-lg">
                {formatPrice(tongtien)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex flex-wrap gap-3 mt-6 justify-end">
        <button
          onClick={clearCart}
          className="px-5 py-2 border border-gray-300 rounded hover:bg-gray-100"
        >
          Xóa giỏ hàng
        </button>
        <Link
          href="/"
          className="px-5 py-2 border border-cyan-500 text-cyan-600 rounded hover:bg-cyan-50"
        >
          Tiếp tục mua
        </Link>
        <button
          onClick={handleCheckout}
          className="px-6 py-2 bg-red-500 text-white rounded font-bold hover:bg-red-600"
        >
          Thanh toán
        </button>
      </div>
    </div>
  );
}
