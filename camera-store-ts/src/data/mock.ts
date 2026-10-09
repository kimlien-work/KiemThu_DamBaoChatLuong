import { Category, Product, Customer, News, Order } from "@/types";

export const categories: Category[] = [
  { id: 1, tendanhmuc: "Máy ảnh DSLR" },
  { id: 2, tendanhmuc: "Máy ảnh Mirrorless" },
  { id: 3, tendanhmuc: "Ống kính" },
  { id: 4, tendanhmuc: "Phụ kiện" },
];

export const products: Product[] = [
  {
    id: 1,
    tenmathang: "Canon EOS R6 Mark II",
    mota: "Máy ảnh mirrorless full-frame cao cấp của Canon. Cảm biến 24.2MP, quay 4K 60fps, chống rung 5 trục, lấy nét mắt real-time.\n\nPhù hợp nhiếp ảnh chuyên nghiệp và quay video.",
    giagoc: 65000000,
    giaban: 59900000,
    soluongton: 8,
    hinhanh:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600",
    danhmuc_id: 2,
    luotxem: 245,
    luotmua: 12,
    trangthai: "Còn hàng",
  },
  {
    id: 2,
    tenmathang: "Sony Alpha A7 IV",
    mota: "Mirrorless full-frame 33MP của Sony. Khả năng quay 4K 60p 10-bit, autofocus 759 điểm, chống rung 5.5 stops.",
    giagoc: 58000000,
    giaban: 54900000,
    soluongton: 12,
    hinhanh:
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600",
    danhmuc_id: 2,
    luotxem: 312,
    luotmua: 25,
    trangthai: "Còn hàng",
  },
  {
    id: 3,
    tenmathang: "Nikon Z6 II",
    mota: "Máy ảnh mirrorless full-frame 24.5MP. Dual EXPEED 6, quay 4K UHD, chống rung 5 trục trong thân máy.",
    giagoc: 48000000,
    giaban: 42900000,
    soluongton: 6,
    hinhanh:
      "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600",
    danhmuc_id: 2,
    luotxem: 178,
    luotmua: 8,
    trangthai: "Còn hàng",
  },
  {
    id: 4,
    tenmathang: "Canon EOS 90D",
    mota: "DSLR APS-C 32.5MP. Quay 4K không crop, tốc độ chụp 10fps, màn hình xoay lật cảm ứng.",
    giagoc: 28000000,
    giaban: 24900000,
    soluongton: 15,
    hinhanh:
      "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=600",
    danhmuc_id: 1,
    luotxem: 421,
    luotmua: 30,
    trangthai: "Còn hàng",
  },
  {
    id: 5,
    tenmathang: "Nikon D850",
    mota: "DSLR full-frame 45.7MP huyền thoại. Độ phân giải cực cao, dynamic range xuất sắc, phù hợp studio và landscape.",
    giagoc: 55000000,
    giaban: 49900000,
    soluongton: 4,
    hinhanh:
      "https://images.unsplash.com/photo-1510127034890-ba275aec2e2c?w=600",
    danhmuc_id: 1,
    luotxem: 289,
    luotmua: 14,
    trangthai: "Còn hàng",
  },
  {
    id: 6,
    tenmathang: "Sony FE 24-70mm f/2.8 GM II",
    mota: "Ống kính zoom tiêu chuẩn cao cấp. Nhỏ gọn hơn thế hệ trước, lấy nét nhanh, chống xóc xuất sắc.",
    giagoc: 52000000,
    giaban: 48900000,
    soluongton: 7,
    hinhanh:
      "https://images.unsplash.com/photo-1606986628253-ef9fd6f2f2b8?w=600",
    danhmuc_id: 3,
    luotxem: 156,
    luotmua: 9,
    trangthai: "Còn hàng",
  },
  {
    id: 7,
    tenmathang: "Canon RF 50mm f/1.2L USM",
    mota: "Ống kính portrait cao cấp ngàm RF. Khẩu độ f/1.2 cực lớn, bokeh mịn, lấy nét siêu nhanh.",
    giagoc: 45000000,
    giaban: 42900000,
    soluongton: 5,
    hinhanh:
      "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=600",
    danhmuc_id: 3,
    luotxem: 203,
    luotmua: 11,
    trangthai: "Còn hàng",
  },
  {
    id: 8,
    tenmathang: "Fujifilm XF 35mm f/1.4 R",
    mota: "Ống kính fixed tiêu chuẩn huyền thoại của Fujifilm. Chất ảnh film-like, xây dựng chắc chắn.",
    giagoc: 15000000,
    giaban: 13500000,
    soluongton: 0,
    hinhanh:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600",
    danhmuc_id: 3,
    luotxem: 98,
    luotmua: 15,
    trangthai: "Hết hàng",
  },
  {
    id: 9,
    tenmathang: "Pin Sony NP-FZ100",
    mota: "Pin chính hãng cho dòng A7 / A9 series. Dung lượng cao, an toàn.",
    giagoc: 1800000,
    giaban: 1590000,
    soluongton: 30,
    hinhanh:
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600",
    danhmuc_id: 4,
    luotxem: 87,
    luotmua: 40,
    trangthai: "Còn hàng",
  },
  {
    id: 10,
    tenmathang: "Thẻ nhớ SDXC 128GB V60",
    mota: "Thẻ nhớ tốc độ cao phù hợp quay 4K. Tốc độ ghi 60MB/s.",
    giagoc: 1200000,
    giaban: 990000,
    soluongton: 50,
    hinhanh:
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600",
    danhmuc_id: 4,
    luotxem: 142,
    luotmua: 60,
    trangthai: "Còn hàng",
  },
  {
    id: 11,
    tenmathang: "Chân máy Manfrotto Befree",
    mota: "Chân máy carbon nhẹ, gấp gọn, phù hợp du lịch và vlog.",
    giagoc: 5500000,
    giaban: 4990000,
    soluongton: 18,
    hinhanh:
      "https://images.unsplash.com/photo-1519638831568-d9897f54ed69?w=600",
    danhmuc_id: 4,
    luotxem: 76,
    luotmua: 7,
    trangthai: "Còn hàng",
  },
  {
    id: 12,
    tenmathang: "Canon EOS R50",
    mota: "Mirrorless APS-C nhỏ gọn cho người mới. 24.2MP, quay 4K 30p, vlog-friendly.",
    giagoc: 22000000,
    giaban: 19900000,
    soluongton: 20,
    hinhanh:
      "https://images.unsplash.com/photo-1581591524425-c7e0978865fc?w=600",
    danhmuc_id: 2,
    luotxem: 334,
    luotmua: 18,
    trangthai: "Còn hàng",
  },
];

