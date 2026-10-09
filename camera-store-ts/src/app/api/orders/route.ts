import { NextResponse } from "next/server";
import { createOrder, getOrdersByCustomer } from "@/lib/queries";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = Number(searchParams.get("customerId"));
    if (!customerId) return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
    const orders = await getOrdersByCustomer(customerId);
    return NextResponse.json(orders);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderId = await createOrder({
      khach_hang_id: body.khach_hang_id,
      tongtien: body.tongtien,
      ghichu: body.ghichu,
      items: body.items,
    });
    return NextResponse.json({ orderId });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
