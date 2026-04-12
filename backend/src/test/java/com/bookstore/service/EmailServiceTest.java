package com.bookstore.service;

import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;
import org.thymeleaf.TemplateEngine;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
        ReflectionTestUtils.setField(emailService, "senderName", "BookStore Team");
        lenient().when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
    }

    @Nested
    @DisplayName("HTML email senders")
    class HtmlEmailSenders {

        @Test
        @DisplayName("sendWelcomeEmail sends an HTML email")
        void sendWelcomeEmail_sendsHtmlEmail() {
            emailService.sendWelcomeEmail(TEST_TO, "Jason");
            verify(mailSender).send(any(MimeMessage.class));
        }

        @Test
        @DisplayName("sendPasswordResetEmail sends an HTML email")
        void sendPasswordResetEmail_sendsHtmlEmail() {
            emailService.sendPasswordResetEmail(TEST_TO, "abc123token");
            verify(mailSender).send(any(MimeMessage.class));
        }

        @Test
        @DisplayName("sendOrderConfirmationEmail sends an HTML email")
        void sendOrderConfirmationEmail_sendsHtmlEmail() {
            Map<String, Object> orderData = new HashMap<>();
            orderData.put("customerName", "Jason");
            orderData.put("orderNumber", "BK123456");
            orderData.put("totalAmount", "220.000d");
            orderData.put("orderItems", List.of());

            emailService.sendOrderConfirmationEmail(TEST_TO, orderData);

            verify(mailSender).send(any(MimeMessage.class));
        }

        @Test
        @DisplayName("sendOrderStatusUpdateEmail sends an HTML email")
        void sendOrderStatusUpdateEmail_sendsHtmlEmail() {
            Map<String, Object> statusData = new HashMap<>();
            statusData.put("orderNumber", "BK789");
            statusData.put("status", "SHIPPED");
            statusData.put("trackingNumber", "VN123456");
            statusData.put("trackingSteps", List.of());

            emailService.sendOrderStatusUpdateEmail(TEST_TO, statusData);

            verify(mailSender).send(any(MimeMessage.class));
        }

        @Test
        @DisplayName("sendNewsletterEmail sends an HTML email")
        void sendNewsletterEmail_sendsHtmlEmail() {
            Map<String, Object> newsletterData = new HashMap<>();
            newsletterData.put("subscriberName", "Jason");
            newsletterData.put("featuredBookTitle", "Clean Code");
            newsletterData.put("promoCode", "WEEKLY15");
            newsletterData.put("topProducts", List.of());

            emailService.sendNewsletterEmail(TEST_TO, newsletterData);

            verify(mailSender).send(any(MimeMessage.class));
        }
    }

    @Nested
    @DisplayName("Simple email senders")
    class SimpleEmailSenders {

        @Test
        @DisplayName("sendSimpleEmail sends a simple text email")
        void sendSimpleEmail_sendsSimpleMail() {
            emailService.sendSimpleEmail(TEST_TO, "Test Subject", "This is a test email content");
            verify(mailSender).send(any(SimpleMailMessage.class));
        }

        @Test
        @DisplayName("sendNewReviewReplyEmail sends a simple text email")
        void sendNewReviewReplyEmail_sendsSimpleMail() {
            emailService.sendNewReviewReplyEmail(TEST_TO, "Clean Code", "Thank you for your review!");
            verify(mailSender).send(any(SimpleMailMessage.class));
        }
    }

    @Nested
    @DisplayName("Error handling")
    class ErrorHandling {

        @Test
        @DisplayName("welcome email swallows MailSendException")
        void sendWelcomeEmail_handlesMailSendException() {
            doThrow(new MailSendException("SMTP server unavailable"))
                    .when(mailSender).send(any(MimeMessage.class));

            assertDoesNotThrow(() -> emailService.sendWelcomeEmail(TEST_TO, "Jason"));
            verify(mailSender).send(any(MimeMessage.class));
        }

        @Test
        @DisplayName("simple email swallows MailSendException")
        void sendSimpleEmail_handlesMailSendException() {
            doThrow(new MailSendException("SMTP server unavailable"))
                    .when(mailSender).send(any(SimpleMailMessage.class));

            assertDoesNotThrow(() -> emailService.sendSimpleEmail(TEST_TO, "Subject", "Body"));
            verify(mailSender).send(any(SimpleMailMessage.class));
        }
    }
}