export const customers: Customer[] = [
  {
    id: 1,
    ten: "Nguyễn Văn A",
    tendangnhap: "user1",
    matkhau: "123456",
    email: "user1@example.com",
    dien_thoai: "0901234567",
    diachi: "123 Nguyễn Huệ, Q.1, TP.HCM",
  },
  {
    id: 2,
    ten: "Trần Thị B",
    tendangnhap: "user2",
    matkhau: "123456",
    email: "user2@example.com",
    dien_thoai: "0912345678",
    diachi: "456 Lê Lợi, Q.3, TP.HCM",
  },
];

export const newsList: News[] = [
  {
    id: 1,
    tieude: "Canon ra mắt EOS R5 Mark II – Quay 8K RAW",
    noidung:
      "Canon vừa chính thức giới thiệu EOS R5 Mark II với cảm biến stacked mới, khả năng quay 8K RAW 60fps và hệ thống lấy nét AI tiên tiến.\n\nMáy được kỳ vọng sẽ là đối thủ mạnh của Sony A1 II trong phân khúc chuyên nghiệp.",
    hinhanh:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
    ngaydang: "2025-09-15",
    luotxem: 1250,
  },
  {
    id: 2,
    tieude: "Hướng dẫn chọn máy ảnh cho người mới bắt đầu 2025",
    noidung:
      "Bạn đang muốn bắt đầu nhiếp ảnh? Bài viết này sẽ giúp bạn chọn được máy phù hợp ngân sách và nhu cầu: từ entry-level mirrorless đến DSLR cơ bản.\n\nCác tiêu chí quan trọng: cảm biến, hệ thống ống kính, khả năng quay video và trọng lượng.",
    hinhanh:
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800",
    ngaydang: "2025-08-20",
    luotxem: 890,
  },
  {
    id: 3,
    tieude: "Sony FE 85mm f/1.4 GM II – Portrait lens mới",
    noidung:
      "Ống kính portrait huyền thoại được nâng cấp. Nhẹ hơn, lấy nét nhanh hơn và bokeh đẹp hơn thế hệ trước.",
    hinhanh:
      "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800",
    ngaydang: "2025-07-10",
    luotxem: 670,
  },
];

export let orders: Order[] = [];

export function addOrder(order: Order) {
  orders.push(order);
  return order;
}

export function getOrdersByCustomer(customerId: number) {
  return orders.filter((o) => o.khach_hang_id === customerId);
}
