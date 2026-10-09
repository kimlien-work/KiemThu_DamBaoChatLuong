import { NextResponse } from "next/server";
import { findCustomerByLogin } from "@/lib/queries";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
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
