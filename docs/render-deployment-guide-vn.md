# Hướng dẫn Deploy lên Render.com

Tài liệu này hướng dẫn cách triển khai hệ thống Ecommerce BookStore (từ Frontend đến Backend và Database) lên **Render.com** thông qua file Infrastructure as Code (IaC) Blueprint và GitHub Actions.

## Yêu cầu chuẩn bị

1. Một tài khoản [GitHub](https://github.com) chứa mã nguồn (repository) này.
2. Một tài khoản tại [Render.com](https://render.com).

## Kiến trúc trên Render

Vì Render hỗ trợ PostgreSQL bản địa (native), quá trình triển khai sẽ sử dụng profile Spring Boot chuyên biệt tên là `render` để tự động chuyển Backend từ MySQL sang PostgreSQL.

Hạ tầng bao gồm 3 dịch vụ:
1. **Cơ sở dữ liệu PostgreSQL** (Render native, Free Tier)
2. **Backend API** (Dockerized Spring Boot, Free Tier web service)
3. **Frontend Web** (Dockerized Next.js, Free Tier web service)

---

## Bước 1: Khởi tạo Hạ tầng bằng Blueprint

Bạn không cần phải tạo từng dịch vụ thủ công. Chúng ta sử dụng file Blueprint `render.yaml` ở thư mục gốc của repo để tự động khởi tạo mọi thứ.

1. Đăng nhập vào [Render Dashboard](https://dashboard.render.com/).
2. Bấm nút **New +** ở góc trên cùng bên phải và chọn **Blueprint**.
3. Kết nối với tài khoản GitHub của bạn và chọn repository `Ecommerce_BookStore`.
4. Render sẽ tự động nhận diện file `render.yaml`.
5. Bấm **Apply Blueprint**.

Lúc này, Render sẽ thiết lập database PostgreSQL, sau đó bắt đầu build và deploy cả hai container Docker cho backend và frontend.

---

## Bước 2: Thiết lập Deploy Tự động (Deploy Hooks)

Để GitHub Actions tự động kích hoạt tiến trình deploy trên Render mỗi khi có code mới được đẩy (push) lên nhánh `master`, chúng ta cần cấu hình Deploy Hooks của Render vào GitHub Secrets.

1. Trên **Render Dashboard**, mở cài đặt (settings) của dịch vụ **Backend** (`bookstore-api`).
2. Cuộn xuống phần **Deploy Hook** và sao chép (copy) đoạn URL này.
3. Chuyển sang **GitHub Repository** -> **Settings** -> **Secrets and variables** -> **Actions**.
4. Tạo một secret mới:
   - **Name:** `RENDER_DEPLOY_HOOK_BACKEND`
   - **Secret:** *(Dán đoạn URL Deploy Hook của Backend vào đây)*
5. Lặp lại bước 1-4 cho dịch vụ **Frontend** (`bookstore-web`):
   - **Name:** `RENDER_DEPLOY_HOOK_FRONTEND`
   - **Secret:** *(Dán đoạn URL Deploy Hook của Frontend vào đây)*

*(Tùy chọn)* Nếu bạn có môi trường staging trên nhánh `develop`, bạn cũng có thể cấu hình `RENDER_DEPLOY_HOOK_BACKEND_STAGING` và `RENDER_DEPLOY_HOOK_FRONTEND_STAGING`.

---

## Kiểm tra (Verification)

Sau khi Blueprint hoàn tất việc deploy lần đầu và pipeline CI/CD chạy thành công trên nhánh `master`, bạn có thể xác nhận hệ thống đã hoạt động:

1. **Frontend:** Truy cập `https://bookstore-web.onrender.com`. Giao diện website sẽ xuất hiện.
2. **Backend Health Check:** Truy cập `https://bookstore-api.onrender.com/api/actuator/health/liveness`. Hệ thống cần trả về chuỗi `{"status":"UP"}`.

> **Lưu ý về gói Free (Miễn phí) của Render:**
> - Các web service sẽ tự động "ngủ" (spin down) sau 15 phút không có tương tác. Khi bạn vào lại trang web sau thời gian này, có thể gặp tình trạng "cold start" (mất khoảng 50 giây để hệ thống thức dậy).
> - Tính năng lưu trữ dữ liệu cho PostgreSQL bản miễn phí chỉ được 90 ngày.
> - Nếu bạn muốn ứng dụng hoạt động 24/7 không độ trễ, hãy cân nhắc nâng cấp lên gói **Starter** ($7/tháng/dịch vụ).
