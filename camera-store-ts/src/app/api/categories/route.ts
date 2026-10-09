import { NextResponse } from "next/server";
import { getCategories } from "@/lib/queries";

export async function GET() {
  try {
    const data = await getCategories();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
