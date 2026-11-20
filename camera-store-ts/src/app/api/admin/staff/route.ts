import { NextResponse } from "next/server";
import { adminCreateStaff, adminGetStaff } from "@/lib/admin-queries";
import { getAdminSession } from "@/lib/admin-session";
import { isValidEmail } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const user = await getAdminSession(request);
    if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    return NextResponse.json(user.chucvu_id === 1 ? await adminGetStaff() : [user]);
  } catch (e) {
    console.error("[admin/staff]", e);
    return NextResponse.json({ error: "Không thể tải thông tin nhân viên" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAdminSession(request);
    if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    if (user.chucvu_id !== 1) {
      return NextResponse.json({ error: "Chỉ Admin mới được thêm nhân viên" }, { status: 403 });
    }

    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Dữ liệu nhân viên không hợp lệ" }, { status: 400 });
    }

    const data = body as Record<string, unknown>;
    const allowedFields = ["ten", "tendangnhap", "mat_khau", "chucvu_id", "dien_thoai", "email"];
    if (Object.keys(data).some((key) => !allowedFields.includes(key))) {
      return NextResponse.json({ error: "Dữ liệu nhân viên chứa trường không được phép" }, { status: 400 });
    }

    if (typeof data.ten !== "string" || !data.ten.trim()) {
      return NextResponse.json({ field: "ten", error: "Vui lòng nhập họ và tên nhân viên." }, { status: 400 });
    }
    const ten = data.ten.trim();
    if (ten.length > 100) {
      return NextResponse.json({ field: "ten", error: "Nội dung vượt quá số ký tự cho phép." }, { status: 400 });
    }

    if (typeof data.tendangnhap !== "string" || !data.tendangnhap.trim()) {
      return NextResponse.json({ field: "tendangnhap", error: "Vui lòng nhập tên đăng nhập." }, { status: 400 });
    }
    const tendangnhap = data.tendangnhap.trim();
    if (tendangnhap.length > 50) {
      return NextResponse.json({ field: "tendangnhap", error: "Nội dung vượt quá số ký tự cho phép." }, { status: 400 });
    }

    if (typeof data.mat_khau !== "string" || !data.mat_khau.trim()) {
      return NextResponse.json({ field: "mat_khau", error: "Vui lòng nhập mật khẩu." }, { status: 400 });
    }
    const matKhau = data.mat_khau;
    if (matKhau.length > 255) {
      return NextResponse.json({ field: "mat_khau", error: "Nội dung vượt quá số ký tự cho phép." }, { status: 400 });
    }

    if (
      typeof data.chucvu_id !== "number" ||
      !Number.isSafeInteger(data.chucvu_id) ||
      data.chucvu_id < 1
    ) {
      return NextResponse.json({ field: "chucvu_id", error: "Vui lòng chọn chức vụ." }, { status: 400 });
    }

    let dienThoai: string | undefined;
    if (data.dien_thoai !== undefined && data.dien_thoai !== null) {
      if (typeof data.dien_thoai !== "string") {
        return NextResponse.json({ field: "dien_thoai", error: "Số điện thoại không hợp lệ." }, { status: 400 });
      }
      dienThoai = data.dien_thoai.trim();
      if (dienThoai.length > 15) {
        return NextResponse.json({ field: "dien_thoai", error: "Nội dung vượt quá số ký tự cho phép." }, { status: 400 });
      }
    }

    let email: string | undefined;
    if (data.email !== undefined && data.email !== null) {
      if (typeof data.email !== "string") {
        return NextResponse.json({ field: "email", error: "Địa chỉ email không hợp lệ." }, { status: 400 });
      }
      email = data.email.trim();
      if (email.length > 80) {
        return NextResponse.json({ field: "email", error: "Nội dung vượt quá số ký tự cho phép." }, { status: 400 });
      }
      if (email && !isValidEmail(email)) {
        return NextResponse.json({ field: "email", error: "Địa chỉ email không hợp lệ." }, { status: 400 });
      }
    }

    const staff = await adminCreateStaff({
      ten,
      tendangnhap,
      mat_khau: matKhau,
      chucvu_id: data.chucvu_id,
      dien_thoai: dienThoai,
      email,
    });
    return NextResponse.json({ staff }, { status: 201 });
  } catch (e) {
    if (typeof e === "object" && e !== null && "code" in e && e.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "Tên đăng nhập, email hoặc số điện thoại đã được sử dụng." },
        { status: 409 }
      );
    }
    if (e instanceof Error && e.message === "Chức vụ không tồn tại.") {
      return NextResponse.json({ field: "chucvu_id", error: e.message }, { status: 400 });
    }
    console.error("[admin/staff/create]", e);
    return NextResponse.json({ error: "Không thể thêm nhân viên" }, { status: 500 });
  }
}
