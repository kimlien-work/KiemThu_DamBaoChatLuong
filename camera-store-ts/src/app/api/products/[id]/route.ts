import { NextResponse } from "next/server";
import { getProductById, getProductsByCategory, increaseView } from "@/lib/queries";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getProductById(Number(id));
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await increaseView(Number(id));
    const related = (await getProductsByCategory(product.danhmuc_id))
      .filter((p) => p.id !== product.id)
      .slice(0, 4);
    return NextResponse.json({ product, related });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
