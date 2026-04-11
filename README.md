# BookStore — Nền tảng thương mại điện tử sách (E-Commerce Bookstore)

[![Java](https://img.shields.io/badge/Java-17+-ED8B00?style=flat-square&logo=java&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docs.docker.com/compose/)

Ứng dụng web bán sách full-stack: **Spring Boot (REST API)** + **Next.js (App Router)** + **MySQL**, có Docker Compose, test (JUnit, Vitest, Playwright) và CI trên GitHub Actions.

> **Mục đích:** Dự án phục vụ **học tập** và **portfolio** — không dùng cho môi trường production thật nếu chưa được rà soát bảo mật và cấu hình đầy đủ.

---

## Tác giả

| | |
|---|---|
| **Họ tên** | Nguyễn Sơn |
| **Email** | [jasonbmt06@gmail.com](mailto:jasonbmt06@gmail.com) |
| **Repository** | Dự án portfolio cá nhân |

---

## Tính năng chính (tóm tắt)

- Đăng ký / đăng nhập JWT + refresh token, phân quyền Admin / Customer  
- Danh mục, sản phẩm, giỏ hàng, đơn hàng, thanh toán (VNPay sandbox)  
- Flash sale, mã giảm giá, wishlist, chatbot (tích hợp API), theo dõi đọc sách (reading tracker)  
- Giao diện Next.js + Tailwind, SEO cơ bản, PWA/manifest, health check API  

Chi tiết lộ trình và checklist: [docs/MASTER_PLAN.md](docs/MASTER_PLAN.md).

---

## Kiến trúc

```text
[Browser] → Next.js (Frontend_NextJS) → REST API Spring Boot (Backend_Java) → MySQL
                                              ↘ Email (SMTP, tùy cấu hình)
```

---

## Yêu cầu môi trường

- **Docker Desktop** (khuyến nghị cho chạy nhanh toàn stack)  
- Hoặc: **Java 17+**, **Node.js 18+**, **MySQL 8** nếu chạy từng service tay  

---

## Chạy nhanh với Docker

1. Sao chép biến môi trường:

   ```bash
   copy .env.example .env
   ```

2. Chỉnh `.env` (database, JWT, mail nếu cần).

3. Khởi động:

   ```bash
   docker compose up -d --build
   ```

4. Truy cập:

   | Dịch vụ | URL |
   |---------|-----|
   | Frontend | http://localhost:3000 |
   | API (context `/api`) | http://localhost:8080/api |
   | Swagger UI | http://localhost:8080/api/swagger-ui.html |
   | Health (tùy cấu hình) | http://localhost:8080/api/health |

---

## Tài khoản demo (ví dụ)

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| Admin | `admin@bookstore.com` | `Admin123!` |

*(Có thể thay đổi theo dữ liệu seed trong backend — xem tài liệu backend / migration.)*

---

## Chạy dev không Docker

**Backend**

```bash
cd Backend_Java
mvn spring-boot:run
```

**Frontend**

```bash
cd Frontend_NextJS
npm install
npm run dev
```

Đảm bảo MySQL và biến môi trường trùng với `application.properties` / `.env`.

---

## Kiểm thử

```bash
# Backend
cd Backend_Java && mvn test

# Frontend unit
cd Frontend_NextJS && npm run test:run

# E2E (cần app đang chạy tại BASE_URL mặc định)
cd Frontend_NextJS && npx playwright install && npm run test:e2e
```

Pipeline CI: [.github/workflows/ci.yml](.github/workflows/ci.yml).

---

## Bảo mật (nhắc nhở cho portfolio)

- Không commit file `.env` hoặc secret thật.  
- Đổi `JWT_SECRET`, mật khẩu DB và tắt endpoint test email trước khi public repo nếu deploy thật.  
- Cấu hình CORS và HTTPS theo domain thực tế.

---

## Cấu trúc thư mục

```text
Ecommerce_BookStore/
├── Backend_Java/          # Spring Boot API
├── Frontend_NextJS/       # Next.js 14 (App Router)
├── Mobile/                 # Ứng dụng React Native (tham khảo)
├── docs/                   # MASTER_PLAN và tài liệu
├── docker-compose.yml
├── Dockerfile.backend
└── Dockerfile.frontend
```

---

## Giấy phép

Mã nguồn trong khuôn khổ dự án học tập/portfolio — xem [LICENSE](LICENSE) (MIT) nếu có trong repo.

---

<div align="center">

**Nguyễn Sơn** · [jasonbmt06@gmail.com](mailto:jasonbmt06@gmail.com)  
*Dự án học tập & portfolio — 2026*

</div>
