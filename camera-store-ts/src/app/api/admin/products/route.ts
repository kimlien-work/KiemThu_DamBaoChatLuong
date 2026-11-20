import { NextResponse } from "next/server";
import {
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
} from "@/lib/admin-queries";
import { getAdminSession } from "@/lib/admin-session";

function isMissingProductCodeColumn(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  return (
    "code" in error &&
    error.code === "ER_BAD_FIELD_ERROR" &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.includes("ma_mat_hang")
  );
}

export async function GET(req: Request) {
  try {
    const admin = await getAdminSession(req);
    if (!admin) return NextResponse.json({ error: "Chưa đăng nhập hoặc phiên đã hết hạn." }, { status: 401 });
    const searchParams = new URL(req.url).searchParams;
    const keyword = searchParams.get("q")?.trim();
    const categoryId = Number(searchParams.get("categoryId")) || undefined;
    const sort = searchParams.get("sort")?.trim();

    return NextResponse.json(await adminGetProducts({
      keyword: keyword || undefined,
      categoryId,
      sort: sort || undefined,
    }));
  } catch (e) {
    console.error("[admin/products]", e);
    if (isMissingProductCodeColumn(e)) {
      return NextResponse.json(
        {
          error:
            "Cơ sở dữ liệu chưa có cột mã mặt hàng. Hãy chạy database/migration_product_code.sql trên database của cửa hàng.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Không thể tải danh sách mặt hàng. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAdminSession(req);
    if (!admin) return NextResponse.json({ error: "Chưa đăng nhập hoặc phiên đã hết hạn." }, { status: 401 });
    const body = await req.json();
    const id = await adminCreateProduct(body);
    return NextResponse.json({ id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Không thể tạo mặt hàng.";
    const duplicateCode =
      message.includes("ER_DUP_ENTRY") ||
      message.includes("Duplicate entry") ||
      message.includes("uk_ma_mat_hang");
    const status =
      duplicateCode ||
      message.includes("Mã mặt hàng") ||
      message.includes("Danh mục")
        ? 400
        : 500;
    return NextResponse.json({
      error: duplicateCode ? "Mã mặt hàng đã tồn tại. Vui lòng sử dụng mã khác." : message,
    }, { status });
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await getAdminSession(req);
    if (!admin) return NextResponse.json({ error: "Chưa đăng nhập hoặc phiên đã hết hạn." }, { status: 401 });
    const body = await req.json();
    const { id, ...data } = body;
    await adminUpdateProduct(Number(id), data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Không thể cập nhật mặt hàng.";
    const duplicateCode =
      message.includes("ER_DUP_ENTRY") ||
      message.includes("Duplicate entry") ||
      message.includes("uk_ma_mat_hang");
    const status =
      duplicateCode ||
      message.includes("Mã mặt hàng") ||
      message.includes("Danh mục") ||
      message.includes("không tồn tại")
        ? 400
        : 500;
    return NextResponse.json({
      error: duplicateCode ? "Mã mặt hàng đã tồn tại. Vui lòng sử dụng mã khác." : message,
    }, { status });
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = await getAdminSession(req);
    if (!admin) return NextResponse.json({ error: "Chưa đăng nhập hoặc phiên đã hết hạn." }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    await adminDeleteProduct(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
