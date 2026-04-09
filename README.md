# Ecommerce BookStore Platform

Một nền tảng thương mại điện tử chuyên nghiệp được xây dựng bằng **Spring Boot + PostgreSQL + Next.js**, lấy cảm hứng từ các nền tảng thương mại điện tử hàng đầu Việt Nam như Tiki và Thế Giới Di Động.

## 👨‍💻 Giới Thiệu

Dự án portfolio này được phát triển bởi **Nguyễn Sơn** - một full-stack developer với mục tiêu tạo ra một hệ thống e-commerce hoàn chỉnh, có thể triển khai thực tế và thể hiện kỹ năng lập trình chuyên nghiệp.

## 🛠️ Công Nghệ Sử Dụng

### Backend
- **Java 17** - Ngôn ngữ lập trình chính
- **Spring Boot 3.2** - Framework backend
- **Spring Security + JWT** - Xác thực và phân quyền
- **Spring Data JPA / Hibernate** - ORM
- **PostgreSQL 16** - Cơ sở dữ liệu
- **SpringDoc OpenAPI (Swagger)** - Tài liệu API

### Frontend
- **Next.js 14** - Framework React
- **React 18** - Thư viện UI
- **TypeScript** - Ngôn ngữ kiểu tĩnh
- **Tailwind CSS** - Styling
- **TanStack Query** - Quản lý state
- **Zustand** - State management
- **Radix UI** - UI primitives

### DevOps & Tools
- **Docker & Docker Compose** - Containerization
- **Maven** - Build tool
- **JUnit & Mockito** - Testing

## 📁 Cấu Trúc Dự Án

```
Ecommerce_BookStore/
├── Backend_Java/                 # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/bookstore/
│   │   │   │   ├── config/      # Configuration classes
│   │   │   │   ├── controller/  # REST Controllers
│   │   │   │   ├── dto/         # Data Transfer Objects
│   │   │   │   ├── entity/      # JPA Entities
│   │   │   │   ├── exception/   # Exception handling
│   │   │   │   ├── repository/ # Data repositories
│   │   │   │   ├── security/   # Security config & JWT
│   │   │   │   └── service/    # Business logic
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/                # Unit tests
│   └── pom.xml
│
├── Frontend_NextJS/             # Next.js Frontend
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   ├── components/         # React components
│   │   ├── lib/                # Utilities & API
│   │   └── styles/             # Global styles
│   ├── public/                  # Static assets
│   └── package.json
│
├── docker-compose.yml           # Production Docker setup
├── docker-compose.dev.yml      # Development Docker setup
├── Dockerfile.backend
├── Dockerfile.frontend
└── README.md
```

## 🚀 Cách Chạy Dự Án

### Yêu Cầu Hệ Thống

- JDK 17+
- Node.js 18+
- PostgreSQL 16+ (hoặc Docker)
- Maven 3.8+
- Docker & Docker Compose (khuyến nghị)

### Cách 1: Docker Compose (Khuyến Nghị)

```bash
# Clone repository
git clone https://github.com/JasonTM17/Ecommerce_BookStore.git
cd Ecommerce_BookStore

# Build và chạy tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng services
docker-compose down
```

Sau khi khởi động:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **PostgreSQL**: localhost:5432

### Cách 2: Chạy Local

#### Backend

```bash
cd Backend_Java

# Cài đặt dependencies
mvn clean install

# Chạy ứng dụng
mvn spring-boot:run
```

#### Frontend

```bash
cd Frontend_NextJS

# Cài đặt dependencies
npm install

# Copy file cấu hình
cp .env.local.example .env.local

# Chạy development server
npm run dev
```

### Cấu Hình Database

Tạo database PostgreSQL:

```sql
CREATE DATABASE bookstore;
```

Hoặc sử dụng Docker:

```bash
docker run -d \
  --name bookstore-postgres \
  -e POSTGRES_DB=bookstore \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -p 5432:5432 \
  postgres:16-alpine
```

## 👤 Tài Khoản Demo

### Admin Account
- **Email**: admin@bookstore.com
- **Password**: Admin123!

### Customer Account
- **Email**: customer@example.com
- **Password**: Customer123!

## ✨ Tính Năng Chính

### Khách Hàng
- [x] Đăng ký / Đăng nhập với JWT
- [x] Xem sản phẩm với bộ lọc và phân trang
- [x] Tìm kiếm sản phẩm
- [x] Xem chi tiết sản phẩm với đánh giá
- [x] Quản lý giỏ hàng
- [x] Thanh toán với nhiều phương thức
- [x] Theo dõi đơn hàng
- [x] Quản lý tài khoản

### Quản Trị (Admin)
- [x] Dashboard với thống kê
- [x] Quản lý sản phẩm (CRUD)
- [x] Quản lý danh mục (CRUD)
- [x] Quản lý đơn hàng
- [x] Quản lý người dùng
- [x] Cập nhật trạng thái đơn hàng

### Bảo Mật
- [x] Xác thực JWT
- [x] Mã hóa mật khẩu BCrypt
- [x] Phân quyền Role-Based Access Control
- [x] Bảo vệ API endpoints
- [x] CORS configuration

## 📊 API Endpoints

### Authentication
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/api/auth/register` | Đăng ký tài khoản mới |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/refresh` | Làm mới token |

### Products
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/products` | Lấy danh sách sản phẩm |
| GET | `/api/products/{id}` | Lấy chi tiết sản phẩm |
| GET | `/api/products/featured` | Sản phẩm nổi bật |
| GET | `/api/products/new` | Sản phẩm mới |
| POST | `/api/admin/products` | Tạo sản phẩm (Admin) |

### Categories
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/categories` | Lấy danh sách danh mục |
| GET | `/api/categories/{id}` | Lấy chi tiết danh mục |

### Orders
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/orders` | Lấy đơn hàng của user |
| POST | `/api/orders` | Tạo đơn hàng |
| GET | `/api/orders/{id}` | Lấy chi tiết đơn hàng |
| PUT | `/api/admin/orders/{id}/status` | Cập nhật trạng thái (Admin) |

Xem đầy đủ API tại [Swagger UI](http://localhost:8080/api/swagger-ui.html)

## 🧪 Testing

### Backend Tests

```bash
cd Backend_Java

# Chạy tất cả tests
mvn test

# Chạy với coverage
mvn test jacoco:report
```

### Frontend Tests

```bash
cd Frontend_NextJS
npm test
```

## 📝 License

Dự án này được tạo cho mục đích portfolio. Mọi quyền được bảo lưu.

## 📬 Liên Hệ

- **Author**: Nguyễn Sơn
- **GitHub**: [JasonTM17](https://github.com/JasonTM17)
- **Email**: contact@bookstore.com

---

© 2026 BookStore Platform. Thiết kế và phát triển bởi Nguyễn Sơn.
