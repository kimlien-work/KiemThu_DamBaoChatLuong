START TRANSACTION;

DROP TRIGGER IF EXISTS `trg_tang_diem_tich_luy`;

CREATE TABLE IF NOT EXISTS `lichsu_diem_tich_luy` (
  `id` bigint UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `khach_hang_id` int UNSIGNED NOT NULL,
  `donhang_id` int UNSIGNED NOT NULL,
  `loai` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `diem` int UNSIGNED NOT NULL,
  `lydo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_diem_donhang_loai` (`donhang_id`, `loai`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `lichsu_diem_tich_luy`
  ADD CONSTRAINT `fk_lichsu_diem_khachhang` FOREIGN KEY (`khach_hang_id`) REFERENCES `khach_hang` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_lichsu_diem_donhang` FOREIGN KEY (`donhang_id`) REFERENCES `donhang` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
