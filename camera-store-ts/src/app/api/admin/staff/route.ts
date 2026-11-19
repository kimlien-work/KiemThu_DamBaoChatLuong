import { NextResponse } from "next/server";
import { adminGetStaff } from "@/lib/admin-queries";
import { getAdminSession } from "@/lib/admin-session";

export async function GET(request: Request) {
  try {
    const user = await getAdminSession(request);
    if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    return NextResponse.json(user.chucvu_id === 1 ? await adminGetStaff() : [user]);
  } catch (e) {
    console.error("[admin/staff]", e);
    return NextResponse.json({ error: "Không thể tải thông tin nhân viên" }, { status: 500 });
  }
}
