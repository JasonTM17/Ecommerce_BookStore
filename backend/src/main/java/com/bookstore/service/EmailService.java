package com.bookstore.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine emailTemplateEngine;

    // Email validation pattern (RFC 5322 simplified)
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    @Value("${spring.mail.username:noreply@bookstore.com}")
    private String fromEmail;

    @Value("${app.base-url:http://localhost:3000}")
    private String appBaseUrl;

    @Value("${app.email.sender-name:BookStore Team}")
    private String senderName;

    private static final String WELCOME_TEMPLATE = "welcome-email";
    private static final String ORDER_CONFIRMATION_TEMPLATE = "order-confirmation";
    private static final String ORDER_STATUS_TEMPLATE = "order-status-update";
    private static final String PASSWORD_RESET_TEMPLATE = "password-reset";
    private static final String NEWSLETTER_TEMPLATE = "newsletter";

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            // Validate email address
            if (!isValidEmail(to)) {
                log.error("Invalid email address: {}", to);
                return;
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            // Set from with sender name
            helper.setFrom(fromEmail, senderName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            // Add headers for better deliverability
            message.setHeader("X-Mailer", "BookStore-Email-Service");
            message.setHeader("X-Priority", "3");
            
            mailSender.send(message);
            log.info("SUCCESS: HTML email sent successfully to: {}", maskEmail(to));
        } catch (MessagingException e) {
            log.error("ERROR: Failed to send HTML email to {}: Messaging error - {}", maskEmail(to), e.getMessage());
        } catch (MailSendException e) {
            log.error("ERROR: Failed to send HTML email to {}: Mail server error - {}", maskEmail(to), e.getMessage());
        } catch (Exception e) {
            log.error("ERROR: Failed to send HTML email to {}: {}", maskEmail(to), e.getMessage());
        }
    }

    private boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email.trim()).matches();
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return "***";
        }
        String[] parts = email.split("@");
        String local = parts[0];
        String domain = parts[1];
        if (local.length() <= 2) {
            return "**@" + domain;
        }
        return local.substring(0, 2) + "***@" + domain;
    }

    private String processThymeleafTemplate(String template, Map<String, Object> variables) {
        Context context = new Context();
        if (variables != null) {
            variables.forEach(context::setVariable);
        }
        try {
            String html = emailTemplateEngine.process(template, context);
            if (html == null || html.trim().isEmpty()) {
            log.warn("WARNING: Template {} returned empty content, using fallback", template);
                return buildFallbackContent(template, variables);
            }
            return html;
        } catch (Exception e) {
            log.warn("WARNING: Template {} not found, using fallback content. Error: {}", template, e.getMessage());
            return buildFallbackContent(template, variables);
        }
    }

    private String buildFallbackContent(String template, Map<String, Object> variables) {
        return switch (template) {
            case WELCOME_TEMPLATE -> buildWelcomeFallback(variables);
            case PASSWORD_RESET_TEMPLATE -> buildPasswordResetFallback(variables);
            case ORDER_CONFIRMATION_TEMPLATE -> buildOrderConfirmationFallback(variables);
            case ORDER_STATUS_TEMPLATE -> buildOrderStatusFallback(variables);
            case NEWSLETTER_TEMPLATE -> buildNewsletterFallback(variables);
            default -> "Email from BookStore";
        };
    }

    private String buildWelcomeFallback(Map<String, Object> variables) {
        String name = (String) variables.getOrDefault("firstName", "Bạn");
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #667eea;">Chào mừng đến với BookStore!</h1>
                <p>Xin chào <strong>%s</strong>,</p>
                <p>Cảm ơn bạn đã đăng ký tài khoản tại BookStore!</p>
                <p>Chúc bạn có những trải nghiệm tuyệt vời!</p>
                <hr>
                <p style="color: #666;">Đội ngũ BookStore</p>
            </body>
            </html>
            """, name);
    }

    private String buildPasswordResetFallback(Map<String, Object> variables) {
        String resetUrl = (String) variables.getOrDefault("resetUrl", "#");
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #e53e3e;">Đặt lại mật khẩu</h1>
                <p>Nhấp vào liên kết bên dưới để đặt lại mật khẩu:</p>
                <p><a href="%s" style="background: #e53e3e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Đặt lại mật khẩu</a></p>
                <p style="color: #666;">Liên kết hết hạn sau 1 giờ.</p>
                <hr>
                <p style="color: #666;">Đội ngũ BookStore</p>
            </body>
            </html>
            """, resetUrl);
    }

    private String buildOrderConfirmationFallback(Map<String, Object> variables) {
        String orderNumber = (String) variables.getOrDefault("orderNumber", "");
        String total = (String) variables.getOrDefault("totalAmount", "0đ");
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #667eea;">Xác nhận đơn hàng #%s</h1>
                <p>Cảm ơn bạn đã đặt hàng tại BookStore!</p>
                <p>Tổng cộng: <strong>%s</strong></p>
                <p>Chúng tôi sẽ thông báo khi đơn hàng được xác nhận.</p>
                <hr>
                <p style="color: #666;">Đội ngũ BookStore</p>
            </body>
            </html>
            """, orderNumber, total);
    }

    private String buildOrderStatusFallback(Map<String, Object> variables) {
        String orderNumber = (String) variables.getOrDefault("orderNumber", "");
        String status = (String) variables.getOrDefault("status", "");
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #667eea;">Cập nhật đơn hàng #%s</h1>
                <p>Trạng thái: <strong>%s</strong></p>
                <p>Cảm ơn bạn đã mua sắm tại BookStore!</p>
                <hr>
                <p style="color: #666;">Đội ngũ BookStore</p>
            </body>
            </html>
            """, orderNumber, status);
    }

    private String buildNewsletterFallback(Map<String, Object> variables) {
        String title = (String) variables.getOrDefault("featuredBookTitle", "Sách nổi bật");
        String promo = (String) variables.getOrDefault("promoCode", "");
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #667eea;">📚 Bản tin BookStore</h1>
                <h2>%s</h2>
                %s
                <hr>
                <p style="color: #666;">Nếu không muốn nhận email này, vui lòng hủy đăng ký.</p>
            </body>
            </html>
            """, title, promo.isEmpty() ? "" : "<p>Mã khuyến mãi: <strong>" + promo + "</strong></p>");
    }

    @Async
    public void sendSimpleEmail(String to, String subject, String text) {
        try {
            if (!isValidEmail(to)) {
            log.error("ERROR: Invalid email address: {}", to);
                return;
            }
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("SUCCESS: Simple email sent successfully to: {}", maskEmail(to));
        } catch (Exception e) {
            log.error("ERROR: Failed to send email to {}: {}", maskEmail(to), e.getMessage());
        }
    }

    @Async
    public void sendWelcomeEmail(String to, String firstName) {
        Map<String, Object> variables = Map.of(
                "firstName", firstName,
                "baseUrl", appBaseUrl,
                "subject", "Chào mừng đến với BookStore!"
        );
        String htmlContent = processThymeleafTemplate(WELCOME_TEMPLATE, variables);
        sendHtmlEmail(to, "Chào mừng đến với BookStore!", htmlContent);
    }

    @Async
    public void sendPasswordResetEmail(String to, String resetToken) {
        String resetUrl = appBaseUrl + "/reset-password?token=" + resetToken;
        Map<String, Object> variables = Map.of(
                "resetUrl", resetUrl,
                "expiryTime", "1 giờ",
                "userName", to.split("@")[0],
                "subject", "Đặt lại mật khẩu BookStore"
        );
        String htmlContent = processThymeleafTemplate(PASSWORD_RESET_TEMPLATE, variables);
        sendHtmlEmail(to, "Đặt lại mật khẩu BookStore", htmlContent);
    }

    @Async
    public void sendOrderConfirmationEmail(String to, Map<String, Object> orderData) {
        Map<String, Object> variables = Map.of(
                "customerName", orderData.getOrDefault("customerName", "Khách hàng"),
                "orderNumber", orderData.getOrDefault("orderNumber", ""),
                "orderDate", orderData.getOrDefault("orderDate", ""),
                "paymentMethod", orderData.getOrDefault("paymentMethod", "COD"),
                "shippingAddress", orderData.getOrDefault("shippingAddress", ""),
                "orderItems", orderData.getOrDefault("orderItems", List.of()),
                "subtotal", orderData.getOrDefault("subtotal", "0đ"),
                "shippingFee", orderData.getOrDefault("shippingFee", "0đ"),
                "totalAmount", orderData.getOrDefault("totalAmount", "0đ"),
                "subject", "Xác nhận đơn hàng #" + orderData.getOrDefault("orderNumber", "")
        );
        String htmlContent = processThymeleafTemplate(ORDER_CONFIRMATION_TEMPLATE, variables);
        sendHtmlEmail(to, "Xác nhận đơn hàng #" + orderData.getOrDefault("orderNumber", ""), htmlContent);
    }

    @Async
    public void sendOrderStatusUpdateEmail(String to, Map<String, Object> statusData) {
        Map<String, Object> variables = new java.util.HashMap<>();
        variables.put("customerName", statusData.getOrDefault("customerName", "Khách hàng"));
        variables.put("orderNumber", statusData.getOrDefault("orderNumber", ""));
        variables.put("orderDate", statusData.getOrDefault("orderDate", ""));
        variables.put("totalAmount", statusData.getOrDefault("totalAmount", "0đ"));
        variables.put("paymentMethod", statusData.getOrDefault("paymentMethod", "COD"));
        variables.put("status", statusData.getOrDefault("status", ""));
        variables.put("trackingNumber", statusData.getOrDefault("trackingNumber", ""));
        variables.put("shippingPartner", statusData.getOrDefault("shippingPartner", ""));
        variables.put("estimatedDelivery", statusData.getOrDefault("estimatedDelivery", ""));
        variables.put("trackingSteps", statusData.getOrDefault("trackingSteps", List.of()));
        variables.put("additionalNote", statusData.getOrDefault("additionalNote", "Cảm ơn bạn đã tin tưởng BookStore!"));
        variables.put("orderUrl", appBaseUrl + "/orders/" + statusData.getOrDefault("orderNumber", ""));
        variables.put("subject", "Cập nhật trạng thái đơn hàng #" + statusData.getOrDefault("orderNumber", ""));
        
        String htmlContent = processThymeleafTemplate(ORDER_STATUS_TEMPLATE, variables);
        sendHtmlEmail(to, "Cập nhật trạng thái đơn hàng #" + statusData.getOrDefault("orderNumber", ""), htmlContent);
    }

    @Async
    public void sendNewReviewReplyEmail(String to, String productName, String reply) {
        String subject = "Phản hồi mới cho đánh giá sản phẩm: " + productName;
        String text = String.format("""
                Xin chào,
                
                Cửa hàng đã phản hồi đánh giá của bạn về sản phẩm "%s":
                
                "%s"
                
                Trân trọng,
                Đội ngũ BookStore
                """, productName, reply);
        sendSimpleEmail(to, subject, text);
    }

    @Async
    public void sendNewsletterEmail(String to, Map<String, Object> newsletterData) {
        Map<String, Object> variables = new java.util.HashMap<>();
        variables.put("subscriberName", newsletterData.getOrDefault("subscriberName", "Bạn"));
        variables.put("featuredBookTitle", newsletterData.getOrDefault("featuredBookTitle", "Sách nổi bật"));
        variables.put("featuredBookAuthor", newsletterData.getOrDefault("featuredBookAuthor", "Tác giả"));
        variables.put("featuredBookDescription", newsletterData.getOrDefault("featuredBookDescription", ""));
        variables.put("featuredBookPrice", newsletterData.getOrDefault("featuredBookPrice", ""));
        variables.put("featuredBookOriginalPrice", newsletterData.getOrDefault("featuredBookOriginalPrice", ""));
        variables.put("featuredBookEmoji", newsletterData.getOrDefault("featuredBookEmoji", "📖"));
        variables.put("topProducts", newsletterData.getOrDefault("topProducts", List.of()));
        variables.put("promoCode", newsletterData.getOrDefault("promoCode", ""));
        variables.put("promoTitle", newsletterData.getOrDefault("promoTitle", ""));
        variables.put("promoDescription", newsletterData.getOrDefault("promoDescription", ""));
        variables.put("newsItems", newsletterData.getOrDefault("newsItems", List.of()));
        variables.put("shopUrl", appBaseUrl + "/products");
        variables.put("unsubscribeUrl", appBaseUrl + "/unsubscribe?email=" + to);
        variables.put("subject", newsletterData.getOrDefault("subject", "Bản tin BookStore - Tuần này có gì hot?"));
        
        String htmlContent = processThymeleafTemplate(NEWSLETTER_TEMPLATE, variables);
        sendHtmlEmail(to, (String) newsletterData.getOrDefault("subject", "Bản tin BookStore - Tuần này có gì hot?"), htmlContent);
    }
}
