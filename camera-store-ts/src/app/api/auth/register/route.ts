import { NextResponse } from "next/server";
import { createCustomer, findCustomerByUsername } from "@/lib/queries";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const exists = await findCustomerByUsername(body.tendangnhap);
    if (exists) {
      return NextResponse.json({ error: "Tên đăng nhập đã tồn tại" }, { status: 400 });
    }
    const id = await createCustomer({
      ten: body.ten,
      tendangnhap: body.tendangnhap,
      mat_khau: body.matkhau || body.mat_khau,
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
