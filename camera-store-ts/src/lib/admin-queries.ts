import { createHash } from "crypto";
import { query, queryOne, getPool } from "./db";
import type { Category, Product, Customer, News, Staff, AdminOrder, OrderItem } from "@/types";

export function md5(text: string): string {
  return createHash("md5").update(text).digest("hex");
}

// ========== AUTH ==========
export async function findStaffByLogin(username: string, password: string): Promise<Staff | null> {
  const hashed = md5(password);
  // Thử MD5 (như PHP) rồi plain text
  const staff = await queryOne<Staff>(
    `SELECT n.id, n.tendangnhap, n.ten, n.chucvu_id, c.ten AS ten_chuc_vu,
            n.dien_thoai, n.email, n.hinhanh, n.trangthai
     FROM nhan_vien n
     LEFT JOIN chuc_vu c ON n.chucvu_id = c.id
     WHERE n.tendangnhap = ? AND (n.mat_khau = ? OR n.mat_khau = ?) AND n.trangthai = 1`,
    [username, hashed, password]
  );
  return staff;
}

// ========== STATS ==========
export async function getAdminStats() {
  const [products] = await query<{ c: number }>("SELECT COUNT(*) as c FROM mathang");
  const [orders] = await query<{ c: number }>("SELECT COUNT(*) as c FROM donhang");
  const [customers] = await query<{ c: number }>("SELECT COUNT(*) as c FROM khach_hang");
  const [pending] = await query<{ c: number }>("SELECT COUNT(*) as c FROM donhang WHERE trangthai = 0");
  const [revenue] = await query<{ s: number }>(
    "SELECT COALESCE(SUM(tongtien),0) as s FROM donhang WHERE trangthai = 2"
  );
  return {
    products: products?.c ?? 0,
    orders: orders?.c ?? 0,
    customers: customers?.c ?? 0,
    pending: pending?.c ?? 0,
    revenue: Number(revenue?.s ?? 0),
  };
}

// ========== PRODUCTS (all, including hidden) ==========
export async function adminGetProducts(): Promise<Product[]> {
  return query<Product>(
    `SELECT id, tenmathang, mota, giagoc, giaban, soluongton, hinhanh, danhmuc_id, luotxem, luotmua, trangthai
     FROM mathang ORDER BY id DESC`
  );
}

