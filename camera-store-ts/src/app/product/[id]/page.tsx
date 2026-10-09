"use client";

import { useCart } from "@/context/CartContext";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Product } from "@/types";
import { imageUrl } from "@/lib/utils";

function formatPrice(n: number) {
  return Number(n).toLocaleString("vi-VN") + "đ";
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.product) {
          setProduct(d.product);
          setRelated(d.related || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) return <p className="text-center py-12">Đang tải...</p>;
  if (!product) return <p className="text-center py-12">Không tìm thấy sản phẩm.</p>;

  const hethang = product.soluongton <= 0;
  const giamgia = Number(product.giaban) !== Number(product.giagoc);

  const handleAdd = () => {
    if (hethang) return;
    addToCart(product.id, qty);
    alert("Đã thêm vào giỏ hàng!");
  };

  const handleBuyNow = () => {
    if (hethang) return;
    addToCart(product.id, qty);
    router.push("/cart");
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h1 className="text-2xl font-bold text-cyan-700 mb-4">{product.tenmathang}</h1>
          <div className="bg-white rounded-lg border p-6 mb-6 text-center">
            <img
              src={imageUrl(product.hinhanh)}
              alt={product.tenmathang}
              className={`max-h-96 mx-auto object-contain ${hethang ? "grayscale opacity-60" : ""}`}
            />
          </div>

          <div className="mb-4">
            <p className="text-lg">
              Giá bán:{" "}
              {giamgia && (
                <span className="text-gray-400 line-through text-base mr-2">
                  {formatPrice(product.giagoc)}
                </span>
              )}
              <span className="text-red-600 font-bold text-2xl">
                {formatPrice(product.giaban)}
              </span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Tồn kho: {product.soluongton} | Lượt xem: {product.luotxem}
            </p>
          </div>

          {!hethang ? (
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center border rounded">
                <span className="px-3 text-sm text-gray-500">Số lượng</span>
                <input
                  type="number"
                  min={1}
                  max={product.soluongton}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                  className="w-16 text-center border-l py-2 outline-none"
                />
              </div>
              <button
                onClick={handleAdd}
                className="flex-1 min-w-[140px] border border-cyan-500 text-cyan-600 py-2.5 rounded hover:bg-cyan-50 font-medium"
              >
                🛒 Thêm vào giỏ
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 min-w-[140px] bg-red-500 text-white py-2.5 rounded hover:bg-red-600 font-bold"
              >
                ⚡ Mua ngay
              </button>
            </div>
          ) : (
            <p className="text-red-500 font-medium mb-6">Sản phẩm đã hết hàng</p>
          )}

          <div>
            <h2 className="text-lg font-bold text-cyan-700 border-b pb-2 mb-3">Mô tả sản phẩm</h2>
            <div
              className="text-gray-700 prose max-w-none"
              dangerouslySetInnerHTML={{ __html: product.mota || "" }}
            />
          </div>
        </div>

        <div>
          <h3 className="font-bold text-amber-600 border-b pb-2 mb-4">Cùng danh mục</h3>
          <div className="space-y-3">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="flex gap-3 bg-white border rounded p-2 hover:shadow"
              >
                <img src={imageUrl(p.hinhanh)} alt="" className="w-16 h-16 object-contain" />
                <div>
                  <p className="text-sm font-medium line-clamp-2">{p.tenmathang}</p>
                  <p className="text-red-600 text-sm font-bold">{formatPrice(p.giaban)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
