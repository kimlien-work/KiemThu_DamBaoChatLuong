import { NextResponse } from "next/server";
import { findStaffByLogin } from "@/lib/admin-queries";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionToken,
  SessionConfigurationError,
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
    if (e instanceof SessionConfigurationError) {
      console.error("[admin/login] Session configuration error");
      return NextResponse.json(
        { error: "Hệ thống đăng nhập đang gặp sự cố. Vui lòng thử lại sau." },
        { status: 500 }
      );
    }
    if (typeof e === "object" && e !== null && "code" in e) {
      console.error("[admin/login] Unexpected login error", {
        code: (e as { code?: unknown }).code,
        name: e instanceof Error ? e.name : undefined,
        message: e instanceof Error ? e.message : undefined,
      });
    } else {
      console.error("[admin/login] Unexpected login error", {
        name: e instanceof Error ? e.name : typeof e,
        message: e instanceof Error ? e.message : undefined,
      });
    }
    return NextResponse.json(
      { error: "Hệ thống đăng nhập đang gặp sự cố. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
