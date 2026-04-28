# Hướng dẫn Deploy lên Render.com

Tài liệu này hướng dẫn cách triển khai Ecommerce BookStore lên **Render.com** bằng Blueprint `render.yaml` và pipeline GitHub Actions hiện tại.

## Điều kiện cần

1. Một repository GitHub chứa mã nguồn này.
2. Một tài khoản [Render](https://render.com/).
3. Quyền cấu hình secrets trong GitHub Actions nếu bạn muốn dùng deploy hooks.

## Kiến trúc triển khai trên Render

Blueprint hiện tại tạo 3 resource:

1. **PostgreSQL database**: `bookstore-db`
2. **Backend API**: `bookstore-api`
3. **Frontend Web**: `bookstore-web`

Backend production trên Render chạy với profile `render` và hỗ trợ hai cách cấu hình database (theo thứ tự ưu tiên):

1. **`DATABASE_URL`** (chính) — `RenderDataSourceConfig.java` tự động phân tích connection string từ Render (`postgresql://user:pass@host:port/db`) thành JDBC URL hợp lệ với username/password tách riêng. Đây là cách khuyên dùng.
2. **Các biến `DB_*` riêng lẻ** (dự phòng) — `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD` được dùng nếu `DATABASE_URL` không tồn tại.

> Lưu ý: PostgreSQL JDBC driver không chấp nhận credentials nhúng trực tiếp trong URL. `RenderDataSourceConfig` xử lý chuyển đổi này tự động.

## Bước 1: Khởi tạo hạ tầng bằng Blueprint

1. Đăng nhập [Render Dashboard](https://dashboard.render.com/).
2. Chọn **New +** -> **Blueprint**.
3. Kết nối repository `Ecommerce_BookStore`.
4. Xác nhận Render nhận diện file `render.yaml`.
5. Bấm **Apply Blueprint**.

Sau bước này, Render sẽ tự tạo database, backend và frontend theo đúng file hạ tầng trong repo.

## Bước 2: Thiết lập deploy hooks cho GitHub Actions

Nếu muốn GitHub Actions tự kích hoạt redeploy sau khi push lên `master`, cấu hình như sau:

1. Mở service `bookstore-api` trên Render.
2. Copy URL trong phần **Deploy Hook**.
3. Vào GitHub repository -> **Settings** -> **Secrets and variables** -> **Actions**.
4. Tạo secret:
   - `RENDER_DEPLOY_HOOK_BACKEND`
5. Lặp lại với service `bookstore-web`:
   - `RENDER_DEPLOY_HOOK_FRONTEND`

Nếu có môi trường staging theo nhánh `develop`, có thể cấu hình thêm:

- `RENDER_DEPLOY_HOOK_BACKEND_STAGING`
- `RENDER_DEPLOY_HOOK_FRONTEND_STAGING`

> Nếu deploy hook từng bị lộ, hãy **rotate hook** trên Render và cập nhật lại GitHub secrets.

## Bước 3: Kiểm tra cấu hình backend Render

Trên service `bookstore-api`, hãy xác nhận:

- `SPRING_PROFILES_ACTIVE=render`
- Health check path là `/api/actuator/health/liveness`
- Service đang build từ `Dockerfile.backend`
- Database binding cung cấp `DATABASE_URL` (chính) và các biến `DB_*` (dự phòng) từ `bookstore-db`

## Publish registry chuyên nghiệp

GitHub Actions hiện publish image lên **GHCR** và **Docker Hub** bằng semver tags:

- `latest`
- `v1.1.2`
- `v1`

Docker Hub publish cần repository secrets:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

Nếu không đặt repository variable `DOCKERHUB_NAMESPACE`, workflow sẽ dùng chính `DOCKERHUB_USERNAME` làm namespace.

Những tag này dành cho artifact registry. Riêng lịch sử deploy trong Render Blueprint/source deploy vẫn sẽ hiển thị theo **commit hash**, đây là hành vi bình thường của Render khi deploy từ source.

## Xác minh sau deploy

Sau khi deploy xong, kiểm tra:

1. **Backend health**
   - `https://bookstore-api.onrender.com/api/actuator/health/liveness`
   - Kỳ vọng: `{"status":"UP"}`
2. **Frontend**
   - `https://bookstore-web.onrender.com`
   - Kỳ vọng: giao diện Next.js BookStore hiện tại tải lên đúng
3. **Proxy API**
   - Frontend phải gọi backend qua `/api` ổn định
4. **Smoke các route chính**
   - `/products`
   - `/products/[id]`
   - `/flash-sale`
   - `/checkout`

## Ghi chú về free tier của Render

- Service có thể sleep khi không có truy cập trong một thời gian, nên request đầu tiên có thể chậm.
- Sau khi backend vừa boot lại, dữ liệu demo có thể được top-up nền trong vài giây tiếp theo.
- Nếu cần trải nghiệm luôn sẵn sàng cho demo, nên cân nhắc nâng gói hoặc giữ traffic warm-up định kỳ.
