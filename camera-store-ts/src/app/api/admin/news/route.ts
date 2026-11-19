import { NextResponse } from "next/server";
import {
  adminGetNews,
  adminCreateNews,
  adminUpdateNews,
  adminDeleteNews,
} from "@/lib/admin-queries";
import { getAdminSession } from "@/lib/admin-session";
import { normalizeNewsTitle, stripHtml } from "@/lib/textSanitize";

export async function GET(req: Request) {
  try {
    const admin = await getAdminSession(req);
    if (!admin) return NextResponse.json({ error: "Chưa đăng nhập hoặc phiên đã hết hạn." }, { status: 401 });
    return NextResponse.json(await adminGetNews());
  } catch (e) {
    console.error("[admin/news]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAdminSession(req);
    if (!admin) return NextResponse.json({ error: "Chưa đăng nhập hoặc phiên đã hết hạn." }, { status: 401 });
    const body = await req.json();
    const id = await adminCreateNews({
      ...body,
      tieude: normalizeNewsTitle(String(body.tieude || "")),
      tomtat: typeof body.tomtat === "string" ? stripHtml(body.tomtat) : body.tomtat,
      noidung: typeof body.noidung === "string" ? stripHtml(body.noidung) : body.noidung,
    });
    return NextResponse.json({ id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Không thể tạo bài viết.";
    const duplicate =
      message.includes("Tiêu đề bài viết") ||
      message.includes("ER_DUP_ENTRY") ||
      message.includes("uk_tintuc_tieude_key");
    const status = duplicate ? 400 : 500;
    if (duplicate) {
      return NextResponse.json(
        { error: "Tiêu đề bài viết đã tồn tại. Vui lòng sử dụng tiêu đề khác." },
        { status }
      );
    }
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await getAdminSession(req);
    if (!admin) return NextResponse.json({ error: "Chưa đăng nhập hoặc phiên đã hết hạn." }, { status: 401 });
    const body = await req.json();
    const { id, version, force, ...data } = body;
    await adminUpdateNews(
      Number(id),
      {
        ...data,
        tieude: typeof data.tieude === "string" ? normalizeNewsTitle(data.tieude) : data.tieude,
        tomtat: typeof data.tomtat === "string" ? stripHtml(data.tomtat) : data.tomtat,
        noidung: typeof data.noidung === "string" ? stripHtml(data.noidung) : data.noidung,
      },
      Number.isSafeInteger(Number(version)) ? Number(version) : undefined,
      Boolean(force)
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    const status = (e as Error & { status?: number }).status;
    const message = e instanceof Error ? e.message : "Không thể lưu thay đổi.";
    const duplicate =
      message.includes("Tiêu đề bài viết") ||
      message.includes("ER_DUP_ENTRY") ||
      message.includes("uk_tintuc_tieude_key");
    if (duplicate) {
      return NextResponse.json(
        { error: "Tiêu đề bài viết đã tồn tại. Vui lòng sử dụng tiêu đề khác." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: message },
      { status: status === 409 ? 409 : message.includes("Tiêu đề bài viết") ? 400 : 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = await getAdminSession(req);
    if (!admin) return NextResponse.json({ error: "Chưa đăng nhập hoặc phiên đã hết hạn." }, { status: 401 });
    const { searchParams } = new URL(req.url);
    await adminDeleteNews(Number(searchParams.get("id")));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
