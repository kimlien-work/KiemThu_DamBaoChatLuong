import ProductCard from "@/components/ProductCard";
import { getCategoryById, getProductsByCategory } from "@/lib/queries";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { id } = await params;
  const { sort = "default" } = await searchParams;
  const catId = Number(id);
  const cat = await getCategoryById(catId);
  if (!cat) notFound();

  const list = await getProductsByCategory(catId, sort);

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center border-b pb-3 mb-6 gap-3">
        <h1 className="text-2xl font-bold text-cyan-700">{cat.tendanhmuc}</h1>
        <div className="flex gap-2 text-sm">
          {[
            ["default", "Mặc định"],
            ["price_asc", "Giá ↑"],
            ["price_desc", "Giá ↓"],
            ["view", "Xem nhiều"],
          ].map(([s, label]) => (
            <Link
              key={s}
              href={`/category/${id}?sort=${s}`}
              className={`px-3 py-1 rounded ${sort === s ? "bg-cyan-600 text-white" : "bg-gray-100"}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p className="text-center text-gray-500 py-12">Chưa có sản phẩm trong danh mục này.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
