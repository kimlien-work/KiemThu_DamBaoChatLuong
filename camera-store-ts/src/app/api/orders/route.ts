import { NextResponse } from "next/server";
import { createOrder, getOrdersByCustomer } from "@/lib/queries";
import { isValidAddress, isValidFullName, isValidPhoneNumber } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = Number(searchParams.get("customerId"));
    if (!customerId) return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
    const orders = await getOrdersByCustomer(customerId);
    return NextResponse.json(orders);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const khachHangId = Number(body.khach_hang_id);
    if (!Number.isInteger(khachHangId) || khachHangId <= 0) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để đặt hàng" }, { status: 400 });
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Giỏ hàng không có sản phẩm" }, { status: 400 });
    }

    const nhan = body.nguoi_nhan ?? {};
    const ten = typeof nhan.ten === "string" ? nhan.ten.trim() : "";
    const sdt = typeof nhan.dien_thoai === "string" ? nhan.dien_thoai : "";
    const diaChi = typeof nhan.diachi === "string" ? nhan.diachi.trim() : "";
    if (!ten) return NextResponse.json({ error: "Vui lòng nhập họ tên người nhận" }, { status: 400 });
    if (!isValidFullName(ten)) return NextResponse.json({ error: "Họ tên người nhận tối đa 100 ký tự" }, { status: 400 });
    if (!sdt) return NextResponse.json({ error: "Vui lòng nhập số điện thoại người nhận" }, { status: 400 });
    if (!isValidPhoneNumber(sdt)) {
      return NextResponse.json({ error: "Số điện thoại người nhận phải có từ 10 đến 12 chữ số" }, { status: 400 });
    }
    if (!diaChi) return NextResponse.json({ error: "Vui lòng nhập địa chỉ giao hàng" }, { status: 400 });
    if (!isValidAddress(diaChi)) return NextResponse.json({ error: "Địa chỉ giao hàng tối đa 255 ký tự" }, { status: 400 });

    const ghiChuKhac = typeof body.ghichu === "string" ? body.ghichu.trim() : "";
    const ghichu = [
      `Người nhận: ${ten}`,
      `SĐT: ${sdt}`,
      `Địa chỉ: ${diaChi}`,
      ghiChuKhac ? `Ghi chú: ${ghiChuKhac}` : "",
    ]
      .filter(Boolean)
      .join("; ");

    const orderId = await createOrder({
      khach_hang_id: khachHangId,
      tongtien: Number(body.tongtien),
      ghichu,
      items: body.items,
    });
    return NextResponse.json({ orderId });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
