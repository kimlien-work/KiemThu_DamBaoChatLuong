START TRANSACTION;

ALTER TABLE `mathang`
  ADD COLUMN `ma_mat_hang` varchar(30) NULL AFTER `id`;

UPDATE `mathang`
SET `ma_mat_hang` = CONCAT('MH', LPAD(`id`, 6, '0'))
WHERE `ma_mat_hang` IS NULL OR `ma_mat_hang` = '';

ALTER TABLE `mathang`
  MODIFY `ma_mat_hang` varchar(30) NOT NULL,
  ADD UNIQUE KEY `uk_ma_mat_hang` (`ma_mat_hang`);

COMMIT;
