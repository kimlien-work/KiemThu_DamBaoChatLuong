-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 23, 2026 at 10:26 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `camera_shop`
--

-- --------------------------------------------------------

--
-- Table structure for table `chuc_vu`
--

CREATE TABLE `chuc_vu` (
  `id` int UNSIGNED NOT NULL,
  `ten` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `he_so` decimal(5,2) DEFAULT 1.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chuc_vu`
--

INSERT INTO `chuc_vu` (`id`, `ten`, `he_so`) VALUES
(1, 'Quản trị', 1.00),
(2, 'Nhân viên', 1.00);

-- --------------------------------------------------------

--
-- Table structure for table `danhmuc`
--

CREATE TABLE `danhmuc` (
  `id` int UNSIGNED NOT NULL,
  `tendanhmuc` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `danhmuc`
--

INSERT INTO `danhmuc` (`id`, `tendanhmuc`) VALUES
(1, 'Canon'),
(4, 'Fujifilm'),
(5, 'Khác'),
(2, 'Nikon'),
(6, 'Olympic'),
(3, 'Sony');

-- --------------------------------------------------------

--
-- Table structure for table `diachi`
--

CREATE TABLE `diachi` (
  `id` int UNSIGNED NOT NULL,
  `khach_hang_id` int UNSIGNED NOT NULL,
  `diachi` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `macdinh` tinyint UNSIGNED NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `diachi`
--

INSERT INTO `diachi` (`id`, `khach_hang_id`, `diachi`, `macdinh`) VALUES
(1, 5, '///', 1),
(2, 5, '///', 1),
(3, 5, '///', 1),
(4, 5, '///', 1),
(5, 5, '///', 1);

-- --------------------------------------------------------

--
-- Table structure for table `donhang`
--

CREATE TABLE `donhang` (
  `id` int UNSIGNED NOT NULL,
  `khach_hang_id` int UNSIGNED NOT NULL,
  `diachi_id` int UNSIGNED DEFAULT NULL,
  `ngay` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tongtien` decimal(15,0) NOT NULL DEFAULT '0',
  `ghichu` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangthai` int NOT NULL DEFAULT '0' COMMENT '0: Chờ duyệt, 1: Đang giao, 2: Hoàn tất, 3: Đã hủy'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `donhang`
--

INSERT INTO `donhang` (`id`, `khach_hang_id`, `diachi_id`, `ngay`, `tongtien`, `ghichu`, `trangthai`) VALUES
(1, 5, 1, '2026-04-23 12:56:14', 26000000, ' | Thanh toán khi nhận hàng (COD)', 0),
(2, 5, 2, '2026-04-23 13:11:29', 50000000, ' | Thanh toán khi nhận hàng (COD)', 0),
(3, 5, 3, '2026-04-23 14:58:45', 20000000, ' | Thanh toán khi nhận hàng (COD)', 0),
(4, 5, 4, '2026-04-23 16:02:14', 43000000, ' | COD', 0),
(5, 5, 5, '2026-04-23 16:17:54', 5000000, ' | COD', 0);

--
-- Triggers `donhang`
--
DELIMITER $$
CREATE TRIGGER `trg_tang_diem_tich_luy` AFTER INSERT ON `donhang` FOR EACH ROW BEGIN
    UPDATE `khach_hang`
    SET `diem_tich_luy` = `diem_tich_luy` + (NEW.tongtien / 10000)
    WHERE `id` = NEW.khach_hang_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `donhangct`
--

CREATE TABLE `donhangct` (
  `id` int UNSIGNED NOT NULL,
  `donhang_id` int UNSIGNED NOT NULL,
  `mathang_id` int UNSIGNED NOT NULL,
  `dongia` decimal(15,0) NOT NULL,
  `soluong` smallint UNSIGNED NOT NULL,
  `thanhtien` decimal(15,0) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `donhangct`
--

INSERT INTO `donhangct` (`id`, `donhang_id`, `mathang_id`, `dongia`, `soluong`, `thanhtien`) VALUES
(1, 1, 78, 6500000, 4, 26000000),
(2, 2, 79, 10000000, 5, 50000000),
(3, 3, 78, 6500000, 1, 6500000),
(4, 3, 77, 13500000, 1, 13500000),
(5, 4, 79, 10000000, 3, 30000000),
(6, 4, 78, 6500000, 2, 13000000),
(7, 5, 1, 2500000, 2, 5000000);

--
-- Triggers `donhangct`
--
DELIMITER $$
CREATE TRIGGER `trg_tang_luot_mua` AFTER INSERT ON `donhangct` FOR EACH ROW BEGIN
    UPDATE `mathang`
    SET `luotmua` = `luotmua` + NEW.soluong
    WHERE `id` = NEW.mathang_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `khach_hang`
--

CREATE TABLE `khach_hang` (
  `id` int UNSIGNED NOT NULL,
  `tendangnhap` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ten` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `dien_thoai` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dia_chi` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mat_khau` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `hinhanh` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `diem_tich_luy` int UNSIGNED NOT NULL DEFAULT '0',
  `trangthai` tinyint UNSIGNED NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `khach_hang`
--

INSERT INTO `khach_hang` (`id`, `tendangnhap`, `ten`, `dien_thoai`, `email`, `dia_chi`, `mat_khau`, `hinhanh`, `diem_tich_luy`, `trangthai`, `created_at`) VALUES
(1, 'kh1', 'Nguyễn Thị Thu An', '0988994686', 'kh1@gmail.com', NULL, '900150983cd24fb0d6963f7d28e17f72', NULL, 0, 1, '2026-04-19 06:31:05'),
(2, 'kh2', 'Hồ Xuân Minh', '0988994687', 'kh2@gmail.com', NULL, '900150983cd24fb0d6963f7d28e17f72', NULL, 0, 1, '2026-04-19 06:31:05'),
(3, '0999888777', 'Khách hàng VIP', '0999888777', NULL, NULL, '900150983cd24fb0d6963f7d28e17f72', NULL, 0, 1, '2026-04-19 06:31:05'),
(4, '1234567890', 'abc', '1234567890', NULL, NULL, '900150983cd24fb0d6963f7d28e17f72', NULL, 0, 1, '2026-04-19 06:31:05'),
(5, 'user', 'abc', '0123456789', 'abc@abc.com', '///', '900150983cd24fb0d6963f7d28e17f72', NULL, 14400, 1, '2026-04-23 12:04:11');

-- --------------------------------------------------------

--
-- Table structure for table `mathang`
--

CREATE TABLE `mathang` (
  `id` int UNSIGNED NOT NULL,
  `tenmathang` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mota` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `giagoc` decimal(15,0) NOT NULL DEFAULT '0',
  `giaban` decimal(15,0) NOT NULL DEFAULT '0',
  `soluongton` smallint UNSIGNED NOT NULL DEFAULT '0',
  `hinhanh` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `danhmuc_id` int UNSIGNED NOT NULL,
  `luotxem` int UNSIGNED NOT NULL DEFAULT '0',
  `luotmua` int UNSIGNED NOT NULL DEFAULT '0',
  `trangthai` tinyint UNSIGNED NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `mathang`
--

INSERT INTO `mathang` (`id`, `tenmathang`, `mota`, `giagoc`, `giaban`, `soluongton`, `hinhanh`, `danhmuc_id`, `luotxem`, `luotmua`, `trangthai`, `created_at`, `updated_at`) VALUES
(1, 'Camera hành trình Gopro Hero 6', '<p>Tình trạng: 99%. Thông số: Quay phim 4K 60fps.</p>', 2500000, 2500000, 4, 'images/products/khac/1.jpg', 5, 0, 2, 1, '2026-04-19 06:31:05', '2026-04-23 16:23:33'),
(2, 'Camera hành trình Gopro Hero 7 White', 'Tình trạng: 99%. Thông số: Quay Video Full HD 1080p60fps.', 2000000, 2000000, 8, 'images/products/khac/2.jpg', 5, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(3, 'Leica D-LUX ( Typ 109 )', 'Tình trạng: 98%. Thông số: Cảm biến lớn 4/3 inch, ống kính f/1.7-2.8.', 17000000, 17000000, 2, 'images/products/khac/3.jpg', 5, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(4, 'LUMIX GF9 KÈM YUNEEC 14-42mm', 'Tình trạng: 99%. Thông số: Bộ cảm biến 16 MP Live MOS.', 8500000, 8500000, 5, 'images/products/khac/4.jpg', 5, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(5, 'Máy ảnh Film Kodak Ultra F9', 'Tình trạng: 99%. Thông số: Định dạng phim: 35mm.', 1600000, 1600000, 15, 'images/products/khac/5.jpg', 5, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(6, 'OLYMPUS EM10 MARK III KÈM 14-42MM', 'Tình trạng: 98%. Thông số: Bộ cảm biến MOS Live Four Thirds 16.1MP.', 9500000, 9500000, 4, 'images/products/khac/6.jpg', 5, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(7, 'Olympus OM-D E-M5', 'Tình trạng: Khá. Thông số: Chống nước, cảm giác cầm chắc chắn.', 5500000, 5500000, 6, 'images/products/khac/7.jpg', 5, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(8, 'OLYMPUS OM-D E-M5 MARK II KIT 14-42MM (BẠC)', 'Tình trạng: 95%. Thông số: Loại cảm biến Micro Four Thirds Live MOS.', 10000000, 10000000, 3, 'images/products/khac/8.jpg', 5, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(9, 'Olympus PEN-F (Body, Sliver)', 'Tình trạng: 99%. Thông số: Cảm biến 20 Megapixels.', 11500000, 11500000, 2, 'images/products/khac/9.jpg', 5, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(10, 'Panasonic Lumix DC-G100 Kit G Vario 12-32mm F3.5-5.6', 'Tình trạng: 95%. Thông số: Cảm biến Micro Four Thirds.', 14500000, 14500000, 5, 'images/products/khac/10.jpg', 5, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(11, 'PANASONIC LUMIX DC-GF10 KIT G VARIO 12-32MM/HỒNG', 'Tình trạng: 95%. Thông số: Cảm biến MOS 16MP kích thước Four Thirds.', 9500000, 9500000, 7, 'images/products/khac/11.jpg', 5, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(12, 'Panasonic LUMIX DMC- GF6', 'Tình trạng: Khá. Thông số: Cảm biến Live MOS 16 megapixel.', 4000000, 4000000, 9, 'images/products/khac/12.jpg', 5, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(13, 'Panasonic Lumix FZ300', 'Tình trạng: Khá. Thông số: Ống kính Leica DC Vario Elmarit f/2.8 toàn dải.', 6200000, 6200000, 4, 'images/products/khac/13.jpg', 5, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(14, 'Panasonic Lumix GF6 kèm ống kính 14-42mm F/3.5-5.6', 'Tình trạng: 99%. Thông số: Cảm biến MOS 16MP.', 5500000, 5500000, 6, 'images/products/khac/14.jpg', 5, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(15, 'Pentax K-3', 'Tình trạng: Khá. Thông số: Cảm biến CMOS APS-C 24.35MP.', 11500000, 11500000, 3, 'images/products/khac/15.jpg', 5, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(16, 'Pentax K-S2 SR ống kính 18-135 WR', 'Tình trạng: 99%. Thông số: Chống chịu thời tiết, kèm ống kính 18-135mm.', 11000000, 11000000, 4, 'images/products/khac/16.jpg', 5, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(17, 'Canon 200D Mark II + kit 18-55mm f/4-5.6 IS STM', 'Tình trạng: 98%. Cảm biến CMOS 24.1MP.', 11000000, 11000000, 5, 'images/products/canon/canon (1).jpg', 1, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(18, 'Canon 5D Mark III', 'Tình trạng: 99%. Cảm biến CMOS Full frame 22.3MP.', 31000000, 31000000, 3, 'images/products/canon/canon (2).jpg', 1, 2, 0, 1, '2026-04-19 06:31:05', '2026-04-22 18:56:03'),
(19, 'CANON EOS 2000D KIT EF-S18-55MM F3.5-5.6 II', 'Tình trạng: 98%. Cảm biến 24.1MP APS-C CMOS.', 6000000, 6000000, 7, 'images/products/canon/canon (3).jpg', 1, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(20, 'CANON EOS 80D KIT EF-S18-55MM F3.5-5.6 IS STM', 'Tình trạng: 98%. Cảm biến hình ảnh CMOS APS-C 24.2MP.', 12500000, 12500000, 4, 'images/products/canon/canon (4).jpg', 1, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(21, 'CANON EOS 9000D / Canon 77D + 18-55mm STM', 'Tình trạng: 98%. Cảm biến APS-C.', 10500000, 10500000, 5, 'images/products/canon/canon (5).jpg', 1, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(22, 'Canon EOS M50 + Lens 15-45mm (White)', 'Tình trạng: 98%. Cảm biến APS-C CMOS 24.1MP.', 13000000, 13000000, 6, 'images/products/canon/canon (6).jpg', 1, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(23, 'Canon EOS R50 V + Lens 14-30mm f/4-6.3 Likenew', 'Tình trạng: 98%. Cảm biến APS-C CMOS 24.2MP.', 19500000, 19500000, 2, 'images/products/canon/canon (7).jpg', 1, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(24, 'Canon G1x Mark II', 'Tình trạng: 98%. Cảm biến CMOS 1.5 inch.', 8000000, 8000000, 4, 'images/products/canon/canon (8).jpg', 1, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(25, 'Canon Powershot V1', 'Tình trạng: 100%. Máy ảnh compact cao cấp cho vlogging, livestream.', 20000000, 20000000, 10, 'images/products/canon/canon (9).jpg', 1, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(26, 'Máy ảnh Canon 1100D ( Rebel T3 ) + ống kính 18-55mm F/3.5-5.6', 'Tình trạng: 99%. Cảm biến 12.2MP CMOS APS-C.', 3500000, 3500000, 8, 'images/products/canon/canon (10).jpg', 1, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(27, 'Máy ảnh Canon 60D (Body)', 'Tình trạng: 98%. Cảm biến CMOS kích thước APS-C 18.0 megapixel.', 4800000, 4800000, 5, 'images/products/canon/canon (11).jpg', 1, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(28, 'MÁY ẢNH CANON EOS 6D BODY', 'Tình trạng: 99%. Cảm biến CMOS 20.2 Megapixel.', 8000000, 8000000, 3, 'images/products/canon/canon (12).jpg', 1, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(29, 'Máy ảnh Canon EOS M3 Kèm Ống 15-45 STM', 'Tình trạng: 98%. Máy ảnh Canon không gương lật thế hệ 2015.', 10000000, 10000000, 4, 'images/products/canon/canon (13).jpg', 1, 3, 0, 1, '2026-04-19 06:31:05', '2026-04-23 15:26:48'),
(30, 'MÁY ẢNH CANON POWER SHOT G3X', 'Tình trạng: 99%. Cảm biến CMOS 20.2 megapixel.', 8500000, 8500000, 2, 'images/products/canon/canon (14).jpg', 1, 1, 0, 1, '2026-04-19 06:31:05', '2026-04-23 15:26:46'),
(31, 'Máy ảnh Canon PowerShot G16', 'Tình trạng: 98%. Xử lý hình ảnh DIGIC 6.', 7000000, 7000000, 6, 'images/products/canon/canon (15).jpg', 1, 1, 0, 1, '2026-04-19 06:31:05', '2026-04-23 15:26:44'),
(32, 'Máy ảnh Canon PowerShot G9X', 'Tình trạng: 99%. Cảm biến CMOS 20.2MP.', 9000000, 9000000, 5, 'images/products/canon/canon (16).jpg', 1, 1, 0, 1, '2026-04-19 06:31:05', '2026-04-23 15:23:05'),
(33, 'Fujifilm FinePix S8600 xách tay', 'Tình trạng: 95%. Cảm biến CCD 16MP 1/2.3 inch, zoom quang học 36x.', 1300000, 1300000, 5, 'images/products/fujifilm/fujifilm (1).jpg', 4, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(34, 'Fujifilm Instax Mini 12', 'Tình trạng: 100%. Loại máy ảnh chụp lấy liền thời trang.', 2390000, 2390000, 20, 'images/products/fujifilm/fujifilm (2).jpg', 4, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(35, 'Fujifilm instax SQUARE SQ10', 'Tình trạng: 99%. Máy ảnh lấy liền kỹ thuật số với màn hình LCD.', 4000000, 4000000, 8, 'images/products/fujifilm/fujifilm (3).jpg', 4, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(36, 'Fujifilm mirroless X-T1 cũ (XT1)', 'Tình trạng: 99%. Cảm biến X-Trans CMOS II 16.3MP.', 10000000, 10000000, 3, 'images/products/fujifilm/fujifilm (4).jpg', 4, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(37, 'Fujifilm X-A2 kèm 16-50mm f/3.5-5.6 OIS II cũ', 'Tình trạng: 95%. Màn hình lật 175 độ chuyên selfie.', 7500000, 7500000, 6, 'images/products/fujifilm/fujifilm (5).jpg', 4, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(38, 'Fujifilm X-A3 Kit XC 16-50 F', 'Tình trạng: 99%. Độ phân giải 24.2MP CMOS APS-C.', 10500000, 10500000, 5, 'images/products/fujifilm/fujifilm (6).jpg', 4, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(39, 'Fujifilm X-E2 + Kit 16-50mm', 'Tình trạng: 99%. Hệ thống lấy nét 77 điểm cực nhanh.', 9800000, 9800000, 4, 'images/products/fujifilm/fujifilm (7).jpg', 4, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(40, 'Fujifilm X-E3', 'Tình trạng: 98%. Cảm biến X-Trans III 24.3MP, quay phim 4K.', 15000000, 15000000, 2, 'images/products/fujifilm/fujifilm (8).jpg', 4, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(41, 'Fujifilm X-T2 body', 'Tình trạng: 99%. Cảm biến APS-C X-Trans CMOS III.', 15000000, 15000000, 3, 'images/products/fujifilm/fujifilm (9).jpg', 4, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(42, 'Fujifilm X-T30 Mark II Body (Sliver), 98%', 'Tình trạng: 98%. Cảm biến 26.1MP X-Trans IV CMOS.', 25500000, 25500000, 2, 'images/products/fujifilm/fujifilm (10).jpg', 4, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(43, 'Instax Mini 40', 'Tình trạng: 100%. Thiết kế cổ điển, chụp ảnh lấy liền.', 2950000, 2950000, 12, 'images/products/fujifilm/fujifilm (11).jpg', 4, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(44, 'Máy ảnh Fujifilm X100s', 'Tình trạng: 98%. Cảm biến ảnh APS-C X-Trans CMOS II 16.3MP.', 10500000, 10500000, 2, 'images/products/fujifilm/fujifilm (12).jpg', 4, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(45, 'MÁY ẢNH FUJIFILM X-A7 KIT 15-45MM F 3.5.5.6 OIS PZ CHÍNH HÃNG', 'Tình trạng: 99%. Quay video 4K/30p, màn hình cảm ứng xoay lật.', 14500000, 14500000, 4, 'images/products/fujifilm/fujifilm (13).jpg', 4, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(46, 'Máy ảnh Fujifilm X-E1 + Kit 16-50 OIS', 'Tình trạng: 99%. Thiết kế hoài cổ, cảm biến X-Trans CMOS.', 7500000, 7500000, 3, 'images/products/fujifilm/fujifilm (14).jpg', 4, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(47, 'Máy ảnh Fujifilm XF10 Body ( Black), mới 98%', 'Tình trạng: 98%. Cảm biến APS-C 24.2MP trong thân hình nhỏ gọn.', 10000000, 10000000, 2, 'images/products/fujifilm/fujifilm (15).jpg', 4, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(48, 'Máy ảnh Fujifilm X-T1 Graphite Silver Edition, 98%', 'Tình trạng: 98%. Phiên bản màu bạc Graphite đặc biệt.', 11000000, 11000000, 1, 'images/products/fujifilm/fujifilm (16).jpg', 4, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(49, 'Máy ảnh Nikon D2X', 'Tình trạng: 99%. Độ phân giải: 12.4 triệu điểm ảnh.', 4000000, 4000000, 3, 'images/products/nikon/nikon (1).jpg', 2, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(50, 'Máy ảnh Nikon D3400 + Lens 18-55mm F/3.5-5.6 VR (Hàng chính hãng VIC VN)', 'Tình trạng: 99%. Cảm biến DX CMOS 24.2 MP, không có bộ lọc thông thấp.', 5500000, 5500000, 6, 'images/products/nikon/nikon (2).jpg', 2, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(51, 'Máy ảnh Nikon D7100', 'Tình trạng: 99%. Máy ảnh DSLR mới nhất với cảm biến CMOS 24.1.', 6500000, 6500000, 4, 'images/products/nikon/nikon (3).jpg', 2, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(52, 'Máy ảnh Nikon D810 (Body), 98%', 'Tình trạng: 98%. Cảm biến CMOS định dạng 36.3MP.', 16500000, 16500000, 2, 'images/products/nikon/nikon (4).jpg', 2, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(53, 'Máy ảnh Nikon D90 (Body)', 'Tình trạng: 99%. Cảm biến CMOS độ phân giải 12.3 Megapixels.', 2500000, 2500000, 5, 'images/products/nikon/nikon (5).jpg', 2, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(54, 'Nikon 35mm F1.4 Nano', 'Tình trạng: 99%. Loại ống kính F-Mount / FX Format.', 15000000, 15000000, 2, 'images/products/nikon/nikon (6).jpg', 2, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(55, 'Nikon Coolpix A900', 'Tình trạng: 98%. Cảm biến BSI CMOS 20MP.', 7000000, 7000000, 4, 'images/products/nikon/nikon (7).jpg', 2, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(56, 'Nikon Coolpix P900', 'Tình trạng: 98%. Thiết kế ấn tượng, siêu zoom, trọng lượng khoảng 899g.', 8000000, 8000000, 3, 'images/products/nikon/nikon (8).jpg', 2, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(57, 'Nikon D300s (Body)', 'Tình trạng: 99%. Khả năng quay video HD 720p và chụp liên tiếp 7 hình/giây.', 7500000, 7500000, 4, 'images/products/nikon/nikon (9).jpg', 2, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(58, 'Nikon D3400 + Lens AF-P 18-55 F/3.5-5.6G VR', 'Tình trạng: 98%. Cảm biến CMOS 24.2MP, bộ xử lý EXPEED 4.', 5500000, 5500000, 6, 'images/products/nikon/nikon (10).jpg', 2, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(59, 'NIKON D5300 + KIT AF-S 18-105 ED VR', '<p>Tình trạng: 95%. Cảm biến CMOS 24.2 megapixel.</p>', 6000000, 6000000, 1, 'images/products/nikon/nikon (11).jpg', 2, 0, 0, 1, '2026-04-19 06:31:05', '2026-04-23 16:16:45'),
(60, 'Nikon D5300 + Lens 18-55 VR II', 'Tình trạng: 99%. Hệ thống lấy nét 39 điểm ấn tượng.', 5800000, 5800000, 5, 'images/products/nikon/nikon (12).jpg', 2, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(61, 'Nikon D5500 + Kit 18-55 VR II', 'Tình trạng: 98%. Cảm biến CMOS 24.2 MP định dạng DX.', 6500000, 6500000, 4, 'images/products/nikon/nikon (13).jpg', 2, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(62, 'Nikon D750', 'Tình trạng: 100%. Cảm biến CMOS 24.3MP Full Frame.', 12500000, 12500000, 2, 'images/products/nikon/nikon (14).jpg', 2, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(63, 'NIKON D7500 KÈM 18-140MM', 'Tình trạng: 98%. Cảm biến ảnh 20.9 MP APS-C.', 15000000, 15000000, 2, 'images/products/nikon/nikon (15).jpg', 2, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(64, 'Nikon D800E (Body)', 'Tình trạng: 98%. Cảm biến Full Frame 36.3MP, chip xử lý Expeed 3.', 19000000, 19000000, 1, 'images/products/nikon/nikon (16).jpg', 2, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(65, 'Sony A550 + Tamron 17-50 F2.8', 'Tình trạng: 99%. Tương thích ống kính Minolta A-type bayonet mount.', 3900000, 3900000, 4, 'images/products/sony/sony (1).jpg', 3, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(66, 'Sony A6000 + Kit 16-50 OSS', 'Tình trạng: 98%. Lấy nét nhanh nhất thế giới 0.06 giây.', 9500000, 9500000, 7, 'images/products/sony/sony (2).jpg', 3, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(67, 'Sony A6300', 'Tình trạng: 99%. Cảm biến CMOS APS-C 24.2MP.', 11500000, 11500000, 5, 'images/products/sony/sony (3).jpg', 3, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(68, 'Sony A7 mark III kèm ống 28-70mm', 'Tình trạng: 99%. Cảm biến BSI-CMOS Exmor R 24.2MP, bộ xử lý BIONZ X.', 30000000, 30000000, 2, 'images/products/sony/sony (4).jpg', 3, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(69, 'SONY ALPHA A6100 + KIT 16-50 F3.5-5.6 OSS', 'Tình trạng: 99%. Cảm biến APS-C CMOS 24.2MP.', 14500000, 14500000, 4, 'images/products/sony/sony (5).jpg', 3, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(70, 'Sony Alpha A6500 (body)', 'Tình trạng: 98%. Cảm biến 24.2MP APS-C Exmor CMOS.', 13000000, 13000000, 3, 'images/products/sony/sony (6).jpg', 3, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(71, 'Sony Alpha A7 Mark IV (Body)', 'Tình trạng: 98%. Bộ xử lý hình ảnh BIONZ XR mới nhất.', 41500000, 41500000, 1, 'images/products/sony/sony (7).jpg', 3, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(72, 'Sony alpha Nex 6 kèm ống 16-50mm Đẹp', 'Tình trạng: 99%. Sức mạnh cảm biến Exmor APS HD CMOS 16.1MP.', 6800000, 6800000, 5, 'images/products/sony/sony (8).jpg', 3, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(73, 'Sony alpha NEX-5R Kèm ống 16-50mm E PZ', 'Tình trạng: 99%. Cảm biến Exmor 23.5 x 15.6mm APS HD.', 6500000, 6500000, 6, 'images/products/sony/sony (9).jpg', 3, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(74, 'SONY CYBERSHOT DSC-RX1RM2/ RX1R II, 98%', 'Tình trạng: 98%. Độ phân giải 42.4 Megapixel Full-frame.', 37000000, 37000000, 1, 'images/products/sony/sony (10).jpg', 3, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(75, 'Sony Cybershot DSC-ZV-1/ Đen', 'Tình trạng: 99%. Cảm biến CMOS BSI Exmor RS 1 inch 20.1MP.', 11500000, 11500000, 8, 'images/products/sony/sony (11).jpg', 3, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(76, 'Sony DSC H400', 'Tình trạng: 99%. Cảm biến 20.1MP, Zoom quang học 63x.', 3700000, 3700000, 5, 'images/products/sony/sony (12).jpg', 3, 0, 0, 1, '2026-04-19 06:31:05', NULL),
(77, 'Sony DSC-RX10 Mark III', 'Tình trạng: 98%. Ống kính ZEISS Vario-Sonnar T* 24-600mm F2.4-4.', 13500000, 13500000, 1, 'images/products/sony/sony (13).jpg', 3, 0, 1, 1, '2026-04-19 06:31:05', '2026-04-23 14:58:45'),
(78, 'Sony Nex 5T + Kit 16-50 OSS', '<p>Tình trạng: 99%. Tính năng nổi bật Sony NEX 5T &amp; Kit 16-50 OSS.</p>', 6500000, 6500000, 10, 'images/products/sony/sony (14).jpg', 3, 1, 7, 1, '2026-04-19 06:31:05', '2026-04-23 16:16:31'),
(79, 'Sony RX100 mark IV', '<p>Tình trạng: 99%. Cảm biến Exmor RS CMOS 20.1MP.</p>', 10000000, 10000000, 3, 'images/products/sony/sony (15).jpg', 3, 1, 8, 1, '2026-04-19 06:31:05', '2026-04-23 16:02:14'),
(80, 'SONY ZV-E10 KÈM 16-50', 'Tình trạng: 99%. Cảm biến CMOS APS-C Exmor 24.2MP.', 14800000, 14800000, 6, 'images/products/sony/sony (16).jpg', 3, 0, 0, 1, '2026-04-19 06:31:05', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `news`
--

CREATE TABLE `news` (
  `id` int UNSIGNED NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `views` int UNSIGNED NOT NULL DEFAULT '0',
  `status` tinyint UNSIGNED NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nhan_vien`
--

CREATE TABLE `nhan_vien` (
  `id` int UNSIGNED NOT NULL,
  `tendangnhap` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ten` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `chucvu_id` int UNSIGNED NOT NULL,
  `dien_thoai` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mat_khau` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `hinhanh` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangthai` tinyint UNSIGNED NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `nhan_vien`
--

INSERT INTO `nhan_vien` (`id`, `tendangnhap`, `ten`, `chucvu_id`, `dien_thoai`, `email`, `mat_khau`, `hinhanh`, `trangthai`, `created_at`) VALUES
(1, 'abc@abc.com', 'Long Xuyên', 1, '0988994683', 'abc@abc.com', '900150983cd24fb0d6963f7d28e17f72', 'signup.png', 1, '2026-04-19 06:31:05'),
(2, 'ghi@abc.com', 'Nhân viên GHI', 2, '0988994685', 'ghi@abc.com', '900150983cd24fb0d6963f7d28e17f72', NULL, 1, '2026-04-19 06:31:05'),
(3, 'def@abc.com', 'Mèo máy Doraemon', 2, '11111111', 'def@abc.com', '900150983cd24fb0d6963f7d28e17f72', 'avatar.jpg', 1, '2026-04-19 06:31:05');

-- --------------------------------------------------------

--
-- Table structure for table `tin_tuc`
--

CREATE TABLE `tin_tuc` (
  `id` int UNSIGNED NOT NULL,
  `tieude` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tomtat` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `noidung` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `hinhanh` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngaydang` datetime DEFAULT CURRENT_TIMESTAMP,
  `danhmuc` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Tin tức',
  `nhan_vien_id` int UNSIGNED DEFAULT NULL,
  `luotxem` int UNSIGNED NOT NULL DEFAULT '0',
  `trangthai` tinyint UNSIGNED NOT NULL DEFAULT '1',
  `ngay_dang` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tin_tuc`
--

INSERT INTO `tin_tuc` (`id`, `tieude`, `tomtat`, `noidung`, `hinhanh`, `ngaydang`, `danhmuc`, `nhan_vien_id`, `luotxem`, `trangthai`, `ngay_dang`, `updated_at`) VALUES
(1, 'Top 5 máy ảnh mirrorless tốt nhất 2025', 'Danh sách những chiếc máy ảnh mirrorless đáng mua nhất trong năm 2025, từ Sony, Fujifilm đến Nikon.', '<p>Năm 2025 đánh dấu sự bùng nổ của dòng máy ảnh mirrorless với nhiều mẫu mới ra đời. Dưới đây là top 5 đáng mua nhất...</p><h3>1. Sony A7 Mark IV</h3><p>Với cảm biến full-frame 33MP và bộ xử lý BIONZ XR, Sony A7 IV là lựa chọn hàng đầu cho nhiếp ảnh gia chuyên nghiệp...</p><h3>2. Fujifilm X-T5</h3><p>Cảm biến 40MP X-Trans V trong thân hình nhỏ gọn retro cổ điển...</p>', 'images/news/news1.jpg', '2026-04-23 17:21:27', 'Đánh giá', 1, 0, 1, '2026-04-22 01:35:40', NULL),
(2, 'Hướng dẫn chụp ảnh chân dung với ánh sáng tự nhiên', 'Bí quyết tận dụng ánh sáng tự nhiên để có những bức ảnh chân dung đẹp mà không cần đèn flash.', '<p>Ánh sáng tự nhiên là nguồn sáng tuyệt vời nhất cho ảnh chân dung. Trong bài viết này chúng ta sẽ tìm hiểu cách khai thác tối đa...</p>', 'images/news/news2.jpg', '2026-04-23 17:21:27', 'Hướng dẫn', 1, 2, 1, '2026-04-22 01:35:40', '2026-04-23 16:38:39'),
(3, 'So sánh Canon 5D Mark III vs Sony A7 III', 'Hai chiếc máy ảnh full-frame phổ biến nhất được so sánh chi tiết về chất lượng ảnh, tốc độ và tính năng.', '<p>Canon 5D Mark III và Sony A7 III đều là những chiếc máy ảnh xuất sắc nhưng phục vụ những nhu cầu khác nhau...</p>', 'images/news/news3.jpg', '2026-04-23 17:21:27', 'So sánh', 1, 0, 1, '2026-04-22 01:35:40', NULL),
(4, 'Bộ sưu tập ảnh phong cảnh Việt Nam tuyệt đẹp', 'Những bức ảnh phong cảnh Việt Nam được chụp bởi các nhiếp ảnh gia tài năng với các loại máy ảnh khác nhau.', '<p>Việt Nam với vẻ đẹp đa dạng từ núi rừng Tây Bắc đến đồng bằng sông Cửu Long luôn là nguồn cảm hứng bất tận...</p>', 'images/news/news4.jpg', '2026-04-23 17:21:27', 'Cộng đồng', 1, 0, 1, '2026-04-22 01:35:40', NULL),
(5, 'Fujifilm X100VI - Chiếc máy ảnh compact hoàn hảo', 'Đánh giá chi tiết Fujifilm X100VI - sự kết hợp hoàn hảo giữa thiết kế retro và công nghệ hiện đại.', '<p>Fujifilm X100VI tiếp nối di sản của dòng X100 với nhiều cải tiến đáng kể về cảm biến và khả năng lấy nét...</p>', 'images/news/news5.jpg', '2026-04-23 17:21:27', 'Đánh giá', 1, 0, 1, '2026-04-22 01:35:40', NULL),
(6, 'Tips chụp ảnh sản phẩm cho người mới bắt đầu', 'Hướng dẫn cơ bản về cách chụp ảnh sản phẩm đẹp ngay tại nhà với thiết bị đơn giản.', '<p>Chụp ảnh sản phẩm không cần studio đắt tiền. Chỉ với một chiếc máy ảnh, tờ giấy trắng và ánh sáng tự nhiên...</p>', 'images/news/news6.jpg', '2026-04-23 17:21:27', 'Hướng dẫn', 1, 0, 1, '2026-04-22 01:35:40', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `chuc_vu`
--
ALTER TABLE `chuc_vu`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `danhmuc`
--
ALTER TABLE `danhmuc`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_tendanhmuc` (`tendanhmuc`);

--
-- Indexes for table `diachi`
--
ALTER TABLE `diachi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_khachhang` (`khach_hang_id`);

--
-- Indexes for table `donhang`
--
ALTER TABLE `donhang`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_khachhang` (`khach_hang_id`),
  ADD KEY `idx_ngay` (`ngay`),
  ADD KEY `fk_donhang_diachi` (`diachi_id`);

--
-- Indexes for table `donhangct`
--
ALTER TABLE `donhangct`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_donhang` (`donhang_id`),
  ADD KEY `idx_mathang` (`mathang_id`);

--
-- Indexes for table `khach_hang`
--
ALTER TABLE `khach_hang`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_kh_dienthoai` (`dien_thoai`),
  ADD UNIQUE KEY `uk_kh_email` (`email`),
  ADD UNIQUE KEY `uk_kh_tendangnhap` (`tendangnhap`);

--
-- Indexes for table `mathang`
--
ALTER TABLE `mathang`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_danhmuc` (`danhmuc_id`),
  ADD KEY `idx_giaban` (`giaban`),
  ADD KEY `idx_luotmua` (`luotmua`),
  ADD KEY `idx_trangthai` (`trangthai`),
  ADD KEY `idx_danhmuc_giaban` (`danhmuc_id`,`giaban`,`luotmua`);
ALTER TABLE `mathang` ADD FULLTEXT KEY `ft_search` (`tenmathang`,`mota`);

--
-- Indexes for table `news`
--
ALTER TABLE `news`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nhan_vien`
--
ALTER TABLE `nhan_vien`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_nv_tendangnhap` (`tendangnhap`),
  ADD UNIQUE KEY `uk_nv_dienthoai` (`dien_thoai`),
  ADD UNIQUE KEY `uk_nv_email` (`email`),
  ADD KEY `idx_chucvu` (`chucvu_id`);

--
-- Indexes for table `tin_tuc`
--
ALTER TABLE `tin_tuc`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_trangthai` (`trangthai`),
  ADD KEY `idx_ngaydang` (`ngay_dang`),
  ADD KEY `fk_tintuc_nhanvien` (`nhan_vien_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `chuc_vu`
--
ALTER TABLE `chuc_vu`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `danhmuc`
--
ALTER TABLE `danhmuc`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `diachi`
--
ALTER TABLE `diachi`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `donhang`
--
ALTER TABLE `donhang`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `donhangct`
--
ALTER TABLE `donhangct`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `khach_hang`
--
ALTER TABLE `khach_hang`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `mathang`
--
ALTER TABLE `mathang`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT for table `news`
--
ALTER TABLE `news`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nhan_vien`
--
ALTER TABLE `nhan_vien`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tin_tuc`
--
ALTER TABLE `tin_tuc`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `diachi`
--
ALTER TABLE `diachi`
  ADD CONSTRAINT `fk_diachi_khachhang` FOREIGN KEY (`khach_hang_id`) REFERENCES `khach_hang` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `donhang`
--
ALTER TABLE `donhang`
  ADD CONSTRAINT `fk_donhang_diachi` FOREIGN KEY (`diachi_id`) REFERENCES `diachi` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_donhang_khachhang` FOREIGN KEY (`khach_hang_id`) REFERENCES `khach_hang` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `donhangct`
--
ALTER TABLE `donhangct`
  ADD CONSTRAINT `fk_donhangct_donhang` FOREIGN KEY (`donhang_id`) REFERENCES `donhang` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_donhangct_mathang` FOREIGN KEY (`mathang_id`) REFERENCES `mathang` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `mathang`
--
ALTER TABLE `mathang`
  ADD CONSTRAINT `fk_mathang_danhmuc` FOREIGN KEY (`danhmuc_id`) REFERENCES `danhmuc` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `nhan_vien`
--
ALTER TABLE `nhan_vien`
  ADD CONSTRAINT `fk_nhanvien_chucvu` FOREIGN KEY (`chucvu_id`) REFERENCES `chuc_vu` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `tin_tuc`
--
ALTER TABLE `tin_tuc`
  ADD CONSTRAINT `fk_tintuc_nhanvien` FOREIGN KEY (`nhan_vien_id`) REFERENCES `nhan_vien` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
