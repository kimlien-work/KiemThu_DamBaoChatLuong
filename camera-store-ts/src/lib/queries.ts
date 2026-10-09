import { query, queryOne, getPool } from "./db";
import type { Category, Product, Customer, News, Order, OrderItem } from "@/types";

// ========== DANH MỤC ==========
export async function getCategories(): Promise<Category[]> {
  return query<Category>("SELECT id, tendanhmuc FROM danhmuc ORDER BY tendanhmuc");
}

export async function getCategoryById(id: number): Promise<Category | null> {
  return queryOne<Category>("SELECT id, tendanhmuc FROM danhmuc WHERE id = ?", [id]);
}

// ========== SẢN PHẨM ==========
export async function getProducts(): Promise<Product[]> {
  return query<Product>(
    "SELECT id, tenmathang, mota, giagoc, giaban, soluongton, hinhanh, danhmuc_id, luotxem, luotmua, trangthai FROM mathang WHERE trangthai = 1 ORDER BY id DESC"
  );
}

export async function getProductById(id: number): Promise<Product | null> {
  return queryOne<Product>(
    "SELECT id, tenmathang, mota, giagoc, giaban, soluongton, hinhanh, danhmuc_id, luotxem, luotmua, trangthai FROM mathang WHERE id = ?",
    [id]
  );
}

export async function getProductsByCategory(
  categoryId: number,
  sort: string = "default"
): Promise<Product[]> {
  let orderBy = "id DESC";
  if (sort === "price_asc") orderBy = "giaban ASC";
  else if (sort === "price_desc") orderBy = "giaban DESC";
  else if (sort === "view") orderBy = "luotxem DESC";

  return query<Product>(
    `SELECT id, tenmathang, mota, giagoc, giaban, soluongton, hinhanh, danhmuc_id, luotxem, luotmua, trangthai
     FROM mathang WHERE danhmuc_id = ? AND trangthai = 1 ORDER BY ${orderBy}`,
    [categoryId]
  );
}

export async function getTopViewed(limit = 8): Promise<Product[]> {
  return query<Product>(
    `SELECT id, tenmathang, mota, giagoc, giaban, soluongton, hinhanh, danhmuc_id, luotxem, luotmua, trangthai
     FROM mathang WHERE trangthai = 1 ORDER BY luotxem DESC LIMIT ?`,
    [limit]
  );
}

export async function increaseView(id: number): Promise<void> {
  await query("UPDATE mathang SET luotxem = luotxem + 1 WHERE id = ?", [id]);
}

// ========== KHÁCH HÀNG ==========
export async function findCustomerByLogin(
  username: string,
  password: string
): Promise<Customer | null> {
  // PHP gốc thường lưu plain text hoặc md5 — thử khớp trực tiếp trước
  return queryOne<Customer>(
    `SELECT id, ten, tendangnhap, mat_khau, email, dien_thoai, dia_chi, trangthai
     FROM khach_hang WHERE tendangnhap = ? AND mat_khau = ? AND trangthai = 1`,
    [username, password]
  );
}

export async function findCustomerByUsername(username: string): Promise<Customer | null> {
  return queryOne<Customer>(
    `SELECT id, ten, tendangnhap, mat_khau, email, dien_thoai, dia_chi, trangthai
     FROM khach_hang WHERE tendangnhap = ?`,
    [username]
  );
}

export async function createCustomer(data: {
  ten: string;
  tendangnhap: string;
  mat_khau: string;
  email?: string;
  dien_thoai: string;
  dia_chi?: string;
}): Promise<number> {
  const pool = getPool();
  const [result] = await pool.execute(
    `INSERT INTO khach_hang (ten, tendangnhap, mat_khau, email, dien_thoai, dia_chi, trangthai)
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
    [
      data.ten,
      data.tendangnhap,
      data.mat_khau,
      data.email || null,
      data.dien_thoai,
      data.dia_chi || null,
    ]
  );
  return (result as { insertId: number }).insertId;
}

export async function updateCustomer(
  id: number,
  data: Partial<Pick<Customer, "ten" | "email" | "dien_thoai" | "dia_chi">>
): Promise<void> {
  await query(
    `UPDATE khach_hang SET ten = COALESCE(?, ten), email = COALESCE(?, email),
     dien_thoai = COALESCE(?, dien_thoai), dia_chi = COALESCE(?, dia_chi) WHERE id = ?`,
    [data.ten ?? null, data.email ?? null, data.dien_thoai ?? null, data.dia_chi ?? null, id]
  );
}

// ========== ĐƠN HÀNG ==========
export async function createOrder(data: {
  khach_hang_id: number;
  tongtien: number;
  ghichu?: string;
  items: { mathang_id: number; dongia: number; soluong: number; thanhtien: number }[];
}): Promise<number> {
  const pool = (await import("./db")).getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [orderResult] = await conn.execute(
      `INSERT INTO donhang (khach_hang_id, tongtien, ghichu, trangthai) VALUES (?, ?, ?, 0)`,
      [data.khach_hang_id, data.tongtien, data.ghichu || null]
    );
    const orderId = (orderResult as { insertId: number }).insertId;

    for (const item of data.items) {
      await conn.execute(
        `INSERT INTO donhangct (donhang_id, mathang_id, dongia, soluong, thanhtien) VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.mathang_id, item.dongia, item.soluong, item.thanhtien]
      );
      // trừ tồn kho
      await conn.execute(
        `UPDATE mathang SET soluongton = GREATEST(0, soluongton - ?), luotmua = luotmua + ? WHERE id = ?`,
        [item.soluong, item.soluong, item.mathang_id]
      );
    }
    await conn.commit();
    return orderId;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function getOrdersByCustomer(customerId: number): Promise<Order[]> {
  return query<Order>(
    `SELECT id, khach_hang_id, ngay, tongtien, ghichu, trangthai
     FROM donhang WHERE khach_hang_id = ? ORDER BY ngay DESC`,
    [customerId]
  );
}

export async function getOrderById(orderId: number, customerId: number): Promise<Order | null> {
  const order = await queryOne<Order>(
    `SELECT id, khach_hang_id, ngay, tongtien, ghichu, trangthai
     FROM donhang WHERE id = ? AND khach_hang_id = ?`,
    [orderId, customerId]
  );
  if (!order) return null;

  const items = await query<OrderItem>(
    `SELECT ct.id, ct.mathang_id, ct.dongia, ct.soluong, ct.thanhtien,
            m.tenmathang, m.hinhanh
     FROM donhangct ct
     LEFT JOIN mathang m ON m.id = ct.mathang_id
     WHERE ct.donhang_id = ?`,
    [orderId]
  );
  order.items = items;
  return order;
}

// ========== TIN TỨC ==========
export async function getNewsList(): Promise<News[]> {
  return query<News>(
    `SELECT id, tieude, tomtat, noidung, hinhanh, ngaydang, luotxem, trangthai
     FROM tin_tuc WHERE trangthai = 1 ORDER BY ngaydang DESC`
  );
}

export async function getNewsById(id: number): Promise<News | null> {
  const news = await queryOne<News>(
    `SELECT id, tieude, tomtat, noidung, hinhanh, ngaydang, luotxem, trangthai
     FROM tin_tuc WHERE id = ? AND trangthai = 1`,
    [id]
  );
  if (news) {
    await query("UPDATE tin_tuc SET luotxem = luotxem + 1 WHERE id = ?", [id]);
  }
  return news;
}

/** Chuẩn hóa đường dẫn ảnh từ DB (images/products/...) thành /images/products/... */
