import { createHash, randomUUID } from "crypto";
import { query, queryOne, getPool } from "./db";
import type {
  Product,
  Customer,
  News,
  Staff,
  AdminOrder,
  OrderItem,
} from "@/types";
import { calculateLoyaltyPoints } from "./loyalty";
import { normalizeNewsTitle, stripHtml } from "./textSanitize";

export function md5(text: string): string {
  return createHash("md5").update(text).digest("hex");
}

// ========== AUTH ==========
export async function findStaffByLogin(
  username: string,
  password: string
): Promise<Staff | null> {
  const hashed = md5(password);
  return queryOne<Staff>(
    `SELECT n.id, CONCAT('NV', LPAD(n.id, 6, '0')) AS ma_nhan_vien,
            n.tendangnhap, n.ten, n.chucvu_id, c.ten AS ten_chuc_vu,
            n.dien_thoai, n.email, n.hinhanh, n.trangthai
     FROM nhan_vien n
     LEFT JOIN chuc_vu c ON n.chucvu_id = c.id
     WHERE (n.tendangnhap = ? OR CONCAT('NV', LPAD(n.id, 6, '0')) = ?)
       AND n.mat_khau = ? AND n.trangthai = 1`,
    [username, username, hashed]
  );
}

export async function findStaffById(
  id: number,
  activeOnly = true
): Promise<Staff | null> {
  return queryOne<Staff>(
    `SELECT n.id, CONCAT('NV', LPAD(n.id, 6, '0')) AS ma_nhan_vien,
            n.tendangnhap, n.ten, n.chucvu_id, c.ten AS ten_chuc_vu,
            n.dien_thoai, n.email, n.hinhanh, n.trangthai
     FROM nhan_vien n
     LEFT JOIN chuc_vu c ON n.chucvu_id = c.id
     WHERE n.id = ?${activeOnly ? " AND n.trangthai = 1" : ""}`,
    [id]
  );
}

// ========== STATS ==========
export async function getAdminStats(from?: string, to?: string) {
  const [products] = await query<{ c: number }>(
    "SELECT COUNT(*) as c FROM mathang"
  );
  const [orders] = await query<{ c: number }>(
    "SELECT COUNT(*) as c FROM donhang"
  );
  const [customers] = await query<{ c: number }>(
    "SELECT COUNT(*) as c FROM khach_hang"
  );
  const [pending] = await query<{ c: number }>(
    "SELECT COUNT(*) as c FROM donhang WHERE trangthai = 0"
  );
  let revenueSql =
    "SELECT COALESCE(SUM(tongtien),0) as s FROM donhang WHERE trangthai = 2";
  let revenueParams: unknown[] = [];

  if (from && to) {
    revenueSql += " AND ngay >= ? AND ngay < DATE_ADD(?, INTERVAL 1 DAY)";
    revenueParams = [from, to];
  }

  const [revenue] = await query<{ s: number }>(revenueSql, revenueParams);
  return {
    products: products?.c ?? 0,
    orders: orders?.c ?? 0,
    customers: customers?.c ?? 0,
    pending: pending?.c ?? 0,
    revenue: Number(revenue?.s ?? 0),
  };
}

