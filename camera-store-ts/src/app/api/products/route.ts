import { NextResponse } from "next/server";
import { getProductById } from "@/lib/queries";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ids = (searchParams.get("ids") || "").split(",").map(Number).filter(Boolean);
    const products = await Promise.all(ids.map((id) => getProductById(id)));
    return NextResponse.json(products.filter(Boolean));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
