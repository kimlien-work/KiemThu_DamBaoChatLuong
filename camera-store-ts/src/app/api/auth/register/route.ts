import { NextResponse } from "next/server";
import { createCustomer, findCustomerByUsername } from "@/lib/queries";
import { isValidEmail, isValidPassword, isValidPhoneNumber } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const password = body.matkhau || body.mat_khau;
    if (typeof password !== "string" || !isValidPassword(password)) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 8 ký tự, gồm 1 chữ viết hoa, 1 chữ số và 1 ký tự đặc biệt" },
        { status: 400 }
      );
    }
    if (typeof body.dien_thoai !== "string" || !isValidPhoneNumber(body.dien_thoai)) {
      return NextResponse.json(
        { error: "Số điện thoại phải có từ 10 đến 12 chữ số, không chứa khoảng trắng hoặc ký tự khác" },
        { status: 400 }
      );
    }
    if (
      body.email !== undefined &&
      body.email !== null &&
      body.email !== "" &&
      (typeof body.email !== "string" || !isValidEmail(body.email))
    ) {
      return NextResponse.json({ error: "Email không đúng định dạng" }, { status: 400 });
    }

    const exists = await findCustomerByUsername(body.tendangnhap);
    if (exists) {
      return NextResponse.json({ error: "Tên đăng nhập đã tồn tại" }, { status: 400 });
    }
    const id = await createCustomer({
      ten: body.ten,
      tendangnhap: body.tendangnhap,
      mat_khau: password,
      email: body.email,
      dien_thoai: body.dien_thoai,
      dia_chi: body.diachi || body.dia_chi,
    });
    return NextResponse.json({
      user: {
        id,
        ten: body.ten,
        tendangnhap: body.tendangnhap,
        email: body.email || null,
        dien_thoai: body.dien_thoai,
        dia_chi: body.diachi || body.dia_chi || null,
        trangthai: 1,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
