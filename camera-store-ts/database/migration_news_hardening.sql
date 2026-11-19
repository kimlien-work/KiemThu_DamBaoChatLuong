START TRANSACTION;

ALTER TABLE `tin_tuc`
  ADD COLUMN `version` int UNSIGNED NOT NULL DEFAULT 1 AFTER `trangthai`,
  ADD COLUMN `tieude_key` varchar(255)
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    GENERATED ALWAYS AS (LOWER(TRIM(`tieude`))) STORED;

ALTER TABLE `tin_tuc`
  ADD UNIQUE KEY `uk_tintuc_tieude_key` (`tieude_key`);

COMMIT;
