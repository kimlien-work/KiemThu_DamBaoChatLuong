export interface Category {
  id: number;
  tendanhmuc: string;
}

export interface Product {
  id: number;
  ma_mat_hang?: string;
  tenmathang: string;
  mota: string | null;
  giagoc: number;
  giaban: number;
  soluongton: number;
  hinhanh: string | null;
  danhmuc_id: number;
  luotxem: number;
  luotmua: number;
  trangthai: number;
}

export interface Customer {
  id: number;
  ten: string;
  tendangnhap: string | null;
  mat_khau: string;
  email: string | null;
  dien_thoai: string;
  dia_chi: string | null;
  diem_tich_luy: number;
  trangthai: number;
}

export interface News {
  id: number;
  tieude: string;
  tomtat: string | null;
  noidung: string | null;
  hinhanh: string | null;
  ngaydang: string | null;
  luotxem: number;
  trangthai: number;
}

export interface Staff {
  id: number;
  ma_nhan_vien: string;
  tendangnhap: string | null;
  ten: string;
  chucvu_id: number;
  ten_chuc_vu?: string | null;
  dien_thoai: string | null;
  email: string | null;
  hinhanh: string | null;
  trangthai: number;
}

export interface OrderItem {
  id?: number;
  mathang_id: number;
  dongia: number;
  soluong: number;
  thanhtien: number;
  tenmathang?: string;
  hinhanh?: string | null;
}

export interface Order {
  id: number;
  khach_hang_id: number;
  ngay: string;
  tongtien: number;
  ghichu: string | null;
  trangthai: number;
  items?: OrderItem[];
}

export interface AdminOrder extends Order {
  tenkhachhang?: string | null;
  dien_thoai?: string | null;
}

export interface CartItem {
  id: number;
  soluong: number;
}

export function trangThaiText(status: number): string {
  const map: Record<number, string> = {
    0: "Chờ duyệt",
    1: "Đang giao",
    2: "Hoàn tất",
    3: "Đã hủy",
  };
  return map[status] ?? "Không rõ";
}
