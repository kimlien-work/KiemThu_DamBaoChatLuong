import { getNewsList } from "@/lib/queries";
import { imageUrl } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  let list: Awaited<ReturnType<typeof getNewsList>> = [];
  try {
    list = await getNewsList();
  } catch {
    return <p className="text-center text-red-500 py-12">Không tải được tin tức (kiểm tra DB).</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-cyan-700 mb-6">Tin tức</h1>
      {list.length === 0 ? (
        <p className="text-center text-gray-500 py-12">Chưa có tin tức.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((n) => (
            <Link key={n.id} href={`/news/${n.id}`} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
              <img src={imageUrl(n.hinhanh)} alt={n.tieude} className="w-full h-44 object-cover" />
              <div className="p-4">
                <h2 className="font-bold text-gray-800 line-clamp-2 mb-2 hover:text-cyan-600">{n.tieude}</h2>
                <p className="text-sm text-gray-500">
                  {n.ngaydang ? new Date(n.ngaydang).toLocaleDateString("vi-VN") : ""} · {n.luotxem} lượt xem
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