export async function adminCreateProduct(data: {
  tenmathang: string;
  mota?: string;
  giagoc: number;
  giaban: number;
  soluongton: number;
  hinhanh?: string;
  danhmuc_id: number;
}): Promise<number> {
  const pool = getPool();
  const [result] = await pool.execute(
    `INSERT INTO mathang (tenmathang, mota, giagoc, giaban, soluongton, hinhanh, danhmuc_id, trangthai)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
    [
      data.tenmathang,
      data.mota || null,
      data.giagoc,
      data.giaban,
      data.soluongton,
      data.hinhanh || null,
      data.danhmuc_id,
    ]
  );
  return (result as { insertId: number }).insertId;
}

export async function adminUpdateProduct(
  id: number,
  data: Partial<{
    tenmathang: string;
    mota: string;
    giagoc: number;
    giaban: number;
    soluongton: number;
    hinhanh: string;
    danhmuc_id: number;
    trangthai: number;
  }>
): Promise<void> {
  await query(
    `UPDATE mathang SET
      tenmathang = COALESCE(?, tenmathang),
      mota = COALESCE(?, mota),
      giagoc = COALESCE(?, giagoc),
      giaban = COALESCE(?, giaban),
      soluongton = COALESCE(?, soluongton),
      hinhanh = COALESCE(?, hinhanh),
      danhmuc_id = COALESCE(?, danhmuc_id),
      trangthai = COALESCE(?, trangthai)
     WHERE id = ?`,
    [
      data.tenmathang ?? null,
      data.mota ?? null,
      data.giagoc ?? null,
      data.giaban ?? null,
      data.soluongton ?? null,
      data.hinhanh ?? null,
      data.danhmuc_id ?? null,
      data.trangthai ?? null,
      id,
    ]
  );
}

export async function adminDeleteProduct(id: number): Promise<void> {
  await query("DELETE FROM mathang WHERE id = ?", [id]);
}

// ========== CATEGORIES ==========
export async function adminCreateCategory(tendanhmuc: string): Promise<number> {
  const pool = getPool();
  const [result] = await pool.execute("INSERT INTO danhmuc (tendanhmuc) VALUES (?)", [tendanhmuc]);
  return (result as { insertId: number }).insertId;
}

export async function adminUpdateCategory(id: number, tendanhmuc: string): Promise<void> {
  await query("UPDATE danhmuc SET tendanhmuc = ? WHERE id = ?", [tendanhmuc, id]);
}

export async function adminDeleteCategory(id: number): Promise<void> {
  await query("DELETE FROM danhmuc WHERE id = ?", [id]);
}

// ========== ORDERS ==========
export async function adminGetOrders(): Promise<AdminOrder[]> {
  return query<AdminOrder>(
    `SELECT d.id, d.khach_hang_id, d.ngay, d.tongtien, d.ghichu, d.trangthai,
            k.ten AS tenkhachhang, k.dien_thoai
     FROM donhang d
     LEFT JOIN khach_hang k ON k.id = d.khach_hang_id
     ORDER BY d.ngay DESC`
  );
}

export async function adminUpdateOrderStatus(id: number, trangthai: number): Promise<void> {
  await query("UPDATE donhang SET trangthai = ? WHERE id = ?", [trangthai, id]);
}

export async function adminGetOrderDetail(id: number): Promise<AdminOrder | null> {
  const order = await queryOne<AdminOrder>(
    `SELECT d.id, d.khach_hang_id, d.ngay, d.tongtien, d.ghichu, d.trangthai,
            k.ten AS tenkhachhang, k.dien_thoai
     FROM donhang d
     LEFT JOIN khach_hang k ON k.id = d.khach_hang_id
     WHERE d.id = ?`,
    [id]
  );
  if (!order) return null;
  order.items = await query<OrderItem>(
    `SELECT ct.id, ct.mathang_id, ct.dongia, ct.soluong, ct.thanhtien, m.tenmathang, m.hinhanh
     FROM donhangct ct LEFT JOIN mathang m ON m.id = ct.mathang_id
     WHERE ct.donhang_id = ?`,
    [id]
  );
  return order;
}

// ========== CUSTOMERS ==========
export async function adminGetCustomers(): Promise<Customer[]> {
  return query<Customer>(
    `SELECT id, ten, tendangnhap, email, dien_thoai, dia_chi, trangthai
     FROM khach_hang ORDER BY id DESC`
  );
}

export async function adminToggleCustomer(id: number, trangthai: number): Promise<void> {
  await query("UPDATE khach_hang SET trangthai = ? WHERE id = ?", [trangthai, id]);
}

// ========== STAFF ==========
export async function adminGetStaff(): Promise<Staff[]> {
  return query<Staff>(
    `SELECT n.id, n.tendangnhap, n.ten, n.chucvu_id, c.ten AS ten_chuc_vu,
            n.dien_thoai, n.email, n.hinhanh, n.trangthai
     FROM nhan_vien n LEFT JOIN chuc_vu c ON n.chucvu_id = c.id
     ORDER BY n.id DESC`
  );
}

// ========== NEWS ==========
export async function adminGetNews(): Promise<News[]> {
  return query<News>(
    `SELECT id, tieude, tomtat, noidung, hinhanh, ngaydang, luotxem, trangthai
     FROM tin_tuc ORDER BY ngaydang DESC`
  );
}

export async function adminCreateNews(data: {
  tieude: string;
  tomtat?: string;
  noidung?: string;
  hinhanh?: string;
}): Promise<number> {
  const pool = getPool();
  const [result] = await pool.execute(
    `INSERT INTO tin_tuc (tieude, tomtat, noidung, hinhanh, trangthai) VALUES (?, ?, ?, ?, 1)`,
    [data.tieude, data.tomtat || null, data.noidung || null, data.hinhanh || null]
  );
  return (result as { insertId: number }).insertId;
}

export async function adminUpdateNews(
  id: number,
  data: Partial<{ tieude: string; tomtat: string; noidung: string; hinhanh: string; trangthai: number }>
): Promise<void> {
  await query(
    `UPDATE tin_tuc SET
      tieude = COALESCE(?, tieude),
      tomtat = COALESCE(?, tomtat),
      noidung = COALESCE(?, noidung),
      hinhanh = COALESCE(?, hinhanh),
      trangthai = COALESCE(?, trangthai)
     WHERE id = ?`,
    [data.tieude ?? null, data.tomtat ?? null, data.noidung ?? null, data.hinhanh ?? null, data.trangthai ?? null, id]
  );
}

export async function adminDeleteNews(id: number): Promise<void> {
  await query("DELETE FROM tin_tuc WHERE id = ?", [id]);
}
