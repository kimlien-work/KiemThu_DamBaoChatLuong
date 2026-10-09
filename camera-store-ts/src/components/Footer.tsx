export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-3">📷 Camera Store</h3>
          <p className="text-sm">
            Chuyên cung cấp máy ảnh chính hãng, ống kính và phụ kiện nhiếp ảnh với giá tốt nhất.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Liên hệ</h4>
          <p className="text-sm">📍 123 Nguyễn Huệ, Q.1, TP.HCM</p>
          <p className="text-sm">📞 1900 1234</p>
          <p className="text-sm">✉️ support@camerastore.vn</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Giờ làm việc</h4>
          <p className="text-sm">Thứ 2 - Thứ 7: 8:00 - 21:00</p>
          <p className="text-sm">Chủ nhật: 9:00 - 18:00</p>
        </div>
      </div>
      <div className="border-t border-gray-700 text-center py-4 text-sm">
        © 2025 Camera Store. Đồ án chuyển đổi từ PHP sang Next.js + TypeScript.
      </div>
    </footer>
  );
}
