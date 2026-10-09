import { newsList } from "@/data/mock";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const news = newsList.find((n) => n.id === Number(id));
  if (!news) notFound();

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/news" className="text-cyan-600 text-sm hover:underline mb-4 inline-block">
        ← Tất cả tin tức
      </Link>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{news.tieude}</h1>
      <p className="text-sm text-gray-500 mb-6">
        {new Date(news.ngaydang).toLocaleDateString("vi-VN")} · {news.luotxem} lượt xem
      </p>
      <img
        src={news.hinhanh}
        alt={news.tieude}
        className="w-full rounded-lg mb-6 max-h-96 object-cover"
      />
      <div className="prose max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
        {news.noidung}
      </div>
    </div>
  );
}
