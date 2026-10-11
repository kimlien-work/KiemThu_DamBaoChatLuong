import { NextResponse } from "next/server";
import {
  adminGetOrders,
  adminUpdateOrderStatus,
  adminGetOrderDetail,
} from "@/lib/admin-queries";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
      const order = await adminGetOrderDetail(Number(id));
      if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(order);
    }
    return NextResponse.json(await adminGetOrders());
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, trangthai } = await req.json();
    await adminUpdateOrderStatus(Number(id), Number(trangthai));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
