import Link from "next/link";
import { Product } from "@/types";

function formatPrice(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

export default function ProductCard({ product }: { product: Product }) {
  const hethang = product.soluongton <= 0;
  const giamgia = product.giaban !== product.giagoc;

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-200 ${
        hethang ? "bg-gray-50" : ""
      }`}
    >
      <div className="relative">
        {hethang && (
          <span className="absolute top-2 left-2 z-10 bg-gray-500 text-white text-xs px-2 py-1 rounded">
            Hết hàng
          </span>
        )}
        {!hethang && giamgia && (
          <span className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Giảm giá
          </span>
        )}
        <Link href={`/product/${product.id}`}>
          <img
            src={product.hinhanh}
            alt={product.tenmathang}
            className={`w-full h-48 object-contain p-3 ${hethang ? "grayscale opacity-60" : ""}`}
          />
        </Link>
      </div>
      <div className="p-3">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-medium text-sm line-clamp-2 h-10 text-gray-800 hover:text-cyan-600">
            {product.tenmathang}
          </h3>
        </Link>
        <div className="mt-2">
          {giamgia && (
            <span className="text-gray-400 text-xs line-through mr-2">
              {formatPrice(product.giagoc)}
            </span>
          )}
          <span className="text-red-600 font-bold">{formatPrice(product.giaban)}</span>
        </div>
        <Link
          href={`/product/${product.id}`}
          className="mt-3 block text-center text-sm border border-cyan-500 text-cyan-600 rounded py-1.5 hover:bg-cyan-500 hover:text-white transition"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
}
