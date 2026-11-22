import { NextResponse } from "next/server";
import { findCustomerByLogin } from "@/lib/queries";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (typeof username !== "string" || !username.trim()) {
      return NextResponse.json({ error: "Vui lòng nhập tên đăng nhập" }, { status: 400 });
    }
    if (typeof password !== "string" || !password) {
      return NextResponse.json({ error: "Vui lòng nhập mật khẩu" }, { status: 400 });
    }
    if (username !== username.trim()) {
      return NextResponse.json(
        { error: "Tên đăng nhập không được có khoảng trắng đầu hoặc cuối, vui lòng nhập lại chính xác" },
        { status: 400 }
      );
    }
    const user = await findCustomerByLogin(username, password);
    if (!user) {
      return NextResponse.json({ error: "Sai tài khoản hoặc mật khẩu" }, { status: 401 });
    }
    // Không trả mật khẩu về client
    const { mat_khau, ...safe } = user;
    return NextResponse.json({ user: safe });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
