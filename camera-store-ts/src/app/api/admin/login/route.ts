import { NextResponse } from "next/server";
import { findStaffByLogin } from "@/lib/admin-queries";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionToken,
} from "@/lib/admin-session";

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
        { error: "Sai tài khoản hoặc mật khẩu, hoặc tài khoản đã bị khóa" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ user: staff });
    response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(staff.id), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE,
    });
    return response;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[admin/login]", msg);
    if (msg.includes("ADMIN_SESSION_SECRET")) {
      return NextResponse.json(
        { error: "Máy chủ chưa cấu hình ADMIN_SESSION_SECRET để tạo phiên đăng nhập" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        error: `Lỗi DB: ${msg}. Kiểm tra env DB_* trên Vercel và SSL Aiven.`,
      },
      { status: 500 }
    );
  }
}
