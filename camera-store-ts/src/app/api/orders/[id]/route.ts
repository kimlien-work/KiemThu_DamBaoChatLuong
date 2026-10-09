import { NextResponse } from "next/server";
import { getOrderById } from "@/lib/queries";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const customerId = Number(searchParams.get("customerId"));
    if (!customerId) return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
    const order = await getOrderById(Number(id), customerId);
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(order);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
