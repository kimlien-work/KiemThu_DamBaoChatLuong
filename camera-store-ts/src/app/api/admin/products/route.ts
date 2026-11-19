import { NextResponse } from "next/server";
import {
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
} from "@/lib/admin-queries";

export async function GET(req: Request) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const keyword = searchParams.get("q")?.trim();
    const categoryId = Number(searchParams.get("categoryId")) || undefined;
    const sort = searchParams.get("sort")?.trim();

    return NextResponse.json(await adminGetProducts({
      keyword: keyword || undefined,
      categoryId,
      sort: sort || undefined,
    }));
  } catch (e) {
    console.error("[admin/products]", e);
    return NextResponse.json(
      { error: "Không thể tải danh sách mặt hàng. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = await adminCreateProduct(body);
    return NextResponse.json({ id });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    await adminUpdateProduct(Number(id), data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    await adminDeleteProduct(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
