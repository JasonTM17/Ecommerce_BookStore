# Hướng dẫn Deploy Render

Tài liệu này hướng dẫn deploy BookStore lên Render bằng Blueprint (`render.yaml`) và cách verify an toàn sau deploy.

## Điều kiện cần

1. GitHub repository chứa project này.
2. Tài khoản Render có quyền tạo Blueprint resources.
3. Quyền quản lý GitHub Actions secrets nếu cần deploy hooks hoặc Docker Hub publish.

## Resources trong Blueprint

`render.yaml` tạo 3 resource:

| Resource | Tên trên Render | Runtime | Mục đích |
| --- | --- | --- | --- |
| Database | `bookstore-db` | PostgreSQL | Production data store |
| Backend | `bookstore-api` | Docker | Spring Boot REST API |
| Frontend | `bookstore-web` | Docker | Next.js storefront/admin |

Hai web service hiện dùng `autoDeployTrigger: off`. Cách này tránh rebuild ngoài ý muốn và giúp kiểm soát pipeline minutes trên free tier. Chỉ deploy thủ công trên Render hoặc trigger deploy hook khi đã sẵn sàng.

## Bước 1: Apply Blueprint

1. Mở [Render Dashboard](https://dashboard.render.com/).
2. Chọn **New +** -> **Blueprint**.
3. Kết nối repository `Ecommerce_BookStore`.
4. Xác nhận Render nhận diện `render.yaml`.
5. Chọn region Singapore nếu Render yêu cầu.
6. Apply Blueprint.

Render sẽ tạo PostgreSQL database và hai Docker web service.

## Bước 2: Kiểm tra backend environment

Với `bookstore-api`, xác nhận:

- `SPRING_PROFILES_ACTIVE=render`
- `DATABASE_URL` được bind từ `bookstore-db`
- Fallback `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD` được bind từ `bookstore-db`
- `JWT_SECRET` được Render generate
- `APP_BASE_URL` trỏ về frontend URL
- `BACKEND_PUBLIC_URL` trỏ về backend URL
- `APP_DEMO_SEED_ENABLED=true` chỉ dùng cho portfolio/demo deployment
- `GROK_ENABLED=false` trừ khi đã cấu hình private `GROK_API_KEY`

Backend health check path trong `render.yaml` là:

```text
/api/health/live
```

Endpoint readiness để monitor sau khi boot:

```text
/api/health/ready
```

## Bước 3: Kiểm tra frontend environment

Với `bookstore-web`, xác nhận:

- `API_PROXY_TARGET` trỏ tới backend `/api` URL
- `NEXT_PUBLIC_API_URL=/api`
- `NEXT_PUBLIC_BASE_URL` trỏ tới frontend URL
- `NODE_ENV=production`
- `NEXT_TELEMETRY_DISABLED=1`

Frontend health check path trong `render.yaml` là:

```text
/
```

Aggregate health endpoint của frontend:

```text
/api/health
```

Endpoint này kiểm tra frontend availability và backend reachability.

## Bước 4: Deploy hooks tùy chọn

Nếu muốn GitHub Actions trigger Render deploy:

1. Mở service `bookstore-api` trên Render.
2. Copy backend deploy hook URL.
3. Trong GitHub, mở **Settings** -> **Secrets and variables** -> **Actions**.
4. Thêm `RENDER_DEPLOY_HOOK_BACKEND`.
5. Lặp lại với `bookstore-web` và thêm `RENDER_DEPLOY_HOOK_FRONTEND`.

Staging hooks tùy chọn cho nhánh `develop`:

- `RENDER_DEPLOY_HOOK_BACKEND_STAGING`
- `RENDER_DEPLOY_HOOK_FRONTEND_STAGING`

Lưu ý:

- Copy frontend hook từ đúng service `bookstore-web`, không copy từ backend, preview service hoặc frontend service cũ.
- Nếu deploy hook từng bị lộ, rotate hook trên Render và cập nhật lại GitHub secret.
- Không trigger hook lặp lại khi Render báo workspace hết pipeline minutes. Hãy chờ kỳ reset tiếp theo hoặc dùng paid workspace.

## Registry publishing

GitHub Actions publish public image chính thức lên Docker Hub khi có secrets:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

Nếu repository variable `DOCKERHUB_NAMESPACE` không tồn tại, workflow dùng `nguyenson1710` làm namespace.

Canonical image packages:

- `nguyenson1710/ecommerce-bookstore-backend`
- `nguyenson1710/ecommerce-bookstore-frontend`

Legacy GHCR publishing đã tắt để public install command luôn khớp Docker Hub namespace.

Tag registry theo semver-style:

- `latest`
- `v1.1.2`
- `v1`

Render Blueprint/source deployment vẫn hiển thị commit hash trong deploy history. Đây là hành vi bình thường.

## Verify sau deploy

Sau khi cả hai service deploy xong:

1. Backend live health
   - `https://bookstore-api-a1xl.onrender.com/api/health/live`
   - Kỳ vọng: status `UP` hoặc `ok`, tùy response shape của endpoint.
2. Backend readiness
   - `https://bookstore-api-a1xl.onrender.com/api/health/ready`
   - Kỳ vọng: service `UP`, database `UP`.
3. Frontend root
   - `https://bookstore-web-dr1k.onrender.com`
   - Kỳ vọng: storefront BookStore hiện tại tải đúng.
4. Frontend aggregate health
   - `https://bookstore-web-dr1k.onrender.com/api/health`
   - Kỳ vọng: frontend `UP`, backend checks pass.
5. Smoke routes
   - `/products`
   - `/products/[id]`
   - `/flash-sale`
   - `/cart`
   - `/checkout`
   - `/login`

## Lưu ý free tier

- Free service có thể sleep sau một thời gian không có traffic; request đầu tiên sau khi sleep có thể chậm.
- Demo data có thể top up nền trong vài giây sau khi backend boot.
- Giữ auto deploy tắt nếu pipeline minutes có giới hạn.
- Nếu portfolio cần luôn warm, cân nhắc paid Render plan hoặc warm-up monitor có kiểm soát.

## Troubleshooting

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
| --- | --- | --- |
| Deploy bị block trước build | Render hết pipeline minutes | Dừng retry và chờ minutes reset |
| Backend health fail | Sai profile hoặc env database | Kiểm tra `SPRING_PROFILES_ACTIVE`, `DATABASE_URL`, `DB_*` |
| Frontend tải được nhưng API fail | Sai `API_PROXY_TARGET` | Đảm bảo trỏ tới backend `/api` |
| Frontend health không khớp commit | Sai deploy hook hoặc service cũ | Copy lại hook từ `bookstore-web` |
| Request đầu tiên chậm | Free service cold start | Chờ backend ready rồi retry |