// ========== PRODUCTS (all, including hidden) ==========
export async function adminGetProducts(
  options: {
    keyword?: string;
    categoryId?: number;
    sort?: string;
  } = {}
): Promise<Product[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  const keyword = options.keyword?.trim();

  if (keyword) {
    conditions.push("(tenmathang LIKE ? OR ma_mat_hang LIKE ?)");
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  if (options.categoryId && options.categoryId > 0) {
    conditions.push("danhmuc_id = ?");
    params.push(options.categoryId);
  }

  const orderBy: Record<string, string> = {
    name_asc: "tenmathang ASC, id ASC",
    name_desc: "tenmathang DESC, id DESC",
    price_asc: "giaban ASC, id ASC",
    price_desc: "giaban DESC, id DESC",
    newest: "created_at DESC, id DESC",
    oldest: "created_at ASC, id ASC",
  };
  const sort =
    options.sort && orderBy[options.sort] ? orderBy[options.sort] : "id DESC";

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  return query<Product>(
    `SELECT id, ma_mat_hang, tenmathang, mota, giagoc, giaban, soluongton, hinhanh, danhmuc_id, luotxem, luotmua, trangthai
     FROM mathang ${where} ORDER BY ${sort}`,
    params
  );
}

export async function adminCreateProduct(data: {
  ma_mat_hang?: string;
  tenmathang: string;
  mota?: string;
  giagoc: number;
  giaban: number;
  soluongton: number;
  hinhanh?: string;
  danhmuc_id: number;
}): Promise<number> {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [categories] = await conn.execute(
      "SELECT id FROM danhmuc WHERE id = ? FOR UPDATE",
      [data.danhmuc_id]
    );
    if ((categories as { id: number }[]).length === 0) {
      throw new Error("Danh mục không tồn tại hoặc không còn hợp lệ.");
    }

    let code = data.ma_mat_hang?.trim();
    if (code) {
      code = code.toUpperCase();
      const [duplicates] = await conn.execute(
        "SELECT id FROM mathang WHERE ma_mat_hang = ? LIMIT 1",
        [code]
      );
      if ((duplicates as { id: number }[]).length > 0) {
        throw new Error("Mã mặt hàng đã tồn tại. Vui lòng sử dụng mã khác.");
      }
    }

    const tempCode = `TMP-${randomUUID()}`;
    const [result] = await conn.execute(
      `INSERT INTO mathang (ma_mat_hang, tenmathang, mota, giagoc, giaban, soluongton, hinhanh, danhmuc_id, trangthai)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        tempCode,
        data.tenmathang,
        data.mota || null,
        data.giagoc,
        data.giaban,
        data.soluongton,
        data.hinhanh || null,
        data.danhmuc_id,
      ]
    );
    const productId = (result as { insertId: number }).insertId;
    const finalCode = code || `MH${String(productId).padStart(6, "0")}`;
    await conn.execute("UPDATE mathang SET ma_mat_hang = ? WHERE id = ?", [
      finalCode,
      productId,
    ]);

    await conn.commit();
    return productId;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function adminUpdateProduct(
  id: number,
  data: Partial<{
    ma_mat_hang: string;
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
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [products] = await conn.execute(
      "SELECT id FROM mathang WHERE id = ? FOR UPDATE",
      [id]
    );
    if ((products as { id: number }[]).length === 0) {
      throw new Error("Mặt hàng không tồn tại.");
    }

    if (data.danhmuc_id !== undefined) {
      const [categories] = await conn.execute(
        "SELECT id FROM danhmuc WHERE id = ? FOR UPDATE",
        [data.danhmuc_id]
      );
      if ((categories as { id: number }[]).length === 0) {
        throw new Error("Danh mục không tồn tại hoặc không còn hợp lệ.");
      }
    }

    if (data.ma_mat_hang !== undefined) {
      const code = data.ma_mat_hang.trim().toUpperCase();
      if (!code) throw new Error("Mã mặt hàng không được để trống.");
      const [duplicates] = await conn.execute(
        "SELECT id FROM mathang WHERE ma_mat_hang = ? AND id <> ? LIMIT 1",
        [code, id]
      );
      if ((duplicates as { id: number }[]).length > 0) {
        throw new Error("Mã mặt hàng đã tồn tại. Vui lòng sử dụng mã khác.");
      }
      data.ma_mat_hang = code;
    }

    await conn.execute(
      `UPDATE mathang SET
        ma_mat_hang = COALESCE(?, ma_mat_hang),
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
        data.ma_mat_hang ?? null,
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
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function adminDeleteProduct(id: number): Promise<void> {
  await query("DELETE FROM mathang WHERE id = ?", [id]);
}

// ========== CATEGORIES ==========
export async function adminCreateCategory(tendanhmuc: string): Promise<number> {
  const pool = getPool();
  const [result] = await pool.execute(
    "INSERT INTO danhmuc (tendanhmuc) VALUES (?)",
    [tendanhmuc]
  );
  return (result as { insertId: number }).insertId;
}

export async function adminUpdateCategory(
  id: number,
  tendanhmuc: string
): Promise<void> {
  await query("UPDATE danhmuc SET tendanhmuc = ? WHERE id = ?", [
    tendanhmuc,
    id,
  ]);
}

export async function adminDeleteCategory(id: number): Promise<void> {
  await query("DELETE FROM danhmuc WHERE id = ?", [id]);
}

// ========== ORDERS ==========
export async function adminGetOrders(
  options: {
    keyword?: string;
    includeSensitive?: boolean;
  } = {}
): Promise<AdminOrder[]> {
  const keyword = options.keyword?.trim();
  const sensitiveFields = options.includeSensitive
    ? `d.ghichu, k.ten AS tenkhachhang, k.dien_thoai`
    : `NULL AS ghichu, NULL AS tenkhachhang, NULL AS dien_thoai`;
  const where = keyword ? "WHERE d.id = ?" : "";
  const params = keyword ? [Number(keyword)] : [];

  return query<AdminOrder>(
    `SELECT d.id, d.khach_hang_id, d.ngay, d.tongtien, d.trangthai,
            ${sensitiveFields}
     FROM donhang d
     LEFT JOIN khach_hang k ON k.id = d.khach_hang_id
     ${where}
     ORDER BY d.ngay DESC`,
    params
  );
}

export async function adminUpdateOrderStatus(
  id: number,
  trangthai: number
): Promise<void> {
  if (![0, 1, 2, 3].includes(trangthai)) {
    const error = new Error("Trạng thái đơn hàng không hợp lệ.");
    (error as Error & { status?: number }).status = 400;
    throw error;
  }

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute(
      "SELECT id, khach_hang_id, tongtien, trangthai FROM donhang WHERE id = ? FOR UPDATE",
      [id]
    );
    const orders = rows as {
      id: number;
      khach_hang_id: number;
      tongtien: number;
      trangthai: number;
    }[];
    if (orders.length === 0) {
      const error = new Error("Đơn hàng không tồn tại.");
      (error as Error & { status?: number }).status = 404;
      throw error;
    }

    const order = orders[0];
    const allowedTransitions: Record<number, number[]> = {
      0: [1, 3],
      1: [2, 3],
      2: [3],
      3: [],
    };
    if (!allowedTransitions[order.trangthai]?.includes(trangthai)) {
      const error = new Error(
        "Trạng thái đơn hàng không hợp lệ để thực hiện thao tác."
      );
      (error as Error & { status?: number }).status = 409;
      throw error;
    }
    if (order.trangthai === trangthai) {
      await conn.commit();
      return;
    }

    if (trangthai === 2) {
      const points = calculateLoyaltyPoints(Number(order.tongtien));
      if (points > 0) {
        await conn.execute(
          `INSERT INTO lichsu_diem_tich_luy
           (khach_hang_id, donhang_id, loai, diem, lydo)
           VALUES (?, ?, 'CONG', ?, 'Cộng điểm khi đơn hàng hoàn tất')`,
          [order.khach_hang_id, order.id, points]
        );
        await conn.execute(
          "UPDATE khach_hang SET diem_tich_luy = diem_tich_luy + ? WHERE id = ?",
          [points, order.khach_hang_id]
        );
      }
    }

    if (trangthai === 3 && order.trangthai === 2) {
      const [ledgerRows] = await conn.execute(
        `SELECT diem FROM lichsu_diem_tich_luy
         WHERE donhang_id = ? AND khach_hang_id = ? AND loai = 'CONG'
         LIMIT 1`,
        [order.id, order.khach_hang_id]
      );
      const awarded = (ledgerRows as { diem: number }[])[0];
      if (awarded && Number(awarded.diem) > 0) {
        await conn.execute(
          `INSERT INTO lichsu_diem_tich_luy
           (khach_hang_id, donhang_id, loai, diem, lydo)
           VALUES (?, ?, 'TRU', ?, 'Thu hồi điểm khi đơn hàng bị hủy/hoàn')`,
          [order.khach_hang_id, order.id, Number(awarded.diem)]
        );
        await conn.execute(
          "UPDATE khach_hang SET diem_tich_luy = GREATEST(0, diem_tich_luy - ?) WHERE id = ?",
          [Number(awarded.diem), order.khach_hang_id]
        );
      }
    }

    await conn.execute("UPDATE donhang SET trangthai = ? WHERE id = ?", [
      trangthai,
      id,
    ]);
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function adminGetOrderDetail(
  id: number,
  includeSensitive = true
): Promise<AdminOrder | null> {
  const order = await queryOne<AdminOrder>(
    `SELECT d.id, d.khach_hang_id, d.ngay, d.tongtien,
            ${includeSensitive ? "d.ghichu" : "NULL AS ghichu"},
            d.trangthai,
            ${
              includeSensitive
                ? "k.ten AS tenkhachhang, k.dien_thoai"
                : "NULL AS tenkhachhang, NULL AS dien_thoai"
            }
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
export async function adminGetCustomers(
  options: {
    keyword?: string;
    status?: "all" | "active" | "locked";
  } = {}
): Promise<Customer[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  const keyword = options.keyword?.trim();

  if (keyword) {
    const numericKeyword = keyword.replace(/^#/, "");
    if (/^\d+$/.test(numericKeyword)) {
      conditions.push("(id = ? OR ten LIKE ? OR dien_thoai LIKE ?)");
      params.push(
        Number(numericKeyword),
        `%${numericKeyword}%`,
        `%${numericKeyword}%`
      );
    } else {
      conditions.push("(ten LIKE ? OR dien_thoai LIKE ?)");
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
  }

  if (options.status === "active") {
    conditions.push("trangthai = 1");
  } else if (options.status === "locked") {
    conditions.push("trangthai = 0");
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  return query<Customer>(
    `SELECT id, ten, tendangnhap, email, dien_thoai, dia_chi, diem_tich_luy, trangthai
     FROM khach_hang ${where} ORDER BY id DESC`,
    params
  );
}

export async function adminToggleCustomer(
  id: number,
  trangthai: number
): Promise<void> {
  await query("UPDATE khach_hang SET trangthai = ? WHERE id = ?", [
    trangthai,
    id,
  ]);
}

// ========== STAFF ==========
export async function adminGetStaff(): Promise<Staff[]> {
  return query<Staff>(
    `SELECT n.id, CONCAT('NV', LPAD(n.id, 6, '0')) AS ma_nhan_vien,
            n.tendangnhap, n.ten, n.chucvu_id, c.ten AS ten_chuc_vu,
            n.dien_thoai, n.email, n.hinhanh, n.trangthai
     FROM nhan_vien n LEFT JOIN chuc_vu c ON n.chucvu_id = c.id
     ORDER BY n.id DESC`
  );
}

export async function adminCreateStaff(data: {
  tendangnhap: string;
  ten: string;
  chucvu_id: number;
  mat_khau: string;
  dien_thoai?: string;
  email?: string;
}): Promise<Staff | null> {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [roles] = await conn.execute("SELECT id FROM chuc_vu WHERE id = ?", [
      data.chucvu_id,
    ]);
    if ((roles as { id: number }[]).length === 0) {
      throw new Error("Chức vụ không tồn tại.");
    }

    const [result] = await conn.execute(
      `INSERT INTO nhan_vien
       (tendangnhap, ten, chucvu_id, mat_khau, dien_thoai, email, trangthai)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [
        data.tendangnhap,
        data.ten,
        data.chucvu_id,
        md5(data.mat_khau),
        data.dien_thoai || null,
        data.email || null,
      ]
    );
    await conn.commit();

    return findStaffById((result as { insertId: number }).insertId, false);
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function adminUpdateStaffProfile(
  id: number,
  data: Partial<Pick<Staff, "ten" | "dien_thoai" | "email">>
): Promise<Staff | null> {
  const updates: string[] = [];
  const values: unknown[] = [];

  if (data.ten !== undefined) {
    updates.push("ten = ?");
    values.push(data.ten);
  }
  if (data.dien_thoai !== undefined) {
    updates.push("dien_thoai = ?");
    values.push(data.dien_thoai);
  }
  if (data.email !== undefined) {
    updates.push("email = ?");
    values.push(data.email);
  }

  if (updates.length === 0) return null;
  await query(`UPDATE nhan_vien SET ${updates.join(", ")} WHERE id = ?`, [
    ...values,
    id,
  ]);
  return findStaffById(id, false);
}

// ========== NEWS ==========
export async function adminGetNews(): Promise<News[]> {
  return query<News>(
    `SELECT id, tieude, tomtat, noidung, hinhanh, ngaydang, luotxem, trangthai, updated_at, version
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
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const title = normalizeNewsTitle(data.tieude);
    if (!title) throw new Error("Tiêu đề bài viết không được để trống.");

    const [duplicates] = await conn.execute(
      "SELECT id FROM tin_tuc WHERE LOWER(TRIM(tieude)) = LOWER(TRIM(?)) LIMIT 1",
      [title]
    );
    if ((duplicates as { id: number }[]).length > 0) {
      throw new Error(
        "Tiêu đề bài viết đã tồn tại. Vui lòng sử dụng tiêu đề khác."
      );
    }

    const [result] = await conn.execute(
      `INSERT INTO tin_tuc
       (tieude, tomtat, noidung, hinhanh, trangthai, version)
       VALUES (?, ?, ?, ?, 1, 1)`,
      [
        title,
        data.tomtat ? stripHtml(data.tomtat) : null,
        data.noidung ? stripHtml(data.noidung) : null,
        data.hinhanh || null,
      ]
    );
    await conn.commit();
    return (result as { insertId: number }).insertId;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function adminUpdateNews(
  id: number,
  data: Partial<{
    tieude: string;
    tomtat: string;
    noidung: string;
    hinhanh: string;
    trangthai: number;
  }>,
  expectedVersion?: number,
  force = false
): Promise<void> {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute(
      "SELECT id, version FROM tin_tuc WHERE id = ? FOR UPDATE",
      [id]
    );
    const newsRows = rows as { id: number; version: number }[];
    if (newsRows.length === 0) throw new Error("Bài viết không tồn tại.");

    const current = newsRows[0];
    if (
      !force &&
      expectedVersion !== undefined &&
      Number(current.version) !== Number(expectedVersion)
    ) {
      const conflict = new Error("Bài viết đã được cập nhật bởi Admin khác.");
      (conflict as Error & { status?: number }).status = 409;
      throw conflict;
    }

    let title: string | null = null;
    if (data.tieude !== undefined) {
      title = normalizeNewsTitle(data.tieude);
      if (!title) throw new Error("Tiêu đề bài viết không được để trống.");

      const [duplicates] = await conn.execute(
        "SELECT id FROM tin_tuc WHERE LOWER(TRIM(tieude)) = LOWER(TRIM(?)) AND id <> ? LIMIT 1",
        [title, id]
      );
      if ((duplicates as { id: number }[]).length > 0) {
        throw new Error(
          "Tiêu đề bài viết đã tồn tại. Vui lòng sử dụng tiêu đề khác."
        );
      }
    }

    await conn.execute(
      `UPDATE tin_tuc SET
        tieude = COALESCE(?, tieude),
        tomtat = COALESCE(?, tomtat),
        noidung = COALESCE(?, noidung),
        hinhanh = COALESCE(?, hinhanh),
        trangthai = COALESCE(?, trangthai),
        version = version + 1
       WHERE id = ?`,
      [
        title,
        data.tomtat !== undefined ? stripHtml(data.tomtat) : null,
        data.noidung !== undefined ? stripHtml(data.noidung) : null,
        data.hinhanh ?? null,
        data.trangthai ?? null,
        id,
      ]
    );
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function adminDeleteNews(id: number): Promise<void> {
  await query("DELETE FROM tin_tuc WHERE id = ?", [id]);
}
