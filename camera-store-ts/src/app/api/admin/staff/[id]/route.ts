import { NextResponse } from "next/server";
import { adminUpdateStaffProfile } from "@/lib/admin-queries";
import { getAdminSession } from "@/lib/admin-session";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAdminSession(request);
    if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

    const id = Number((await params).id);
    if (!Number.isSafeInteger(id) || id < 1) {
      return NextResponse.json({ error: "Mã nhân viên không hợp lệ" }, { status: 400 });
    }
    if (user.chucvu_id !== 1 && user.id !== id) {
      return NextResponse.json(
        { error: "Nhân viên chỉ được sửa thông tin của chính mình" },
        { status: 403 }
      );
    }

    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Dữ liệu cập nhật không hợp lệ" }, { status: 400 });
    }

    const data = body as Record<string, unknown>;
    const allowedFields = ["ten", "dien_thoai", "email"];
    if (Object.keys(data).some((key) => !allowedFields.includes(key))) {
      return NextResponse.json({ error: "Chỉ được cập nhật họ tên, số điện thoại và email" }, { status: 400 });
    }

    const update: { ten?: string; dien_thoai?: string | null; email?: string | null } = {};
    if ("ten" in data) {
      if (typeof data.ten !== "string" || !data.ten.trim()) {
        return NextResponse.json({ field: "ten", error: "Vui lòng nhập họ và tên nhân viên." }, { status: 400 });
      }
      if (data.ten.trim().length > 100) {
        return NextResponse.json({ field: "ten", error: "Nội dung vượt quá số ký tự cho phép." }, { status: 400 });
      }
      update.ten = data.ten.trim();
    }
    if ("dien_thoai" in data) {
      if (typeof data.dien_thoai !== "string") {
        return NextResponse.json({ field: "dien_thoai", error: "Số điện thoại không hợp lệ." }, { status: 400 });
      }
      if (data.dien_thoai.trim().length > 15) {
        return NextResponse.json({ field: "dien_thoai", error: "Nội dung vượt quá số ký tự cho phép." }, { status: 400 });
      }
      update.dien_thoai = data.dien_thoai.trim() || null;
    }
    if ("email" in data) {
      if (typeof data.email !== "string") {
        return NextResponse.json({ field: "email", error: "Địa chỉ email không hợp lệ." }, { status: 400 });
      }
      if (data.email.trim().length > 80) {
        return NextResponse.json({ field: "email", error: "Nội dung vượt quá số ký tự cho phép." }, { status: 400 });
      }
      if (data.email.trim() !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
        return NextResponse.json({ field: "email", error: "Địa chỉ email không hợp lệ." }, { status: 400 });
      }
      update.email = data.email.trim() || null;
    }
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Chưa có thông tin cần cập nhật" }, { status: 400 });
    }

    const staff = await adminUpdateStaffProfile(id, update);
    if (!staff) return NextResponse.json({ error: "Không tìm thấy nhân viên" }, { status: 404 });
    return NextResponse.json({ staff });
  } catch (e) {
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      e.code === "ER_DUP_ENTRY"
    ) {
      return NextResponse.json({ error: "Email hoặc số điện thoại đã được sử dụng" }, { status: 409 });
    }
    console.error("[admin/staff/update]", e);
    return NextResponse.json({ error: "Không thể cập nhật thông tin nhân viên" }, { status: 500 });
  }
}
