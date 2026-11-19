# Camera Store – Next.js + TypeScript + MySQL

Chuyển từ đồ án PHP sang Next.js, **dùng chung database MySQL** `camera_shop`.

## 1. Chuẩn bị Database (XAMPP / WAMP)

1. Bật **Apache + MySQL** trong XAMPP.
2. Mở phpMyAdmin → Import file:
   ```
   database/camera_shop.sql
   ```
3. Đảm bảo database tên `camera_shop` đã có dữ liệu.

## 2. Cấu hình kết nối

File `.env` (đã có sẵn, sửa nếu cần):

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=camera_shop
ADMIN_SESSION_SECRET=
```

`ADMIN_SESSION_SECRET` được dùng để ký phiên đăng nhập quản trị/nhân viên. Khi deploy production, bắt buộc đặt secret ngẫu nhiên dài ít nhất 32 ký tự trong environment variables; không chia sẻ hoặc đưa secret thật lên Git. Môi trường development tự tạo secret tạm thời nếu chưa cấu hình.

### Cập nhật database đang sử dụng

Database mới được import từ `database/camera_shop.sql` đã có chức vụ `Nhân viên` (mã chức vụ `2`) và mã NV duy nhất. Với database đã tồn tại, chạy một lần các câu lệnh sau trong phpMyAdmin:

```sql
INSERT INTO chuc_vu (id, ten, he_so)
VALUES (2, 'Nhân viên', 1.00)
ON DUPLICATE KEY UPDATE ten = VALUES(ten);

ALTER TABLE nhan_vien
  ADD COLUMN ma_nhan_vien VARCHAR(20) NULL AFTER id;
UPDATE nhan_vien
  SET ma_nhan_vien = CONCAT('NV', LPAD(id, 6, '0'))
  WHERE ma_nhan_vien IS NULL;
ALTER TABLE nhan_vien
  MODIFY ma_nhan_vien VARCHAR(20) NOT NULL,
  ADD UNIQUE KEY uk_nv_ma_nhan_vien (ma_nhan_vien);
```

Nhân viên có `chucvu_id = 2`; tài khoản phải có `trangthai = 1`. Có thể đăng nhập bằng tên đăng nhập hoặc mã NV. Tài khoản demo: quản trị `abc@abc.com`, nhân viên `ghi@abc.com` hoặc `def@abc.com`; mật khẩu đều là `abc`.

## 3. Chạy project

PowerShell (Windows):

```powershell
cd "đường-dẫn\camera-store-ts"
Remove-Item -Recurse -Force node_modules, .next -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm install
npm run dev
```

Mở http://localhost:3000

## 4. Ảnh sản phẩm

Copy thư mục ảnh từ đồ án PHP:

```
DOAN_WPHP/images/products  →  camera-store-ts/public/images/products
```

## Cấu trúc DB dùng chung với PHP

| Bảng PHP     | Dùng trong Next.js      |
|--------------|-------------------------|
| danhmuc      | Danh mục (Canon, Sony…) |
| mathang      | Sản phẩm                |
| khach_hang   | Khách hàng              |
| donhang      | Đơn hàng                |
| donhangct    | Chi tiết đơn            |
| tin_tuc      | Tin tức                 |

## Deploy Vercel

Vercel **không kết nối được localhost MySQL**. Cần:
- Đưa MySQL lên cloud (PlanetScale, Railway, Aiven…)
- Đổi `DB_HOST` trong Environment Variables trên Vercel
