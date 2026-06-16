# MONETY - FRONTEND NEXT.JS APPLICATION

Đây là mã nguồn **Frontend** của dự án Monety, được xây dựng bằng **Next.js 16 (App Router)** và **Tailwind CSS**.

---

## Live Demo & Production

- **Ứng dụng Monety (Frontend)**: [https://monety-frontend.onrender.com](https://monety-frontend.onrender.com)

> [!NOTE]
> **Lưu ý**: Vì frontend được triển khai trên **Render bản miễn phí**, trang web sẽ tự động đi vào trạng thái ngủ khi không có hoạt động. Lần truy cập đầu tiên có thể mất **50 giây đến 2 phút** để trang tải đầy đủ.

---

## Hướng dẫn cài đặt và chạy local

### 1. Cài đặt các gói thư viện
Đảm bảo bạn đang ở thư mục `app-manager-spending/`:
```bash
cd app-manager-spending
npm install
```

### 2. Cấu hình biến môi trường (`.env`)
Tạo file `.env` ở thư mục gốc của frontend với nội dung sau:
```env
# URL trỏ tới máy chủ Backend API chạy cục bộ (mặc định là cổng 3001)
API_URL="http://localhost:3001/api"

# Khóa bảo mật Webhook của Sepay (cần trùng khớp với Backend)
# SEPAY_WEBHOOK_KEY="sepay_webhook_secure_key_2026"
```

### 3. Khởi chạy dự án ở môi trường phát triển
```bash
npm run dev
```
*Mở trình duyệt truy cập địa chỉ: `http://localhost:3000`*

### 4. Build sản phẩm hoàn chỉnh (Production)
```bash
npm run build
npm run start
```
