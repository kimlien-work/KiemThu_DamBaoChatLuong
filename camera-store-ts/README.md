# Camera Store – Next.js + TypeScript

Chuyển đổi từ đồ án PHP thuần (MVC) sang **Next.js 16 + TypeScript + Tailwind CSS**.

Folder gốc PHP: `DOAN_WPHP` (không bị sửa).

## Tính năng đã chuyển

| PHP (cũ)              | Next.js (mới)                          |
|-----------------------|----------------------------------------|
| Session giỏ hàng      | localStorage + CartContext             |
| Session đăng nhập     | localStorage + AuthContext             |
| MySQL Model           | Mock data TypeScript (`src/data/mock.ts`) |
| index.php?action=...  | App Router (`/product/[id]`, ...)      |
| Bootstrap 5           | Tailwind CSS                           |

## Chạy local

```bash
cd camera-store-ts
npm install
npm run dev
```

Mở http://localhost:3000

**Tài khoản demo:** `user1` / `123456`

## Deploy lên Vercel

### Cách 1: Qua GitHub (khuyên dùng)

1. Tạo repo GitHub mới (ví dụ `camera-store-ts`).
2. Đẩy code lên:

```bash
cd camera-store-ts
git init
git add .
git commit -m "Initial: Camera Store Next.js TypeScript"
git branch -M main
git remote add origin https://github.com/<username>/camera-store-ts.git
git push -u origin main
```

3. Vào [vercel.com](https://vercel.com) → **Add New Project** → Import repo vừa tạo.
4. Framework Preset: **Next.js** (tự nhận).
5. Click **Deploy**. Xong trong khoảng 1 phút.

### Cách 2: Vercel CLI

```bash
npm i -g vercel
cd camera-store-ts
vercel
```

Làm theo hướng dẫn đăng nhập và deploy.

### Lưu ý

- Hiện tại dùng **mock data + localStorage** (không cần database).
- Muốn dùng database thật (MySQL/Postgres): thêm Prisma + Neon/PlanetScale và sửa `src/data`.
- Ảnh đang lấy từ Unsplash. Có thể thay bằng ảnh local trong `public/`.

## Cấu trúc thư mục chính

```
src/
├── app/                 # App Router pages
│   ├── page.tsx         # Trang chủ
│   ├── product/[id]/   # Chi tiết SP
│   ├── category/[id]/  # Danh mục + sort
│   ├── cart/            # Giỏ hàng
│   ├── checkout/        # Thanh toán COD
│   ├── login/ register/
│   ├── profile/ orders/
│   └── news/
├── components/          # Header, Footer, ProductCard
├── context/             # CartContext, AuthContext
├── data/mock.ts         # Dữ liệu mẫu
└── types/               # TypeScript interfaces
```
