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

/** Tên đăng nhập: bắt buộc, tối đa 50 ký tự, không có khoảng trắng đầu/cuối */
export function isValidUsername(value: string): boolean {
  return value.length > 0 && value.length <= 50 && value === value.trim();
}

/** Họ tên: bắt buộc (sau khi cắt khoảng trắng), tối đa 100 ký tự */
export function isValidFullName(value: string): boolean {
  const v = value.trim();
  return v.length > 0 && Array.from(v).length <= 100;
}

/** Địa chỉ: tối đa 255 ký tự */
export function isValidAddress(value: string): boolean {
  return Array.from(value.trim()).length <= 255;
}

/** Email: không bắt buộc; nếu có phải đúng định dạng và tối đa 80 ký tự */
export function isValidOptionalEmail(value: string | null | undefined): boolean {
  if (value === undefined || value === null || value === "") return true;
  return typeof value === "string" && value.length <= 80 && isValidEmail(value);
}
