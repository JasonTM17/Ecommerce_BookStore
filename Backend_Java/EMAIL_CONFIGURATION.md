# 📧 Email Configuration Guide

## Mục lục
- [Tổng quan](#tổng-quan)
- [Cấu hình Gmail SMTP](#cấu-hình-gmail-smtp)
- [Các loại Email Templates](#các-loại-email-templates)
- [API Test Endpoints](#api-test-endpoints)
- [Cron Jobs](#cron-jobs)
- [Chạy Tests](#chạy-tests)

---

## Tổng quan

Hệ thống email sử dụng:
- **Spring Boot Mail Starter** - Gửi email qua SMTP
- **Thymeleaf Templates** - Tạo email HTML đẹp mắt
- **Async Processing** - Gửi email không chặn request

### Cấu trúc files

```
Backend_Java/
├── src/main/resources/templates/email/
│   ├── welcome-email.html          # Email chào mừng
│   ├── order-confirmation.html     # Xác nhận đơn hàng
│   ├── order-status-update.html    # Cập nhật trạng thái
│   ├── password-reset.html         # Đặt lại mật khẩu
│   └── newsletter.html             # Bản tin tuần
│
├── src/main/java/com/bookstore/service/
│   ├── EmailService.java           # Service gửi email
│   └── ScheduledEmailService.java  # Cron jobs
│
└── src/main/java/com/bookstore/controller/
    └── EmailTestController.java    # API test (dev only)
```

---

## Cấu hình Gmail SMTP

### Bước 1: Tạo App Password

1. Truy cập: https://myaccount.google.com/security
2. Bật **2-Step Verification** (nếu chưa bật)
3. Vào **App Passwords**
4. Tạo mới:
   - App: Mail
   - Device: Other (đặt tên: BookStore)
5. Copy **16 ký tự App Password**

### Bước 2: Cấu hình .env

```bash
# Tạo file .env từ .env.example
cp .env.example .env

# Sửa file .env với credentials thực
nano .env
```

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=xxxx xxxx xxxx xxxx
MAIL_FROM=noreply@bookstore.com
APP_BASE_URL=http://localhost:3000
```

### Bước 3: Chạy ứng dụng

```bash
# Load .env và chạy
export $(cat .env | xargs) && mvn spring-boot:run
```

---

## Các loại Email Templates

### 1. Welcome Email
```java
emailService.sendWelcomeEmail("user@example.com", "Nguyễn Văn A");
```

### 2. Password Reset
```java
emailService.sendPasswordResetEmail("user@example.com", "reset-token-xyz");
```

### 3. Order Confirmation
```java
Map<String, Object> orderData = new HashMap<>();
orderData.put("customerName", "Nguyễn Văn A");
orderData.put("orderNumber", "BK123456");
orderData.put("totalAmount", "220.000đ");
orderData.put("orderItems", List.of(
    Map.of("productName", "Clean Code", "quantity", 1, "totalPrice", "200.000đ")
));

emailService.sendOrderConfirmationEmail("user@example.com", orderData);
```

### 4. Order Status Update
```java
Map<String, Object> statusData = new HashMap<>();
statusData.put("orderNumber", "BK123456");
statusData.put("status", "SHIPPED");
statusData.put("trackingNumber", "VN123456789");

emailService.sendOrderStatusUpdateEmail("user@example.com", statusData);
```

### 5. Newsletter
```java
Map<String, Object> newsletterData = new HashMap<>();
newsletterData.put("subscriberName", "Nguyễn Văn A");
newsletterData.put("featuredBookTitle", "Clean Code");
newsletterData.put("promoCode", "WEEKLY15");

emailService.sendNewsletterEmail("user@example.com", newsletterData);
```

---

## API Test Endpoints

### ⚠️ Cảnh báo bảo mật

Test endpoints **CHỈ** hoạt động khi:
- Profile: `dev` hoặc test
- Property: `app.email.test-endpoint-enabled=true`

### Kích hoạt Test Endpoints

```bash
# Trong .env
APP_EMAIL_TEST_ENABLED=true
APP_EMAIL_ALLOWED_RECIPIENTS=jasonbmt06@gmail.com
```

### Các Endpoints

#### 1. Health Check
```bash
GET /api/email/health
```

#### 2. Gửi một loại email
```bash
POST /api/email/test/send
Content-Type: application/json

{
    "to": "jasonbmt06@gmail.com",
    "type": "welcome",
    "firstName": "Jason"
}
```

**Các loại email:** `welcome`, `password-reset`, `order`, `order-status`, `newsletter`

#### 3. Gửi tất cả các loại email
```bash
POST /api/email/test/send-all?to=jasonbmt06@gmail.com
```

#### 4. Trigger Weekly Newsletter (Manual)
```bash
POST /api/email/test/newsletter-weekly
```

---

## Cron Jobs

### 1. Weekly Newsletter
- **Cron:** `0 0 9 ? * SUN` (Chủ Nhật 9:00 sáng)
- **Mô tả:** Gửi bản tin tuần cho tất cả users
- **Tắt:** `app.newsletter.enabled=false`

### 2. Abandoned Cart Reminder
- **Cron:** `0 0 18 * * ?` (18:00 hàng ngày)
- **Mô tả:** Nhắc nhở giỏ hàng bị bỏ quên
- **Trạng thái:** TODO - Cần implement

### 3. Birthday Email
- **Cron:** `0 0 8 * * ?` (8:00 sáng hàng ngày)
- **Mô tả:** Gửi lời chúc mừng sinh nhật
- **Trạng thái:** TODO - Cần implement

---

## Chạy Tests

### Unit Tests
```bash
mvn test -Dtest=EmailServiceTest
```

### Integration Tests
```bash
# Cần set credentials trước
export MAIL_USERNAME=your-email@gmail.com
export MAIL_PASSWORD="xxxx xxxx xxxx xxxx"
export APP_EMAIL_INTEGRATION_ENABLED=true

mvn test -Dspring.profiles.active=integration-test -Dapp.email.integration-test-enabled=true
```

---

## Troubleshooting

### Lỗi "Authentication failed"

1. Kiểm tra App Password đúng chưa
2. Đảm bảo đã bật 2-Step Verification
3. Thử tạo App Password mới

### Lỗi "SMTP server unreachable"

1. Kiểm tra Internet connection
2. Kiểm tra `MAIL_HOST` đúng chưa
3. Firewall không chặn port 587

### Email không nhận được

1. Kiểm tra thư mục **Spam/Junk**
2. Kiểm tra địa chỉ email đúng không
3. Kiểm tra logs: `logs/bookstore.log`

---

## Bảo mật

### ⚠️ Lưu ý quan trọng

1. **KHÔNG BAO GIỜ** commit App Password vào git
2. **LUÔN LUÔN** sử dụng `.env` file cho credentials
3. **THU HỒI** App Password cũ nếu bị lộ
4. **TẮT** test endpoints trong production

### Kiểm tra bảo mật

```bash
# Kiểm tra .env không bị commit
git check-ignore .env
# Output phải là: .env
```

---

## Tham khảo

- [Spring Boot Mail](https://docs.spring.io/spring-boot/docs/current/reference/html/mail.html)
- [Thymeleaf Email](https://www.thymeleaf.org/doc/articles/springmail.html)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
