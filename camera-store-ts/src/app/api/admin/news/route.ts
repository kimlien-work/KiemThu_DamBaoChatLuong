import { NextResponse } from "next/server";
import {
  adminGetNews,
  adminCreateNews,
  adminUpdateNews,
  adminDeleteNews,
} from "@/lib/admin-queries";

export async function GET() {
  try {
    return NextResponse.json(await adminGetNews());
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = await adminCreateNews(body);
    return NextResponse.json({ id });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    await adminUpdateNews(Number(id), data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    await adminDeleteNews(Number(searchParams.get("id")));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
