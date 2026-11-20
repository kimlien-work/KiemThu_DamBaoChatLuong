import { NextResponse } from "next/server";
import { adminGetCustomers, adminToggleCustomer } from "@/lib/admin-queries";
import { getAdminSession } from "@/lib/admin-session";

export async function GET(request: Request) {
  try {
    const staff = await getAdminSession(request);
    if (!staff) {
      return NextResponse.json({ error: "Chưa đăng nhập hoặc phiên đã hết hạn." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("q")?.trim();
    const statusParam = searchParams.get("status")?.trim();
    const status =
      statusParam === "active" || statusParam === "locked" ? statusParam : "all";

    return NextResponse.json(await adminGetCustomers({
      keyword: keyword || undefined,
      status,
    }));
  } catch (e) {
    console.error("[admin/customers]", e);
    return NextResponse.json(
      { error: "Không thể tải dữ liệu khách hàng. Vui lòng kiểm tra kết nối và thử lại." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const staff = await getAdminSession(req);
    if (!staff) {
      return NextResponse.json({ error: "Chưa đăng nhập hoặc phiên đã hết hạn." }, { status: 401 });
    }
    if (staff.chucvu_id !== 1) {
      return NextResponse.json({ error: "Chỉ Admin mới được khóa hoặc mở khóa tài khoản khách hàng." }, { status: 403 });
    }

    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
    }
    const { id, trangthai } = body as Record<string, unknown>;
    if (typeof id !== "number" || !Number.isSafeInteger(id) || id < 1) {
      return NextResponse.json({ error: "Mã khách hàng không hợp lệ." }, { status: 400 });
    }
    if (typeof trangthai !== "number" || ![0, 1].includes(trangthai)) {
      return NextResponse.json({ error: "Trạng thái tài khoản không hợp lệ." }, { status: 400 });
    }

    await adminToggleCustomer(id, trangthai);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/customers/update]", e);
    return NextResponse.json({ error: "Không thể cập nhật trạng thái tài khoản." }, { status: 500 });
  }
}
