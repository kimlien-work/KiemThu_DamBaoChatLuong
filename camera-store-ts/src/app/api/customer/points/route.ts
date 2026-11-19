import { NextResponse } from "next/server";
import { getCustomerLoyalty } from "@/lib/queries";

export async function GET(req: Request) {
  try {
    const customerId = Number(new URL(req.url).searchParams.get("customerId"));
    if (!customerId) return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
    return NextResponse.json(await getCustomerLoyalty(customerId));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
