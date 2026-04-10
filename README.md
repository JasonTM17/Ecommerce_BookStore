# BookStore - Nền Tảng Thương Mại Điện Tử Sách

Dự án thương mại điện tử chuyên về sách, xây dựng với Spring Boot + Next.js + PostgreSQL.

![Java](https://img.shields.io/badge/Java-17+-ED8B00?style=for-the-badge&logo=java&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Clone project về, copy file `.env.example` thành `.env`, chỉnh sửa thông tin database và credentials, sau đó chạy:

```bash
docker compose up -d
```

Truy cập:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- Swagger Docs: http://localhost:8080/api/swagger-ui.html

## Tài khoản demo

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@bookstore.com | Admin123! |

## Yêu cầu

- Docker Desktop đang chạy
- Java 17+ (nếu chạy backend local)
- Node.js 18+ (nếu chạy frontend local)

## Cấu hình

Tạo file `.env` từ `.env.example`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bookstore
DB_USERNAME=postgres
DB_PASSWORD=your_password

JWT_SECRET=YourSuperSecretKeyAtLeast256BitsLong!
JWT_EXPIRATION=86400000

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

## Bảo mật

Dự án sử dụng các biện pháp bảo mật sau:

- JWT Authentication với refresh token
- BCrypt password hashing (strength 12)
- Rate limiting chống brute-force (5 request/phút cho auth endpoints)
- Input validation chống XSS, SQL Injection
- Security headers (CSP, HSTS, X-Frame-Options)
- CORS chỉ cho phép trusted origins

Trước khi deploy production, nhớ:
- Đổi JWT_SECRET
- Cập nhật DB password
- Cấu hình CORS origins chính xác
- Bật HTTPS
- Tắt test endpoints

## Cấu trúc

```
Ecommerce_BookStore/
├── Backend_Java/          # Spring Boot API
│   ├── src/main/java/com/bookstore/
│   │   ├── config/        # Security, Filters, Thymeleaf
│   │   ├── controller/    # REST APIs
│   │   ├── entity/       # JPA Entities
│   │   ├── repository/   # Data Access
│   │   ├── service/      # Business Logic
│   │   └── security/     # JWT, Filters
│   └── src/main/resources/
│       └── templates/email/  # Email templates
│
├── Frontend_NextJS/        # Next.js App
│   ├── src/app/           # App Router pages
│   │   ├── admin/         # Admin dashboard
│   │   ├── products/      # Product pages
│   │   └── (auth)/        # Auth pages
│   └── src/components/    # UI components
│
└── docker-compose.yml     # Orchestration
```

## Testing

Backend:
```bash
cd Backend_Java
mvn test
```

Frontend E2E:
```bash
cd Frontend_NextJS
npm install
npx playwright install
npm run test:e2e
```

## Cấu hình email

1. Bật 2-Factor Authentication trong Google Account
2. Tạo App Password tại https://myaccount.google.com/security → App Passwords
3. Copy App Password vào `MAIL_PASSWORD` trong .env
4. Bật test endpoint trong dev:
```env
APP_EMAIL_TEST_ENABLED=true
APP_EMAIL_ALLOWED_RECIPIENTS=your-email@gmail.com
```

Test:
```bash
# Health check
curl http://localhost:8080/api/email/health

# Gửi welcome email
curl -X POST http://localhost:8080/api/email/test/send \
  -H "Content-Type: application/json" \
  -d '{"to":"your-email@gmail.com","type":"welcome","firstName":"Test"}'
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Đăng ký |
| POST | `/auth/login` | Đăng nhập |
| POST | `/auth/refresh` | Refresh token |
| POST | `/auth/logout` | Đăng xuất |

### Products (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | Danh sách sản phẩm |
| GET | `/products/{id}` | Chi tiết sản phẩm |
| GET | `/products/search` | Tìm kiếm |

### Protected (Cần JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Tạo đơn hàng |
| GET | `/orders` | Danh sách đơn hàng |
| GET | `/cart` | Xem giỏ hàng |
| POST | `/cart/items` | Thêm vào giỏ |

### Admin Only
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/products` | Thêm sản phẩm |
| PUT | `/admin/products/{id}` | Sửa sản phẩm |
| DELETE | `/admin/products/{id}` | Xóa sản phẩm |
| PUT | `/admin/orders/{id}/status` | Cập nhật đơn hàng |

## Development

Chạy backend local:
```bash
cd Backend_Java
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Chạy frontend local:
```bash
cd Frontend_NextJS
npm install
npm run dev
```

Rebuild Docker:
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

## License

Dự án này được phân phối dưới giấy phép MIT. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

<div align="center">

**Made with ❤️ and ☕**

*© 2026 BookStore. All rights reserved.*

</div>
