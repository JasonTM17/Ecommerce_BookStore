package com.bookstore.controller;

import com.bookstore.dto.request.NewsletterRequest;
import com.bookstore.dto.request.OrderItemDto;
import com.bookstore.dto.request.TestEmailRequest;
import com.bookstore.dto.request.TrackingStepDto;
import com.bookstore.dto.response.ApiResponse;
import com.bookstore.service.EmailService;
import com.bookstore.service.ScheduledEmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * API Controller để test gửi email trong môi trường Development.
 * 
 * ⚠️ CẢNH BÁO: Controller này chỉ nên enable trong môi trường dev!
 * Trong production, hãy disable bằng cách set: app.email.test-endpoint-enabled=false
 */
@RestController
@RequestMapping("/email")
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "app.email.test-endpoint-enabled", havingValue = "true")
public class EmailTestController {

    private final EmailService emailService;
    private final ScheduledEmailService scheduledEmailService;

    @Value("${app.email.test-endpoint-enabled:false}")
    private boolean testEndpointEnabled;

    @Value("${app.email.allowed-test-recipients:#{null}}")
    private String allowedTestRecipients;

    @Value("${app.base-url:http://localhost:3000}")
    private String appBaseUrl;

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> healthCheck() {
        Map<String, Object> status = new HashMap<>();
        status.put("testEndpointEnabled", testEndpointEnabled);
        status.put("message", testEndpointEnabled 
                ? "Email test endpoints are ENABLED (dev only!)" 
                : "Email test endpoints are DISABLED");
        status.put("allowedRecipients", allowedTestRecipients);
        return ResponseEntity.ok(ApiResponse.success(status));
    }

