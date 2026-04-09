# BookStore - Nền Tảng Thương Mại Điện Tử Chuyên Nghiệp

<div align="center">

![Java](https://img.shields.io/badge/Java-17+-ED8B00?style=for-the-badge&logo=java&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>

## Mục Lục

- [Giới Thiệu](#giới-thiệu)
- [Tính Năng](#tính-năng)
- [Kiến Trúc Hệ Thống](#kiến-trúc-hệ-thống)
- [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
- [Hướng Dẫn Cài Đặt](#hướng-dẫn-cài-đặt)
- [Hướng Dẫn Sử Dụng](#hướng-dẫn-sử-dụng)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## Giới Thiệu

**BookStore** là một nền tảng thương mại điện tử chuyên về sách, được xây dựng với kiến trúc microservices hiện đại. Dự án này được phát triển với mục đích học tập và thể hiện kỹ năng lập trình Full-stack trong quá trình xây dựng portfolio chuyên nghiệp.

### Mục Tiêu Dự Án

- Xây dựng một ứng dụng thương mại điện tử hoàn chỉnh từ Backend đến Frontend
- Áp dụng các best practices trong thiết kế và phát triển phần mềm
- Thể hiện khả năng làm việc với nhiều công nghệ và framework khác nhau
- Tạo một sản phẩm có thể triển khai thực tế

---

## Tính Năng

### Người Dùng (Customer)

- **Đăng ký & Đăng nhập**: Xác thực người dùng với JWT Token
- **Quản lý tài khoản**: Cập nhật thông tin cá nhân, đổi mật khẩu
- **Quản lý giỏ hàng**: Thêm, sửa, xóa sản phẩm trong giỏ hàng
- **Đặt hàng**: Thanh toán với nhiều phương thức (COD, Banking)
- **Theo dõi đơn hàng**: Xem lịch sử và trạng thái đơn hàng
- **Đánh giá sản phẩm**: Viết review và xem đánh giá từ người dùng khác
- **Tìm kiếm & Lọc**: Tìm kiếm sản phẩm theo nhiều tiêu chí
- **Quên mật khẩu**: Khôi phục mật khẩu qua email

### Quản Trị (Admin)

- **Dashboard**: Thống kê tổng quan doanh thu, đơn hàng, người dùng
- **Quản lý sản phẩm**: CRUD sản phẩm, quản lý tồn kho
- **Quản lý danh mục**: Tạo và quản lý danh mục sản phẩm
- **Quản lý đơn hàng**: Xem, cập nhật trạng thái đơn hàng
- **Quản lý người dùng**: Xem và quản lý tài khoản người dùng
- **Quản lý đánh giá**: Duyệt và quản lý review sản phẩm

---

## Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Next.js 14 (React 18)                    │  │
│  │   • App Router          • Tailwind CSS                │  │
│  │   • TanStack Query      • Zustand State              │  │
│  │   • Sonner Toasts       • Radix UI                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       API GATEWAY LAYER                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Spring Boot Security                      │  │
│  │   • JWT Authentication  • Role-based Access         │  │
│  │   • Rate Limiting        • CORS Configuration        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   AUTH SERVICE   │ │  PRODUCT SERVICE │ │  ORDER SERVICE  │
│  (Spring Boot)   │ │  (Spring Boot)   │ │  (Spring Boot)  │
│  • JWT Token     │ │  • CRUD Products │ │  • Order Flow   │
│  • Refresh Token │ │  • Categories    │ │  • Cart Logic   │
│  • Password Hash │ │  • Search/Filter│ │  • Payment      │
└─────────────────┘ └─────────────────┘ └─────────────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│  ┌────────────────────┐  ┌──────────────────────────────┐   │
│  │   PostgreSQL 16     │  │        Redis (Optional)      │   │
│  │   • Products       │  │   • Session Cache            │   │
│  │   • Users/Orders   │  │   • Rate Limiting           │   │
│  │   • Categories     │  │   • Product Cache            │   │
│  └────────────────────┘  └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Công Nghệ Sử Dụng

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 17+ | Programming Language |
| Spring Boot | 3.2 | Framework |
| Spring Security | 6.x | Authentication & Authorization |
| Spring Data JPA | 3.x | ORM & Database Access |
| PostgreSQL | 16 | Primary Database |
| JWT (jjwt) | 0.12.x | Token-based Authentication |
| SpringDoc OpenAPI | 2.5 | API Documentation |
| Lombok | 1.18.x | Boilerplate Reduction |
| MapStruct | 1.5.x | DTO Mapping |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.2 | React Framework |
| React | 18 | UI Library |
| TypeScript | 5.x | Type Safety |
| Tailwind CSS | 3.x | Styling |
| Zustand | 4.x | State Management |
| TanStack Query | 5.x | Data Fetching |
| Axios | 1.x | HTTP Client |
| Radix UI | - | Headless Components |
| Sonner | - | Toast Notifications |

### DevOps & Tools

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Multi-container Orchestration |
| Maven | Backend Build Tool |
| npm | Frontend Package Manager |
| Git | Version Control |

---

## Cấu Trúc Dự Án

```
Ecommerce_BookStore/
├── Backend_Java/                    # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/bookstore/
│   │   │   │   ├── config/         # Configuration classes
│   │   │   │   ├── controller/     # REST Controllers
│   │   │   │   ├── dto/            # Data Transfer Objects
│   │   │   │   │   ├── request/    # Request DTOs
│   │   │   │   │   └── response/   # Response DTOs
│   │   │   │   ├── entity/         # JPA Entities
│   │   │   │   ├── exception/      # Custom Exceptions
│   │   │   │   ├── repository/      # Data Repositories
│   │   │   │   ├── security/        # Security Config
│   │   │   │   └── service/         # Business Logic
│   │   │   └── resources/
│   │   │       ├── application.yml  # App Configuration
│   │   │       └── messages.properties
│   │   └── test/                    # Unit Tests
│   └── pom.xml                     # Maven Dependencies
│
├── Frontend_NextJS/                 # Next.js Frontend
│   ├── src/
│   │   ├── app/                    # Next.js App Router
│   │   │   ├── (auth)/            # Auth pages
│   │   │   ├── admin/             # Admin pages
│   │   │   ├── products/          # Product pages
│   │   │   └── api/               # API routes
│   │   ├── components/
│   │   │   ├── layout/            # Layout components
│   │   │   ├── providers/         # Context providers
│   │   │   └── ui/                 # UI components
│   │   ├── lib/                   # Utilities
│   │   │   ├── api.ts             # API client
│   │   │   ├── store.ts           # Zustand store
│   │   │   └── types.ts           # TypeScript types
│   │   └── styles/                # Global styles
│   ├── public/                    # Static assets
│   └── package.json
│
├── docker-compose.yml              # Docker orchestration
├── Dockerfile.backend             # Backend Dockerfile
├── Dockerfile.frontend            # Frontend Dockerfile
├── .env.example                   # Environment template
└── README.md                      # Documentation
```

---

## Hướng Dẫn Cài Đặt

### Yêu Cầu Hệ Thống

- **Docker & Docker Compose** (khuyến nghị)
- **Java 17+** (nếu chạy local)
- **Node.js 18+** (nếu chạy frontend local)
- **PostgreSQL 16** (nếu chạy local)

### Cách 1: Sử Dụng Docker (Khuyến Nghị)

```bash
# 1. Clone repository
git clone https://github.com/yourusername/bookstore.git
cd bookstore

# 2. Copy và chỉnh sửa file môi trường
cp .env.example .env

# 3. Khởi động toàn bộ hệ thống
docker-compose up -d

# 4. Kiểm tra trạng thái
docker-compose ps

# 5. Xem logs
docker-compose logs -f
```

Sau khi khởi động:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **Swagger UI**: http://localhost:8080/api/swagger-ui.html

### Cách 2: Chạy Local (Backend)

```bash
# 1. Khởi động PostgreSQL
docker-compose up -d postgres

# 2. Cài đặt dependencies và chạy
cd Backend_Java
mvn clean install
mvn spring-boot:run
```

### Cách 3: Chạy Local (Frontend)

```bash
cd Frontend_NextJS
npm install
npm run dev
```

---

## Hướng Dẫn Sử Dụng

### Tài Khoản Demo

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@bookstore.com | Admin123! |
| Manager | manager@bookstore.com | Manager123! |
| Customer | customer@example.com | Customer123! |

### Các Bước Sử Dụng

1. **Đăng nhập**: Sử dụng tài khoản demo hoặc đăng ký tài khoản mới
2. **Khám phá sản phẩm**: Duyệt danh sách sản phẩm, tìm kiếm, lọc theo danh mục
3. **Thêm vào giỏ hàng**: Chọn sản phẩm và thêm vào giỏ hàng
4. **Đặt hàng**: Điền thông tin giao hàng và hoàn tất thanh toán
5. **Theo dõi đơn hàng**: Xem trạng thái đơn hàng trong tài khoản

### Với Quản Trị Viên

1. **Đăng nhập** với tài khoản Admin
2. **Truy cập Dashboard** để xem thống kê
3. **Quản lý sản phẩm**: Thêm, sửa, xóa sản phẩm
4. **Quản lý đơn hàng**: Cập nhật trạng thái đơn hàng
5. **Quản lý người dùng**: Xem danh sách và quản lý tài khoản

---

## API Documentation

### Base URL
```
Development: http://localhost:8080/api
Production: https://api.bookstore.com/api
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Đăng ký tài khoản mới |
| POST | `/auth/login` | Đăng nhập |
| POST | `/auth/refresh` | Làm mới token |
| POST | `/auth/logout` | Đăng xuất |

### Product Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | Lấy danh sách sản phẩm |
| GET | `/products/{id}` | Lấy chi tiết sản phẩm |
| GET | `/products/featured` | Sản phẩm nổi bật |
| GET | `/products/new` | Sản phẩm mới |
| GET | `/products/search` | Tìm kiếm sản phẩm |

### Order Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Tạo đơn hàng mới |
| GET | `/orders` | Lấy danh sách đơn hàng |
| GET | `/orders/{id}` | Lấy chi tiết đơn hàng |

### Full API Documentation

Truy cập **Swagger UI** tại `http://localhost:8080/api/swagger-ui.html` để xem đầy đủ API documentation.

---

## Testing

### Backend Tests

```bash
cd Backend_Java

# Chạy tất cả tests
mvn test

# Chạy tests cụ thể
mvn test -Dtest=AuthServiceTest

# Chạy với coverage report
mvn test jacoco:report
```

### Test Coverage

| Service | Test Cases |
|---------|------------|
| AuthService | 5 tests |
| ProductService | 9 tests |
| OrderService | 7 tests |
| ReviewService | 10 tests |
| CartService | 11 tests |
| CategoryService | 15 tests |
| RefreshTokenService | 12 tests |

---

## Hướng Dẫn Đóng Góp

1. **Fork** repository này
2. **Clone** về máy local của bạn
3. **Tạo branch** mới cho tính năng của bạn
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Commit** changes với conventional commits
   ```bash
   git commit -m "feat: add new feature"
   ```
5. **Push** lên remote
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Tạo Pull Request**

### Quy Tắc Commit (Conventional Commits)

```
feat:     Thêm tính năng mới
fix:      Sửa lỗi
docs:     Cập nhật documentation
style:    Thay đổi code style (không ảnh hưởng logic)
refactor: Refactor code
perf:     Cải thiện performance
test:     Thêm tests
chore:    Thay đổi build process, dependencies
```

---

## Roadmap

- [x] Backend API với Spring Boot
- [x] Frontend với Next.js
- [x] Authentication & Authorization
- [x] Quản lý sản phẩm & danh mục
- [x] Giỏ hàng & Đặt hàng
- [x] Quản lý đơn hàng (Admin)
- [x] Đánh giá sản phẩm
- [x] Docker deployment
- [ ] Thanh toán tích hợp (VNPay, MoMo)
- [ ] Gửi email xác nhận đơn hàng
- [ ] Push notifications
- [ ] Progressive Web App (PWA)
- [ ] Tích hợp Redis cache
- [ ] CI/CD với GitHub Actions

---

## Troubleshooting

### Lỗi thường gặp

#### 1. Backend không khởi động được
```bash
# Kiểm tra PostgreSQL
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d
```

#### 2. Frontend build thất bại
```bash
# Xóa cache và node_modules
cd Frontend_NextJS
rm -rf .next node_modules
npm install
npm run build
```

#### 3. Cổng đã được sử dụng
```bash
# Kiểm tra cổng đang chạy
netstat -ano | findstr :8080
netstat -ano | findstr :3000

# Thay đổi cổng trong docker-compose.yml
```

---

## Liên Hệ

- **Email**: your.email@example.com
- **GitHub**: [github.com/yourusername](https://github.com/yourusername)
- **LinkedIn**: [linkedin.com/in/yourusername](https://linkedin.com/in/yourusername)

---

## License

Dự án này được phân phối dưới giấy phép MIT. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

<div align="center">

**Made with ❤️ and ☕**

*© 2024 BookStore. All rights reserved.*

</div>
