package com.bookstore.integration;

import com.bookstore.service.EmailService;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Integration tests for email functionality.
 * Real-email paths only run when SMTP credentials are explicitly configured.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("integration-test")
@TestPropertySource(properties = {
        "app.email.test-endpoint-enabled=true"
})
class EmailIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private EmailService emailService;

    @Value("${app.email.test-endpoint-enabled:false}")
    private boolean testEndpointEnabled;

    @Value("${app.email.integration-test-enabled:false}")
    private boolean integrationTestEnabled;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    private String baseUrl;
    private String allowedRecipients;

    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port + "/api";
        allowedRecipients = System.getenv("TEST_EMAIL_RECIPIENT");
        if (!StringUtils.hasText(allowedRecipients)) {
            allowedRecipients = "test@example.com";
        }
    }

    private boolean hasRealMailCredentials() {
        return StringUtils.hasText(mailUsername) && StringUtils.hasText(mailPassword);
    }

    private void assumeRealEmailIntegrationConfigured() {
        Assumptions.assumeTrue(
                integrationTestEnabled && hasRealMailCredentials(),
                "Real email integration is disabled or missing mail credentials."
        );
    }

    @Test
    @DisplayName("Email health check endpoint should return status")
    void emailHealthCheck() {
        String url = baseUrl + "/email/health";

        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

        if (testEndpointEnabled) {
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertTrue(response.getBody().contains("testEndpointEnabled"));
        }
    }

    @Test
    @DisplayName("Should send welcome email via API when SMTP is configured")
    void sendWelcomeEmail() {
        if (!testEndpointEnabled) {
            assertTrue(true, "Test skipped - endpoint disabled");
            return;
        }

        assumeRealEmailIntegrationConfigured();

        String url = baseUrl + "/email/test/send";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> request = new HashMap<>();
        request.put("to", allowedRecipients);
        request.put("type", "welcome");
        request.put("firstName", "Integration Test");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    @DisplayName("Should send all email types when SMTP is configured")
    void sendAllEmailTypes() {
        if (!testEndpointEnabled) {
            assertTrue(true, "Test skipped - endpoint disabled");
            return;
        }

        assumeRealEmailIntegrationConfigured();

        String url = baseUrl + "/email/test/send-all?to=" + allowedRecipients;
        HttpEntity<String> entity = new HttpEntity<>(new HttpHeaders());

        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
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
    @DisplayName("EmailService should send welcome email directly when SMTP is configured")
    void emailServiceSendWelcomeEmail() {
        assumeRealEmailIntegrationConfigured();

        assertDoesNotThrow(() -> emailService.sendWelcomeEmail(allowedRecipients, "Integration Test User"));
    }

    @Test
    @DisplayName("EmailService should handle invalid email gracefully")
    void emailServiceHandlesInvalidEmail() {
        assertDoesNotThrow(() -> emailService.sendWelcomeEmail("invalid-email", "Test User"));
    }

    @Test
    @DisplayName("EmailService should send order confirmation when SMTP is configured")
    void emailServiceSendOrderConfirmation() {
        assumeRealEmailIntegrationConfigured();

        Map<String, Object> orderData = new HashMap<>();
        orderData.put("customerName", "Test Customer");
        orderData.put("orderNumber", "BK-TEST-" + System.currentTimeMillis());
        orderData.put("totalAmount", "500.000d");
        orderData.put("orderItems", java.util.List.of(
                Map.of("productName", "Test Book", "quantity", 1, "totalPrice", "500.000d")
        ));

        assertDoesNotThrow(() -> emailService.sendOrderConfirmationEmail(allowedRecipients, orderData));
    }

    @Test
    @DisplayName("EmailService should send password reset email when SMTP is configured")
    void emailServiceSendPasswordReset() {
        assumeRealEmailIntegrationConfigured();

        assertDoesNotThrow(() -> emailService.sendPasswordResetEmail(
                allowedRecipients,
                "test-reset-token-" + System.currentTimeMillis()
        ));
    }
}
