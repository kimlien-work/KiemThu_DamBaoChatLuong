import { NextResponse } from "next/server";
import {
  findCustomerContactConflict,
  getCustomerById,
  updateCustomerProfile,
} from "@/lib/queries";
import {
  isValidAddress,
  isValidFullName,
  isValidOptionalEmail,
  isValidPhoneNumber,
} from "@/lib/utils";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const customerId = Number(body.customerId);
    if (!Number.isInteger(customerId) || customerId <= 0) {
      return NextResponse.json({ error: "Thiếu thông tin khách hàng" }, { status: 400 });
    }

    const ten = typeof body.ten === "string" ? body.ten.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const dienThoai = typeof body.dien_thoai === "string" ? body.dien_thoai : "";
    const diaChi = typeof body.dia_chi === "string" ? body.dia_chi.trim() : "";

    if (!ten) {
      return NextResponse.json({ error: "Vui lòng nhập họ tên" }, { status: 400 });
    }
    if (!isValidFullName(ten)) {
      return NextResponse.json({ error: "Họ tên tối đa 100 ký tự" }, { status: 400 });
    }
    if (!dienThoai) {
      return NextResponse.json({ error: "Vui lòng nhập số điện thoại" }, { status: 400 });
    }
    if (!isValidPhoneNumber(dienThoai)) {
      return NextResponse.json(
        { error: "Số điện thoại phải có từ 10 đến 12 chữ số, không chứa khoảng trắng hoặc ký tự khác" },
        { status: 400 }
      );
    }
    if (!isValidOptionalEmail(email)) {
      return NextResponse.json({ error: "Email không đúng định dạng hoặc quá 80 ký tự" }, { status: 400 });
    }
    if (!isValidAddress(diaChi)) {
      return NextResponse.json({ error: "Địa chỉ tối đa 255 ký tự" }, { status: 400 });
    }

    const conflict = await findCustomerContactConflict(email || null, dienThoai, customerId);
    if (conflict === "email") {
      return NextResponse.json({ error: "Email đã được sử dụng" }, { status: 400 });
    }
    if (conflict === "phone") {
      return NextResponse.json({ error: "Số điện thoại đã được sử dụng" }, { status: 400 });
    }

    await updateCustomerProfile(customerId, {
      ten,
      email: email || null,
      dien_thoai: dienThoai,
      dia_chi: diaChi || null,
    });
    const user = await getCustomerById(customerId);
    if (!user) {
      return NextResponse.json({ error: "Khách hàng không tồn tại" }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
