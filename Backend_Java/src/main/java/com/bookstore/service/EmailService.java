package com.bookstore.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@bookstore.com}")
    private String fromEmail;

    @Value("${app.base-url:http://localhost:3000}")
    private String appBaseUrl;

    @Async
    public void sendSimpleEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    @Async
    public void sendWelcomeEmail(String to, String firstName) {
        String subject = "Chào mừng đến với BookStore!";
        String text = String.format("""
            Xin chào %s,
            
            Cảm ơn bạn đã đăng ký tài khoản tại BookStore!
            
            Bây giờ bạn có thể:
            - Khám phá hàng ngàn đầu sách hay
            - Mua sắm với giá ưu đãi
            - Theo dõi đơn hàng dễ dàng
            - Nhận nhiều ưu đãi hấp dẫn
            
            Chúc bạn có những trải nghiệm tuyệt vời cùng BookStore!
            
            Trân trọng,
            Đội ngũ BookStore
            """, firstName);
        sendSimpleEmail(to, subject, text);
    }

    @Async
    public void sendPasswordResetEmail(String to, String resetToken) {
        String resetUrl = appBaseUrl + "/reset-password?token=" + resetToken;
        String subject = "Đặt lại mật khẩu BookStore";
        String text = String.format("""
            Xin chào,
            
            Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản BookStore của bạn.
            
            Nhấp vào liên kết bên dưới để đặt lại mật khẩu:
            %s
            
            Liên kết này sẽ hết hạn sau 1 giờ.
            
            Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
            
            Trân trọng,
            Đội ngũ BookStore
            """, resetUrl);
        sendSimpleEmail(to, subject, text);
    }

    @Async
    public void sendOrderConfirmationEmail(String to, String orderNumber, String orderDetails) {
        String subject = "Xác nhận đơn hàng #" + orderNumber;
        String text = String.format("""
            Xin chào,
            
            Cảm ơn bạn đã đặt hàng tại BookStore!
            
            Mã đơn hàng: %s
            
            %s
            
            Chúng tôi sẽ thông báo khi đơn hàng được xác nhận và vận chuyển.
            
            Trân trọng,
            Đội ngũ BookStore
            """, orderNumber, orderDetails);
        sendSimpleEmail(to, subject, text);
    }

    @Async
    public void sendOrderStatusUpdateEmail(String to, String orderNumber, String status) {
        String subject = "Cập nhật trạng thái đơn hàng #" + orderNumber;
        String text = String.format("""
            Xin chào,
            
            Đơn hàng #%s của bạn đã được cập nhật trạng thái: %s
            
            Cảm ơn bạn đã mua sắm tại BookStore!
            
            Trân trọng,
            Đội ngũ BookStore
            """, orderNumber, status);
        sendSimpleEmail(to, subject, text);
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
    public void sendNewsletterEmail(String to, String subject, String content) {
        sendSimpleEmail(to, subject, content);
    }
}