    @PostMapping("/test/send")
    public ResponseEntity<ApiResponse<String>> sendTestEmail(
            @Valid @RequestBody TestEmailRequest request) {
        
        checkTestEndpointEnabled();
        validateRecipient(request.getTo());

        log.info("🧪 Test email requested: type={}, to={}", request.getType(), request.getTo());

        switch (request.getType().toLowerCase()) {
            case "welcome" -> emailService.sendWelcomeEmail(
                    request.getTo(), 
                    request.getFirstName() != null ? request.getFirstName() : "Test User");
            
            case "password-reset" -> emailService.sendPasswordResetEmail(
                    request.getTo(), 
                    request.getResetToken() != null ? request.getResetToken() : "test-reset-token-" + System.currentTimeMillis());
            
            case "order" -> sendOrderConfirmation(request);
            
            case "order-status" -> sendOrderStatus(request);
            
            case "newsletter" -> sendNewsletter(request);
            
            default -> {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Unknown email type: " + request.getType() + 
                                ". Valid types: welcome, password-reset, order, order-status, newsletter"));
            }
        }

        return ResponseEntity.ok(ApiResponse.success(
                "Email queued successfully! Type: " + request.getType(), 
                "Email đang được gửi đến " + request.getTo()));
    }

    @PostMapping("/test/send-all")
    public ResponseEntity<ApiResponse<Map<String, String>>> sendAllEmailTypes(
            @RequestParam(defaultValue = "test@example.com") String to) {
        
        checkTestEndpointEnabled();
        validateRecipient(to);

        log.info("🧪 Sending all email types to: {}", to);

        Map<String, String> results = new LinkedHashMap<>();

        try {
            emailService.sendWelcomeEmail(to, "Test User");
            results.put("welcome", "✅ Queued");
        } catch (Exception e) {
            results.put("welcome", "❌ Failed: " + e.getMessage());
        }

        try {
            String token = "test-token-" + System.currentTimeMillis();
            emailService.sendPasswordResetEmail(to, token);
            results.put("password-reset", "✅ Queued");
        } catch (Exception e) {
            results.put("password-reset", "❌ Failed: " + e.getMessage());
        }

        try {
            sendOrderConfirmation(to, "BK-TEST-" + System.currentTimeMillis());
            results.put("order", "✅ Queued");
        } catch (Exception e) {
            results.put("order", "❌ Failed: " + e.getMessage());
        }

        try {
            sendOrderStatus(to, "BK-TEST-" + System.currentTimeMillis());
            results.put("order-status", "✅ Queued");
        } catch (Exception e) {
            results.put("order-status", "❌ Failed: " + e.getMessage());
        }

        try {
            sendNewsletter(to);
            results.put("newsletter", "✅ Queued");
        } catch (Exception e) {
            results.put("newsletter", "❌ Failed: " + e.getMessage());
        }

        return ResponseEntity.ok(ApiResponse.success(results, "Tất cả email đã được gửi!"));
    }

    @PostMapping("/test/newsletter-weekly")
    public ResponseEntity<ApiResponse<String>> triggerWeeklyNewsletter() {
        checkTestEndpointEnabled();

        log.info("🧪 Triggering weekly newsletter manually");

        try {
            scheduledEmailService.sendWeeklyNewsletter();
            return ResponseEntity.ok(ApiResponse.success("Weekly newsletter job triggered!"));
        } catch (Exception e) {
            log.error("Failed to trigger newsletter: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to trigger newsletter: " + e.getMessage()));
        }
    }

    private void sendOrderConfirmation(TestEmailRequest request) {
        String orderNumber = request.getOrderNumber() != null 
                ? request.getOrderNumber() 
                : "BK-TEST-" + System.currentTimeMillis();
        sendOrderConfirmation(request.getTo(), orderNumber);
    }

    private void sendOrderConfirmation(String to, String orderNumber) {
        Map<String, Object> orderData = new HashMap<>();
        orderData.put("customerName", "Test Customer");
        orderData.put("orderNumber", orderNumber);
        orderData.put("orderDate", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
        orderData.put("paymentMethod", "COD");
        orderData.put("shippingAddress", "123 Test Street, Test City");
        orderData.put("subtotal", "350.000đ");
        orderData.put("shippingFee", "25.000đ");
        orderData.put("totalAmount", "375.000đ");
        orderData.put("orderItems", List.of(
                OrderItemDto.builder()
                        .productName("Clean Code - Robert C. Martin")
                        .quantity(1)
                        .totalPrice("350.000đ")
                        .build()
        ));

        emailService.sendOrderConfirmationEmail(to, orderData);
    }

    private void sendOrderStatus(TestEmailRequest request) {
        String orderNumber = request.getOrderNumber() != null 
                ? request.getOrderNumber() 
                : "BK-TEST-" + System.currentTimeMillis();
        sendOrderStatus(request.getTo(), orderNumber);
    }

    private void sendOrderStatus(String to, String orderNumber) {
        Map<String, Object> statusData = new HashMap<>();
        statusData.put("customerName", "Test Customer");
        statusData.put("orderNumber", orderNumber);
        statusData.put("orderDate", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        statusData.put("totalAmount", "375.000đ");
        statusData.put("paymentMethod", "COD");
        statusData.put("status", "SHIPPED");
        statusData.put("trackingNumber", "VN" + System.currentTimeMillis());
        statusData.put("shippingPartner", "Giao hàng nhanh");
        statusData.put("estimatedDelivery", LocalDateTime.now().plusDays(3).format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        statusData.put("additionalNote", "Cảm ơn bạn đã mua sắm tại BookStore!");
        statusData.put("trackingSteps", List.of(
                TrackingStepDto.builder()
                        .title("Đơn hàng đã được đặt")
                        .date(LocalDateTime.now().minusDays(2).format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                        .completed(true)
                        .current(false)
                        .build(),
                TrackingStepDto.builder()
                        .title("Đã xác nhận thanh toán")
                        .date(LocalDateTime.now().minusDays(1).format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                        .completed(true)
                        .current(false)
                        .build(),
                TrackingStepDto.builder()
                        .title("Đang vận chuyển")
                        .date(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                        .completed(false)
                        .current(true)
                        .build(),
                TrackingStepDto.builder()
                        .title("Đã giao hàng")
                        .date("Dự kiến: " + LocalDateTime.now().plusDays(3).format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                        .completed(false)
                        .current(false)
                        .build()
        ));

        emailService.sendOrderStatusUpdateEmail(to, statusData);
    }

    private void sendNewsletter(TestEmailRequest request) {
        sendNewsletter(request.getTo());
    }

    private void sendNewsletter(String to) {
        NewsletterRequest nr = NewsletterRequest.builder()
                .subscriberName("Test User")
                .featuredBookTitle("Clean Code")
                .featuredBookAuthor("Robert C. Martin")
                .featuredBookDescription("Một cuốn sách kinh điển về lập trình sạch. Giúp bạn viết code dễ đọc, dễ bảo trì.")
                .featuredBookPrice("350.000đ")
                .featuredBookOriginalPrice("450.000đ")
                .promoCode("TESTING25")
                .promoTitle("🎁 Ưu đãi đặc biệt!")
                .promoDescription("Giảm 25% cho tất cả sách kỹ năng lập trình")
                .build();

        Map<String, Object> newsletterData = new HashMap<>();
        newsletterData.put("subscriberName", nr.getSubscriberName());
        newsletterData.put("featuredBookTitle", nr.getFeaturedBookTitle());
        newsletterData.put("featuredBookAuthor", nr.getFeaturedBookAuthor());
        newsletterData.put("featuredBookDescription", nr.getFeaturedBookDescription());
        newsletterData.put("featuredBookPrice", nr.getFeaturedBookPrice());
        newsletterData.put("featuredBookOriginalPrice", nr.getFeaturedBookOriginalPrice());
        newsletterData.put("featuredBookEmoji", "💻");
        newsletterData.put("promoCode", nr.getPromoCode());
        newsletterData.put("promoTitle", nr.getPromoTitle());
        newsletterData.put("promoDescription", nr.getPromoDescription());
        newsletterData.put("topProducts", List.of(
                Map.of("title", "The Pragmatic Programmer", "author", "David Thomas", "price", "280.000đ", "emoji", "📚"),
                Map.of("title", "Design Patterns", "author", "Gang of Four", "price", "320.000đ", "emoji", "🎨")
        ));
        newsletterData.put("newsItems", List.of(
                Map.of("title", "📚 Sách mới về kỹ năng sống", "summary", "Khám phá bộ sưu tập sách mới."),
                Map.of("title", "🎉 Chương trình tích điểm đổi quà", "summary", "Tích lũy điểm thưởng với mỗi đơn hàng.")
        ));

        emailService.sendNewsletterEmail(to, newsletterData);
    }

    private void checkTestEndpointEnabled() {
        if (!testEndpointEnabled) {
            throw new com.bookstore.exception.ForbiddenException(
                    "Email test endpoints are disabled. Enable with app.email.test-endpoint-enabled=true");
        }
    }

    private void validateRecipient(String email) {
        if (allowedTestRecipients != null && !allowedTestRecipients.isEmpty()) {
            List<String> allowed = Arrays.asList(allowedTestRecipients.split(","));
            if (!allowed.contains(email.toLowerCase())) {
                throw new com.bookstore.exception.ForbiddenException(
                        "Email recipient not allowed for testing. Allowed: " + allowedTestRecipients);
            }
        }
    }
}
