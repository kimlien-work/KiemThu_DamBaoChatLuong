import { NextResponse } from "next/server";
import { getCategories } from "@/lib/queries";
import {
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from "@/lib/admin-queries";

export async function GET() {
  try {
    return NextResponse.json(await getCategories());
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { tendanhmuc } = await req.json();
    const id = await adminCreateCategory(tendanhmuc);
    return NextResponse.json({ id });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, tendanhmuc } = await req.json();
    await adminUpdateCategory(Number(id), tendanhmuc);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    await adminDeleteCategory(Number(searchParams.get("id")));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
