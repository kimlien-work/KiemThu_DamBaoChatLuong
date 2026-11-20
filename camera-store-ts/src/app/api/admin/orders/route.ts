import { NextResponse } from "next/server";
import {
  adminGetOrders,
  adminUpdateOrderStatus,
  adminGetOrderDetail,
} from "@/lib/admin-queries";
import { getAdminSession } from "@/lib/admin-session";

export async function GET(req: Request) {
  try {
    const staff = await getAdminSession(req);
    if (!staff) return NextResponse.json({ error: "Chưa đăng nhập hoặc phiên đã hết hạn." }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const keyword = searchParams.get("q")?.trim();

    const includeSensitive = staff.chucvu_id === 1;

    if (id) {
      if (!/^\d{1,10}$/.test(id)) {
        return NextResponse.json({ error: "Mã đơn hàng không hợp lệ. Vui lòng kiểm tra lại." }, { status: 400 });
      }
      const orderId = Number(id);
      if (!Number.isSafeInteger(orderId) || orderId < 1 || orderId > 4294967295) {
        return NextResponse.json({ error: "Mã đơn hàng không hợp lệ. Vui lòng kiểm tra lại." }, { status: 400 });
      }
      const order = await adminGetOrderDetail(orderId, includeSensitive);
      if (!order) return NextResponse.json({ error: "Không tìm thấy đơn hàng phù hợp." }, { status: 404 });
      return NextResponse.json(order);
    }

    if (keyword) {
      if (!/^\d{1,10}$/.test(keyword)) {
        return NextResponse.json({ error: "Mã đơn hàng không hợp lệ. Vui lòng kiểm tra lại." }, { status: 400 });
      }
      const orderId = Number(keyword);
      if (!Number.isSafeInteger(orderId) || orderId < 1 || orderId > 4294967295) {
        return NextResponse.json({ error: "Mã đơn hàng không hợp lệ. Vui lòng kiểm tra lại." }, { status: 400 });
      }
    }
    return NextResponse.json(await adminGetOrders({
      keyword: keyword || undefined,
      includeSensitive,
    }));
  } catch (e) {
    console.error("[admin/orders]", e);
    return NextResponse.json(
      { error: "Không thể tải dữ liệu đơn hàng. Vui lòng kiểm tra kết nối và thử lại." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const staff = await getAdminSession(req);
    if (!staff) return NextResponse.json({ error: "Chưa đăng nhập hoặc phiên đã hết hạn." }, { status: 401 });

    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Dữ liệu cập nhật đơn hàng không hợp lệ." }, { status: 400 });
    }

    const { id, trangthai } = body as Record<string, unknown>;
    if (typeof id !== "number" || !Number.isSafeInteger(id) || id < 1 || id > 4294967295) {
      return NextResponse.json({ error: "Mã đơn hàng không hợp lệ." }, { status: 400 });
    }
    if (typeof trangthai !== "number" || !Number.isSafeInteger(trangthai) || ![1, 2, 3].includes(trangthai)) {
      return NextResponse.json({ error: "Trạng thái đơn hàng không hợp lệ." }, { status: 400 });
    }

    await adminUpdateOrderStatus(id, trangthai);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const status =
      typeof e === "object" && e !== null && "status" in e
        ? Number((e as { status?: unknown }).status)
        : 500;
    if (status === 400 || status === 404 || status === 409) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Không thể cập nhật trạng thái đơn hàng." },
        { status }
      );
    }
    console.error("[admin/orders/update]", e);
    return NextResponse.json(
      { error: "Không thể cập nhật trạng thái đơn hàng." },
      { status: 500 }
    );
  }
}
