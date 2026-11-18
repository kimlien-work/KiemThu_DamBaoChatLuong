import ProductCard from "@/components/ProductCard";
import { searchProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const keyword = q.trim();
  const products = keyword ? await searchProducts(keyword) : [];

  return (
    <div>
      <div className="border-b pb-3 mb-6">
        <h1 className="text-2xl font-bold text-cyan-700">
          {keyword ? `Kết quả tìm kiếm: "${keyword}"` : "Tìm kiếm sản phẩm"}
        </h1>
      </div>

      {keyword === "" ? (
        <p className="text-center text-gray-500 py-12">
          Nhập tên sản phẩm vào ô tìm kiếm trên thanh điều hướng.
        </p>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500 py-12">
          Không tìm thấy sản phẩm phù hợp.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
