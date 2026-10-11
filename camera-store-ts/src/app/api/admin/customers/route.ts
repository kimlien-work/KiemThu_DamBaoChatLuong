import { NextResponse } from "next/server";
import { adminGetCustomers, adminToggleCustomer } from "@/lib/admin-queries";

export async function GET() {
  try {
    return NextResponse.json(await adminGetCustomers());
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, trangthai } = await req.json();
    await adminToggleCustomer(Number(id), Number(trangthai));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
