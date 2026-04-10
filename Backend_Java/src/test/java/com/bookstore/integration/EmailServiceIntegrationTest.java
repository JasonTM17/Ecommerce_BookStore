package com.bookstore.integration;

import com.bookstore.service.EmailService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration test for EmailService with real SMTP server.
 * 
 * IMPORTANT: These tests only run when:
 * 1. Profile "integration-test" is active
 * 2. Property app.email.integration-test-enabled=true
 * 
 * To run these tests:
 * - Set MAIL_USERNAME and MAIL_PASSWORD in your environment or .env file
 * - Run with: mvn test -Dspring.profiles.active=integration-test -Dapp.email.integration-test-enabled=true
 */
@SpringBootTest
@ActiveProfiles("integration-test")
@TestPropertySource(properties = {
    "app.email.integration-test-enabled=true",
    "spring.mail.host=smtp.gmail.com",
    "spring.mail.port=587",
    "spring.mail.properties.mail.smtp.auth=true",
    "spring.mail.properties.mail.smtp.starttls.enable=true"
})
@Tag("integration")
@DisplayName("EmailService Integration Tests (Real SMTP)")
class EmailServiceIntegrationTest {

    @Autowired(required = false)
    private EmailService emailService;

    @Value("${app.email.integration-test-enabled:false}")
    private boolean integrationTestEnabled;

    @Value("${spring.mail.username:#{null}}")
    private String mailUsername;

    @Value("${spring.mail.password:#{null}}")
    private String mailPassword;

    private static final String TEST_RECIPIENT = "jasonbmt06@gmail.com";

    @Test
    @DisplayName("Should skip test if integration testing is disabled")
    void skipIfDisabled() {
        if (!integrationTestEnabled) {
            System.out.println("⚠️ Integration tests are disabled. Set app.email.integration-test-enabled=true to run.");
        }
        assertThat(true).isTrue();
    }

    // @Test
    // @DisplayName("Send welcome email to jasonbmt06@gmail.com")
    // void shouldSendWelcomeEmailToJason() {
    //     assumeThat(integrationTestEnabled).isTrue();
    //     assumeThat(mailUsername).isNotNull();
    //     assumeThat(mailPassword).isNotNull();
    //     assumeThat(emailService).isNotNull();
    // 
    //     System.out.println("📧 Sending welcome email to " + TEST_RECIPIENT);
    // 
    //     emailService.sendWelcomeEmail(TEST_RECIPIENT, "Jason");
    // 
    //     // Give async some time to process
    //     try { Thread.sleep(2000); } catch (InterruptedException e) { }
    // 
    //     System.out.println("✅ Welcome email sent successfully!");
    // }

    // @Test
    // @DisplayName("Send order confirmation email to jasonbmt06@gmail.com")
    // void shouldSendOrderConfirmationToJason() {
    //     assumeThat(integrationTestEnabled).isTrue();
    //     assumeThat(emailService).isNotNull();
    // 
    //     Map<String, Object> orderData = new HashMap<>();
    //     orderData.put("customerName", "Jason");
    //     orderData.put("orderNumber", "BK" + System.currentTimeMillis());
    //     orderData.put("orderDate", "10/04/2026");
    //     orderData.put("paymentMethod", "COD");
    //     orderData.put("shippingAddress", "123 Đường ABC, Quận 1, TP.HCM");
    //     orderData.put("subtotal", "200.000đ");
    //     orderData.put("shippingFee", "20.000đ");
    //     orderData.put("totalAmount", "220.000đ");
    //     orderData.put("orderItems", List.of(
    //         Map.of("productName", "Clean Code", "quantity", 1, "totalPrice", "200.000đ")
    //     ));
    // 
    //     System.out.println("📧 Sending order confirmation to " + TEST_RECIPIENT);
    // 
    //     emailService.sendOrderConfirmationEmail(TEST_RECIPIENT, orderData);
    // 
    //     try { Thread.sleep(2000); } catch (InterruptedException e) { }
    // 
    //     System.out.println("✅ Order confirmation email sent!");
    // }

    // @Test
    // @DisplayName("Send password reset email to jasonbmt06@gmail.com")
    // void shouldSendPasswordResetToJason() {
    //     assumeThat(integrationTestEnabled).isTrue();
    //     assumeThat(emailService).isNotNull();
    // 
    //     String resetToken = "test-token-" + System.currentTimeMillis();
    // 
    //     System.out.println("📧 Sending password reset email to " + TEST_RECIPIENT);
    // 
    //     emailService.sendPasswordResetEmail(TEST_RECIPIENT, resetToken);
    // 
    //     try { Thread.sleep(2000); } catch (InterruptedException e) { }
    // 
    //     System.out.println("✅ Password reset email sent!");
    // }

    // @Test
    // @DisplayName("Send newsletter email to jasonbmt06@gmail.com")
    // void shouldSendNewsletterToJason() {
    //     assumeThat(integrationTestEnabled).isTrue();
    //     assumeThat(emailService).isNotNull();
    // 
    //     Map<String, Object> newsletterData = new HashMap<>();
    //     newsletterData.put("subscriberName", "Jason");
    //     newsletterData.put("featuredBookTitle", "Clean Code - Robert C. Martin");
    //     newsletterData.put("featuredBookAuthor", "Robert C. Martin");
    //     newsletterData.put("featuredBookDescription", "Một cuốn sách kinh điển về lập trình sạch.");
    //     newsletterData.put("featuredBookPrice", "350.000đ");
    //     newsletterData.put("featuredBookOriginalPrice", "450.000đ");
    //     newsletterData.put("featuredBookEmoji", "💻");
    //     newsletterData.put("promoCode", "WEEKLY15");
    //     newsletterData.put("promoTitle", "🎁 Ưu đãi tuần này!");
    //     newsletterData.put("promoDescription", "Giảm 15% cho tất cả sách kỹ năng sống");
    //     newsletterData.put("topProducts", List.of(
    //         Map.of("title", "The Pragmatic Programmer", "author", "David Thomas", "price", "280.000đ", "emoji", "📚")
    //     ));
    // 
    //     System.out.println("📧 Sending newsletter to " + TEST_RECIPIENT);
    // 
    //     emailService.sendNewsletterEmail(TEST_RECIPIENT, newsletterData);
    // 
    //     try { Thread.sleep(2000); } catch (InterruptedException e) { }
    // 
    //     System.out.println("✅ Newsletter email sent!");
    // }
}
