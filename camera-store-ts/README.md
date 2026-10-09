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
```

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
