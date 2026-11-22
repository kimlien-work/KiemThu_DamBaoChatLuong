import { NextResponse } from "next/server";
import { createCustomer, findCustomerByUsername, findCustomerContactConflict } from "@/lib/queries";
import {
  isValidAddress,
  isValidFullName,
  isValidOptionalEmail,
  isValidPassword,
  isValidPhoneNumber,
  isValidUsername,
} from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const ten = typeof body.ten === "string" ? body.ten.trim() : "";
    const tendangnhap = typeof body.tendangnhap === "string" ? body.tendangnhap : "";
    const password = body.matkhau || body.mat_khau;
    const dienThoai = typeof body.dien_thoai === "string" ? body.dien_thoai : "";
    const diaChi = typeof (body.diachi ?? body.dia_chi) === "string" ? (body.diachi ?? body.dia_chi).trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!tendangnhap) {
      return NextResponse.json({ error: "Vui lòng nhập tên đăng nhập" }, { status: 400 });
    }
    if (!isValidUsername(tendangnhap)) {
      return NextResponse.json(
        { error: "Tên đăng nhập tối đa 50 ký tự và không được có khoảng trắng đầu hoặc cuối" },
        { status: 400 }
      );
    }
    if (!ten) {
      return NextResponse.json({ error: "Vui lòng nhập họ tên" }, { status: 400 });
    }
    if (!isValidFullName(ten)) {
      return NextResponse.json({ error: "Họ tên tối đa 100 ký tự" }, { status: 400 });
    }
    if (typeof password !== "string" || !password) {
      return NextResponse.json({ error: "Vui lòng nhập mật khẩu" }, { status: 400 });
    }
    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 8 ký tự, gồm 1 chữ viết hoa, 1 chữ số và 1 ký tự đặc biệt" },
        { status: 400 }
      );
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
    if (!diaChi) {
      return NextResponse.json({ error: "Vui lòng nhập địa chỉ" }, { status: 400 });
    }
    if (!isValidAddress(diaChi)) {
      return NextResponse.json({ error: "Địa chỉ tối đa 255 ký tự" }, { status: 400 });
    }
    if (!isValidOptionalEmail(email)) {
      return NextResponse.json({ error: "Email không đúng định dạng hoặc quá 80 ký tự" }, { status: 400 });
    }

    if (await findCustomerByUsername(tendangnhap)) {
      return NextResponse.json({ error: "Tên đăng nhập đã tồn tại" }, { status: 400 });
    }
    const conflict = await findCustomerContactConflict(email || null, dienThoai);
    if (conflict === "email") {
      return NextResponse.json({ error: "Email đã được sử dụng" }, { status: 400 });
    }
    if (conflict === "phone") {
      return NextResponse.json({ error: "Số điện thoại đã được sử dụng" }, { status: 400 });
    }

    const id = await createCustomer({
      ten,
      tendangnhap,
      mat_khau: password,
      email: email || undefined,
      dien_thoai: dienThoai,
      dia_chi: diaChi,
    });
    return NextResponse.json({
      user: {
        id,
        ten,
        tendangnhap,
        email: email || null,
        dien_thoai: dienThoai,
        dia_chi: diaChi,
        diem_tich_luy: 0,
        trangthai: 1,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
