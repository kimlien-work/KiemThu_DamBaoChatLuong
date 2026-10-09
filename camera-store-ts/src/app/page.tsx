import ProductCard from "@/components/ProductCard";
import { categories, products } from "@/data/mock";
import Link from "next/link";

export default function HomePage() {
  const topViewed = [...products].sort((a, b) => b.luotxem - a.luotxem).slice(0, 4);

  return (
    <div>
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl text-white p-8 mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Camera Store</h1>
        <p className="text-cyan-100 text-lg">
          Máy ảnh chính hãng – Giá tốt – Giao hàng toàn quốc
        </p>
      </div>

      {categories.map((cat) => {
        const list = products.filter((p) => p.danhmuc_id === cat.id).slice(0, 4);
        if (list.length === 0) return null;
        return (
          <section key={cat.id} className="mb-10">
            <div className="flex justify-between items-end border-b pb-2 mb-4">
              <h2 className="text-xl font-bold text-cyan-700 uppercase">
                {cat.tendanhmuc}
              </h2>
              <Link
                href={`/category/${cat.id}`}
                className="text-sm text-gray-500 hover:text-cyan-600"
              >
                Xem tất cả →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {list.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        );
      })}

      <section className="mb-10">
        <h2 className="text-xl font-bold text-cyan-700 uppercase border-b pb-2 mb-4">
          Sản phẩm xem nhiều
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {topViewed.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
