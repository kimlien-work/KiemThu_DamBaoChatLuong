import ProductCard from "@/components/ProductCard";
import { getCategories, getProductsByCategory, getTopViewed } from "@/lib/queries";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let topViewed: Awaited<ReturnType<typeof getTopViewed>> = [];
  let error: string | null = null;

  try {
    categories = await getCategories();
    topViewed = await getTopViewed(8);
  } catch (e) {
    error = e instanceof Error ? e.message : "Không kết nối được database";
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
        <h2 className="font-bold text-lg mb-2">Lỗi kết nối Database</h2>
        <p className="mb-2">{error}</p>
        <p className="text-sm">
          Kiểm tra: MySQL đã chạy chưa? Đã import file{" "}
          <code className="bg-red-100 px-1">database/camera_shop.sql</code> chưa? File{" "}
          <code className="bg-red-100 px-1">.env</code> đúng chưa?
        </p>
      </div>
    );
  }

  const sections = await Promise.all(
    categories.map(async (cat) => {
      const list = (await getProductsByCategory(cat.id)).slice(0, 4);
      return { cat, list };
    })
  );

  return (
    <div>
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl text-white p-8 mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Camera Store</h1>
        <p className="text-cyan-100 text-lg">
          Máy ảnh chính hãng – Giá tốt – Giao hàng toàn quốc
        </p>
      </div>

      {sections.map(({ cat, list }) => {
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

      {topViewed.length > 0 && (
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
      )}
    </div>
  );
}
