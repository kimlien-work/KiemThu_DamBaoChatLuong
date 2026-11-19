import { NextResponse } from "next/server";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { getAdminSession } from "@/lib/admin-session";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function imageExtension(buffer: Uint8Array, mimeType: string): "jpg" | "png" | null {
  const jpeg =
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;
  const png =
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a;

  const jpegEnd =
    buffer.length >= 2 &&
    buffer[buffer.length - 2] === 0xff &&
    buffer[buffer.length - 1] === 0xd9;
  const pngEnd =
    buffer.length >= 12 &&
    buffer[buffer.length - 8] === 0x49 &&
    buffer[buffer.length - 7] === 0x45 &&
    buffer[buffer.length - 6] === 0x4e &&
    buffer[buffer.length - 5] === 0x44 &&
    buffer[buffer.length - 4] === 0xae &&
    buffer[buffer.length - 3] === 0x42 &&
    buffer[buffer.length - 2] === 0x60 &&
    buffer[buffer.length - 1] === 0x82;

  if (jpeg && jpegEnd && (mimeType === "image/jpeg" || mimeType === "image/jpg")) return "jpg";
  if (png && pngEnd && mimeType === "image/png") return "png";
  return null;
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Chưa đăng nhập hoặc phiên đã hết hạn." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Vui lòng chọn một tệp hình ảnh." }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "Tệp ảnh rỗng hoặc không thể đọc." }, { status: 400 });
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "Dung lượng ảnh không được vượt quá 5 MB." }, { status: 400 });
    }
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      return NextResponse.json({ error: "Chỉ hỗ trợ ảnh JPG, JPEG hoặc PNG." }, { status: 400 });
    }

    const buffer = new Uint8Array(await file.arrayBuffer());
    const extension = imageExtension(buffer, file.type);
    if (!extension) {
      return NextResponse.json({ error: "Tệp không phải ảnh JPG/PNG hợp lệ hoặc đã bị hỏng." }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "images", "products", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filename = `${randomUUID()}.${extension}`;
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({
      path: `images/products/uploads/${filename}`,
    });
  } catch (error) {
    console.error("[admin/products/upload]", error);
    return NextResponse.json(
      { error: "Không thể tải ảnh lên. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await getAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Chưa đăng nhập hoặc phiên đã hết hạn." }, { status: 401 });
    }

    const imagePath = new URL(request.url).searchParams.get("path");
    if (!imagePath) {
      return NextResponse.json({ ok: true });
    }

    const expectedPrefix = "images/products/uploads/";
    if (!imagePath.startsWith(expectedPrefix)) {
      return NextResponse.json({ error: "Đường dẫn ảnh không hợp lệ." }, { status: 400 });
    }

    const uploadDir = path.resolve(process.cwd(), "public", "images", "products", "uploads");
    const filePath = path.resolve(process.cwd(), "public", imagePath);
    if (!filePath.startsWith(`${uploadDir}${path.sep}`)) {
      return NextResponse.json({ error: "Đường dẫn ảnh không hợp lệ." }, { status: 400 });
    }

    await unlink(filePath).catch(() => undefined);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/products/upload delete]", error);
    return NextResponse.json(
      { error: "Không thể xóa tệp ảnh tạm." },
      { status: 500 }
    );
  }
}
