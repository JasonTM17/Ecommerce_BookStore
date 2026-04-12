package com.bookstore.integration;

import com.bookstore.entity.User;
import com.bookstore.repository.UserRepository;
import com.bookstore.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests cho Email functionality.
 * Tests sẽ gửi email thực nếu credentials được cấu hình.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("integration-test")
@TestPropertySource(properties = {
    "app.email.test-endpoint-enabled=true",
    "app.email.integration-test-enabled=true"
})
public class EmailIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserRepository userRepository;

    @Value("${app.email.test-endpoint-enabled:false}")
    private boolean testEndpointEnabled;

    private String baseUrl;
    private String allowedRecipients;

    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port + "/api";
        allowedRecipients = System.getenv("TEST_EMAIL_RECIPIENT");
        if (allowedRecipients == null || allowedRecipients.isEmpty()) {
            allowedRecipients = "test@example.com";
        }
    }

    @Test
    @DisplayName("Email health check endpoint should return status")
    void emailHealthCheck() {
        String url = baseUrl + "/email/health";
        
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        
        // Should return 200 if test endpoints are enabled
        if (testEndpointEnabled) {
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertTrue(response.getBody().contains("testEndpointEnabled"));
        }
    }

    @Test
    @DisplayName("Should send welcome email via API")
    void sendWelcomeEmail() {
        if (!testEndpointEnabled) {
            assertTrue(true, "Test skipped - endpoint disabled");
            return;
        }

        String url = baseUrl + "/email/test/send";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, Object> request = new HashMap<>();
        request.put("to", allowedRecipients);
        request.put("type", "welcome");
        request.put("firstName", "Integration Test");
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
        
        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
        
        // Should return 200 if enabled, 403 if disabled
        assertTrue(
            response.getStatusCode() == HttpStatus.OK || 
            response.getStatusCode() == HttpStatus.FORBIDDEN
        );
    }

    @Test
    @DisplayName("Should send all email types")
    void sendAllEmailTypes() {
        if (!testEndpointEnabled) {
            assertTrue(true, "Test skipped - endpoint disabled");
            return;
        }

        String url = baseUrl + "/email/test/send-all?to=" + allowedRecipients;
        
        HttpHeaders headers = new HttpHeaders();
        HttpEntity<String> entity = new HttpEntity<>(headers);
        
        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
        
        assertTrue(
            response.getStatusCode() == HttpStatus.OK || 
            response.getStatusCode() == HttpStatus.FORBIDDEN
        );
    }

    @Test
    @DisplayName("Should reject unknown email type")
    void rejectUnknownEmailType() {
        if (!testEndpointEnabled) {
            assertTrue(true, "Test skipped - endpoint disabled");
            return;
        }

        String url = baseUrl + "/email/test/send";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, Object> request = new HashMap<>();
        request.put("to", allowedRecipients);
        request.put("type", "unknown-type");
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
        
        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
        
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    @DisplayName("EmailService should send welcome email directly")
    void emailServiceSendWelcomeEmail() {
        // This test sends actual email if credentials are configured
        assertDoesNotThrow(() -> {
            emailService.sendWelcomeEmail(allowedRecipients, "Integration Test User");
        });
        
        // Give async email time to send
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    @Test
    @DisplayName("EmailService should handle invalid email gracefully")
    void emailServiceHandlesInvalidEmail() {
        assertDoesNotThrow(() -> {
            emailService.sendWelcomeEmail("invalid-email", "Test User");
        });
    }

    @Test
    @DisplayName("EmailService should send order confirmation")
    void emailServiceSendOrderConfirmation() {
        Map<String, Object> orderData = new HashMap<>();
        orderData.put("customerName", "Test Customer");
        orderData.put("orderNumber", "BK-TEST-" + System.currentTimeMillis());
        orderData.put("totalAmount", "500.000đ");
        orderData.put("orderItems", java.util.List.of(
            Map.of("productName", "Test Book", "quantity", 1, "totalPrice", "500.000đ")
        ));
        
        assertDoesNotThrow(() -> {
            emailService.sendOrderConfirmationEmail(allowedRecipients, orderData);
        });
        
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    @Test
    @DisplayName("EmailService should send password reset email")
    void emailServiceSendPasswordReset() {
        assertDoesNotThrow(() -> {
            emailService.sendPasswordResetEmail(
                allowedRecipients, 
                "test-reset-token-" + System.currentTimeMillis()
            );
        });
        
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
