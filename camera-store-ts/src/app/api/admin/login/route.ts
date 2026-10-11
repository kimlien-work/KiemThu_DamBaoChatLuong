import { NextResponse } from "next/server";
import { findStaffByLogin } from "@/lib/admin-queries";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const username = body.username?.trim();
    const password = body.password;

    if (!username || !password) {
      return NextResponse.json({ error: "Thiếu thông tin đăng nhập" }, { status: 400 });
    }

    const staff = await findStaffByLogin(username, password);
    if (!staff) {
      return NextResponse.json(
        { error: "Sai tài khoản hoặc mật khẩu (hoặc DB chưa có bảng nhan_vien)" },
        { status: 401 }
      );
    }

    return NextResponse.json({ user: staff });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[admin/login]", msg);
    return NextResponse.json(
      {
        error: `Lỗi DB: ${msg}. Kiểm tra env DB_* trên Vercel và SSL Aiven.`,
      },
      { status: 500 }
    );
  }
}
