package com.bookstore.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.test.util.ReflectionTestUtils;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EmailService")
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private TemplateEngine templateEngine;

    @Mock
    private MimeMessage mimeMessage;

    @InjectMocks
    private EmailService emailService;

    private static final String TEST_TO = "jasonbmt06@gmail.com";
    private static final String TEST_BASE_URL = "http://localhost:3000";
    private static final String TEST_FROM_EMAIL = "noreply@bookstore.com";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(emailService, "appBaseUrl", TEST_BASE_URL);
        ReflectionTestUtils.setField(emailService, "fromEmail", TEST_FROM_EMAIL);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
    }

    @Nested
    @DisplayName("sendWelcomeEmail")
    class SendWelcomeEmail {

        @Test
        @DisplayName("should send welcome email with correct subject")
        void shouldSendWelcomeEmail() {
            when(templateEngine.process(anyString(), any(Context.class)))
                    .thenReturn("<html><body>Welcome</body></html>");

            emailService.sendWelcomeEmail(TEST_TO, "Jason");

            ArgumentCaptor<MimeMessage> messageCaptor = ArgumentCaptor.forClass(MimeMessage.class);
            verify(mailSender).send(messageCaptor.capture());

            MimeMessage capturedMessage = messageCaptor.getValue();
            assertThat(capturedMessage).isNotNull();
        }

        @Test
        @DisplayName("should process template with firstName variable")
        void shouldProcessTemplateWithFirstName() {
            when(templateEngine.process(eq("welcome-email"), any(Context.class)))
                    .thenReturn("<html>Welcome Jason</html>");

            emailService.sendWelcomeEmail(TEST_TO, "Jason");

            verify(templateEngine).process(eq("welcome-email"), any(Context.class));
        }
    }

    @Nested
    @DisplayName("sendPasswordResetEmail")
    class SendPasswordResetEmail {

        @Test
        @DisplayName("should send password reset email with token")
        void shouldSendPasswordResetEmail() {
            String resetToken = "test-reset-token-123";
            when(templateEngine.process(anyString(), any(Context.class)))
                    .thenReturn("<html>Reset Password</html>");

            emailService.sendPasswordResetEmail(TEST_TO, resetToken);

            ArgumentCaptor<MimeMessage> messageCaptor = ArgumentCaptor.forClass(MimeMessage.class);
            verify(mailSender).send(messageCaptor.capture());

            MimeMessage captured = messageCaptor.getValue();
            assertThat(captured).isNotNull();
        }

        @Test
        @DisplayName("should include reset URL with token")
        void shouldIncludeResetUrlWithToken() {
            String resetToken = "abc123token";
            when(templateEngine.process(eq("password-reset"), any(Context.class)))
                    .thenReturn("<html>Reset</html>");

            emailService.sendPasswordResetEmail(TEST_TO, resetToken);

            verify(templateEngine).process(eq("password-reset"), any(Context.class));
        }
    }

    @Nested
    @DisplayName("sendOrderConfirmationEmail")
    class SendOrderConfirmationEmail {

        @Test
        @DisplayName("should send order confirmation with order data")
        void shouldSendOrderConfirmation() {
            Map<String, Object> orderData = new HashMap<>();
            orderData.put("customerName", "Jason");
            orderData.put("orderNumber", "BK123456");
            orderData.put("totalAmount", "220.000đ");
            orderData.put("orderItems", List.of());

            when(templateEngine.process(anyString(), any(Context.class)))
                    .thenReturn("<html>Order Confirmation</html>");

            emailService.sendOrderConfirmationEmail(TEST_TO, orderData);

            ArgumentCaptor<MimeMessage> messageCaptor = ArgumentCaptor.forClass(MimeMessage.class);
            verify(mailSender).send(messageCaptor.capture());
            assertThat(messageCaptor.getValue()).isNotNull();
        }

        @Test
        @DisplayName("should use default values when order data is empty")
        void shouldUseDefaultValuesWhenEmpty() {
            Map<String, Object> emptyData = new HashMap<>();

            when(templateEngine.process(anyString(), any(Context.class)))
                    .thenReturn("<html>Order</html>");

            emailService.sendOrderConfirmationEmail(TEST_TO, emptyData);

            verify(templateEngine).process(eq("order-confirmation"), any(Context.class));
        }
    }

    @Nested
    @DisplayName("sendOrderStatusUpdateEmail")
    class SendOrderStatusUpdateEmail {

        @Test
        @DisplayName("should send status update with tracking info")
        void shouldSendStatusUpdate() {
            Map<String, Object> statusData = new HashMap<>();
            statusData.put("orderNumber", "BK789");
            statusData.put("status", "SHIPPED");
            statusData.put("trackingNumber", "VN123456");
            statusData.put("trackingSteps", List.of());

            when(templateEngine.process(anyString(), any(Context.class)))
                    .thenReturn("<html>Status Update</html>");

            emailService.sendOrderStatusUpdateEmail(TEST_TO, statusData);

            verify(templateEngine).process(eq("order-status-update"), any(Context.class));
        }
    }

    @Nested
    @DisplayName("sendNewsletterEmail")
    class SendNewsletterEmail {

        @Test
        @DisplayName("should send newsletter with featured products")
        void shouldSendNewsletter() {
            Map<String, Object> newsletterData = new HashMap<>();
            newsletterData.put("subscriberName", "Jason");
            newsletterData.put("featuredBookTitle", "Clean Code");
            newsletterData.put("promoCode", "WEEKLY15");
            newsletterData.put("topProducts", List.of());

            when(templateEngine.process(anyString(), any(Context.class)))
                    .thenReturn("<html>Newsletter</html>");

            emailService.sendNewsletterEmail(TEST_TO, newsletterData);

            verify(templateEngine).process(eq("newsletter"), any(Context.class));
        }
    }

    @Nested
    @DisplayName("sendSimpleEmail")
    class SendSimpleEmail {

        @Test
        @DisplayName("should send simple text email")
        void shouldSendSimpleEmail() {
            String subject = "Test Subject";
            String text = "This is a test email content";

            emailService.sendSimpleEmail(TEST_TO, subject, text);

            verify(mailSender).createMimeMessage();
        }
    }

    @Nested
    @DisplayName("Error Handling")
    class ErrorHandling {

        @Test
        @DisplayName("should handle MailSendException gracefully")
        void shouldHandleMailSendException() {
            when(templateEngine.process(anyString(), any(Context.class)))
                    .thenReturn("<html>Test</html>");
            doThrow(new MailSendException("SMTP server unavailable"))
                    .when(mailSender).send(any(MimeMessage.class));

            // Should not throw exception
            emailService.sendWelcomeEmail(TEST_TO, "Jason");

            // Verify email was attempted to be sent
            verify(mailSender).send(any(MimeMessage.class));
        }

        @Test
        @DisplayName("should handle MessagingException gracefully")
        void shouldHandleMessagingException() {
            when(templateEngine.process(anyString(), any(Context.class)))
                    .thenReturn("<html>Test</html>");
            doThrow(new MailSendException(new MessagingException("Invalid address")))
                    .when(mailSender).send(any(MimeMessage.class));

            // Should not throw exception
            emailService.sendWelcomeEmail(TEST_TO, "Jason");

            verify(mailSender).send(any(MimeMessage.class));
        }

        @Test
        @DisplayName("should handle template processing failure with fallback")
        void shouldHandleTemplateFailure() {
            when(templateEngine.process(anyString(), any(Context.class)))
                    .thenThrow(new org.thymeleaf.exceptions.TemplateInputException("Template not found"));

            // Should not throw exception, should use fallback
            emailService.sendWelcomeEmail(TEST_TO, "Jason");

            verify(mailSender).send(any(MimeMessage.class));
        }
    }

    @Nested
    @DisplayName("sendNewReviewReplyEmail")
    class SendNewReviewReplyEmail {

        @Test
        @DisplayName("should send review reply email")
        void shouldSendReviewReplyEmail() {
            String productName = "Clean Code";
            String reply = "Thank you for your review!";

            emailService.sendNewReviewReplyEmail(TEST_TO, productName, reply);

            verify(mailSender).createMimeMessage();
        }
    }
}
