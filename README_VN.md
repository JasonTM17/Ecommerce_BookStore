# Ecommerce BookStore - Nền tảng Thương mại Điện tử Sách Chuyên nghiệp

[![CI/CD Pipeline](https://github.com/JasonTM17/Ecommerce_BookStore/actions/workflows/ci.yml/badge.svg)](https://github.com/JasonTM17/Ecommerce_BookStore/actions/workflows/ci.yml)
[![Codecov](https://codecov.io/gh/JasonTM17/Ecommerce_BookStore/branch/master/graph/badge.svg)](https://codecov.io/gh/JasonTM17/Ecommerce_BookStore)

Đây là một dự án thương mại điện tử hoàn chỉnh (Full-stack) được xây dựng dành cho Portfolio, tập trung vào tính chuyên nghiệp, hiệu năng cao và các tính năng tự động hóa Marketing hiện đại.

## 🚀 Công nghệ Sử dụng

Dự án được xây dựng trên mô hình Micro-monolith hiện đại:

- **Backend**: Spring Boot 3.3, Java 17, Spring Security (JWT), Spring Data JPA.
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn/UI, React Query.
- **Mobile**: React Native (Expo), Lucide Icons, Zustand.
- **Database & DevOps**: MySQL 8, Docker, Docker Compose, GitHub Actions (CI/CD).
- **Security**: Bucket4j (Rate Limiting), JWT Stateless Auth, CSP Headers.

## ✨ Tính năng Nổi bật

### 1. Tự động hóa Marketing (Marketing Automation)
- **Email Chào mừng**: Tự động gửi email khi người dùng đăng ký mới.
- **Nhắc nhở Giỏ hàng bỏ quên**: Tự động quét và gửi email khuyến mãi 10% cho các giỏ hàng không hoạt động trên 24 giờ.
- **Chúc mừng Sinh nhật**: Gửi mã giảm giá 20% tự động vào ngày sinh nhật của người dùng.
- **Flash Sale Hàng tuần**: Hệ thống tự động xoay vòng các chiến dịch Flash Sale vào 00:05 mỗi thứ Hai.

### 2. Trải nghiệm Người dùng (UX/UI)
- **Đa ngôn ngữ (i18n)**: Hỗ trợ đầy đủ Tiếng Việt và Tiếng Anh.
- **Thiết kế Hiện đại**: Giao diện Responsive, hỗ trợ Dark Mode, Skeleton Loaders cho trải nghiệm mượt mà.
- **Chatbot thông minh**: Tích hợp chatbot hỗ trợ khách hàng.

### 3. Hệ thống Quản trị (Admin Dashboard)
- Thống kê doanh thu theo thời gian thực.
- Biểu đồ xu hướng doanh thu (Monthly Trend).
- Quản lý kho hàng (Cảnh báo tồn kho thấp).

## 🛠 Hướng dẫn Cài đặt

### Yêu cầu Hệ thống
- Docker & Docker Compose
- Node.js 20+ (nếu chạy local)
- Java 17 (nếu chạy local)

### Chạy nhanh với Docker
```bash
# Clone dự án
git clone https://github.com/JasonTM17/Ecommerce_BookStore.git
cd Ecommerce_BookStore

# Chạy toàn bộ hệ thống (Backend, Frontend, DB)
docker compose up -d
```

Hệ thống sẽ khả dụng tại:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080/api`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

## 🛡 Bảo mật & Độ tin cậy
- **Rate Limiting**: Chống tấn công brute-force ở các điểm nhạy cảm (Login, Register, Chatbot).
- **CI/CD**: Tự động chạy Unit Test, Integration Test (MySQL), E2E Test (Playwright) và Security Scan (Trivy) trên mỗi lần push.

---
*Dự án được phát triển bởi **JasonTM17** cho mục đích Portfolio.*
