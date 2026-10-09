import ProductCard from "@/components/ProductCard";
import { categories, products } from "@/data/mock";
import Link from "next/link";
import { notFound } from "next/navigation";

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
  const cat = categories.find((c) => c.id === catId);
  if (!cat) notFound();

  let list = products.filter((p) => p.danhmuc_id === catId);
  if (sort === "price_asc") list = [...list].sort((a, b) => a.giaban - b.giaban);
  else if (sort === "price_desc") list = [...list].sort((a, b) => b.giaban - a.giaban);
  else if (sort === "view") list = [...list].sort((a, b) => b.luotxem - a.luotxem);

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center border-b pb-3 mb-6 gap-3">
        <h1 className="text-2xl font-bold text-cyan-700">{cat.tendanhmuc}</h1>
        <div className="flex gap-2 text-sm">
          <Link
            href={`/category/${id}`}
            className={`px-3 py-1 rounded ${sort === "default" ? "bg-cyan-600 text-white" : "bg-gray-100"}`}
          >
            Mặc định
          </Link>
          <Link
            href={`/category/${id}?sort=price_asc`}
            className={`px-3 py-1 rounded ${sort === "price_asc" ? "bg-cyan-600 text-white" : "bg-gray-100"}`}
          >
            Giá ↑
          </Link>
          <Link
            href={`/category/${id}?sort=price_desc`}
            className={`px-3 py-1 rounded ${sort === "price_desc" ? "bg-cyan-600 text-white" : "bg-gray-100"}`}
          >
            Giá ↓
          </Link>
          <Link
            href={`/category/${id}?sort=view`}
            className={`px-3 py-1 rounded ${sort === "view" ? "bg-cyan-600 text-white" : "bg-gray-100"}`}
          >
            Xem nhiều
          </Link>
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
