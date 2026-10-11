import { NextResponse } from "next/server";
import { adminGetStaff } from "@/lib/admin-queries";

export async function GET() {
  try {
    return NextResponse.json(await adminGetStaff());
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
