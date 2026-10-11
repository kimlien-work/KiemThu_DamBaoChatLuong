import { NextResponse } from "next/server";
import { getAdminStats } from "@/lib/admin-queries";

export async function GET() {
  try {
    const stats = await getAdminStats();
    return NextResponse.json(stats);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
