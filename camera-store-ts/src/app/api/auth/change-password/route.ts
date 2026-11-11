import { NextResponse } from "next/server";
import { changeCustomerPassword } from "@/lib/queries";
import { isValidPassword } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const { customerId, currentPassword, newPassword } = await req.json();
    if (
      !Number.isInteger(customerId) ||
      customerId <= 0 ||
      typeof currentPassword !== "string" ||
      !currentPassword ||
      typeof newPassword !== "string" ||
      !newPassword
    ) {
      return NextResponse.json({ error: "Vui lòng nhập đầy đủ thông tin" }, { status: 400 });
    }
    if (!isValidPassword(newPassword)) {
      return NextResponse.json(
        { error: "Mật khẩu mới phải có ít nhất 8 ký tự, gồm 1 chữ viết hoa, 1 chữ số và 1 ký tự đặc biệt" },
        { status: 400 }
      );
    }

    const changed = await changeCustomerPassword(customerId, currentPassword, newPassword);
    if (!changed) {
      return NextResponse.json({ error: "Mật khẩu hiện tại không đúng" }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
