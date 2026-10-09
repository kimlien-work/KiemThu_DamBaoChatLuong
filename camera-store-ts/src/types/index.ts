export interface Category {
  id: number;
  tendanhmuc: string;
}

export interface Product {
  id: number;
  tenmathang: string;
  mota: string;
  giagoc: number;
  giaban: number;
  soluongton: number;
  hinhanh: string;
  danhmuc_id: number;
  luotxem: number;
}

export interface Customer {
  id: number;
  ten: string;
  tendangnhap: string;
  matkhau: string;
  email: string;
  dien_thoai: string;
  diachi: string;
}

export interface News {
  id: number;
  tieude: string;
  noidung: string;
  hinhanh: string;
  ngaydang: string;
  luotxem: number;
}

export interface OrderItem {
  mathang_id: number;
  dongia: number;
  soluong: number;
  thanhtien: number;
  tenmathang?: string;
  hinhanh?: string;
}

export interface Order {
  id: number;
  khach_hang_id: number;
  ngaydat: string;
  tongtien: number;
  diachi: string;
  ghichu: string;
  trangthai: string;
  items: OrderItem[];
}

export interface CartItem {
  id: number;
  soluong: number;
}
