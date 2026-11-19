import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";

export async function GET(request: Request) {
  try {
    const user = await getAdminSession(request);
    if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    return NextResponse.json({ user });
  } catch (e) {
    console.error("[admin/session]", e);
    return NextResponse.json({ error: "Không thể xác thực phiên đăng nhập" }, { status: 500 });
  }
}
