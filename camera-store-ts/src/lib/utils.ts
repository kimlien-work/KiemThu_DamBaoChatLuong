/** Chuẩn hóa đường dẫn ảnh từ DB thành URL public (encode khoảng trắng) */
export function imageUrl(path: string | null | undefined): string {
  if (!path) {
    return "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400";
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Bỏ ../ nếu có, đảm bảo bắt đầu bằng /
  const clean = path.replace(/^\.\.\//, "").replace(/^\/+/, "");
  // Encode từng phần (xử lý khoảng trắng, dấu ngoặc)
  const encoded = clean
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return "/" + encoded;
}

export function formatPrice(n: number) {
  return Number(n).toLocaleString("vi-VN") + "đ";
}

export function isValidPhoneNumber(value: string): boolean {
  return /^\d{10,12}$/.test(value);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidPassword(value: string): boolean {
  return (
    Array.from(value).length >= 8 &&
    /\p{Lu}/u.test(value) &&
    /\p{N}/u.test(value) &&
    /[^\p{L}\p{N}\s]/u.test(value)
  );
}
