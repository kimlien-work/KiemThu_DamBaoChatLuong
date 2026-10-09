import { newsList } from "@/data/mock";
import Link from "next/link";

export default function NewsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-cyan-700 mb-6">Tin tức</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsList.map((n) => (
          <Link
            key={n.id}
            href={`/news/${n.id}`}
            className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
          >
            <img
              src={n.hinhanh}
              alt={n.tieude}
              className="w-full h-44 object-cover"
            />
            <div className="p-4">
              <h2 className="font-bold text-gray-800 line-clamp-2 mb-2 hover:text-cyan-600">
                {n.tieude}
              </h2>
              <p className="text-sm text-gray-500">
                {new Date(n.ngaydang).toLocaleDateString("vi-VN")} · {n.luotxem} lượt xem
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
