package com.bookstore.integration;

import com.bookstore.entity.Role;
import com.bookstore.entity.User;
import com.bookstore.repository.UserRepository;
import com.bookstore.security.JwtTokenProvider;
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
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

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

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

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
    private String adminToken;

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

    private HttpHeaders adminHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(adminToken());
        return headers;
    }

    private HttpHeaders adminJsonHeaders() {
        HttpHeaders headers = adminHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    private String adminToken() {
        if (adminToken == null) {
            User admin = userRepository.findByEmail("email-test-admin@bookstore.com")
                    .orElseGet(() -> userRepository.save(User.builder()
                            .email("email-test-admin@bookstore.com")
                            .password(passwordEncoder.encode("Admin123!"))
                            .firstName("Email")
                            .lastName("Admin")
                            .isActive(true)
                            .isEmailVerified(true)
                            .roles(Set.of(Role.ADMIN))
                            .build()));

            UserDetails userDetails = org.springframework.security.core.userdetails.User
                    .withUsername(admin.getEmail())
                    .password(admin.getPassword())
                    .roles("ADMIN")
                    .build();
            adminToken = jwtTokenProvider.generateToken(userDetails);
        }
        return adminToken;
    }

    @Test
    @DisplayName("Email health check endpoint should require admin auth")
    void emailHealthCheck() {
        String url = baseUrl + "/email/health";

        ResponseEntity<String> anonymousResponse = restTemplate.getForEntity(url, String.class);
        assertEquals(HttpStatus.UNAUTHORIZED, anonymousResponse.getStatusCode());

        if (testEndpointEnabled) {
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(adminHeaders()),
                    String.class
            );
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

        Map<String, Object> request = new HashMap<>();
        request.put("to", allowedRecipients);
        request.put("type", "welcome");
        request.put("firstName", "Integration Test");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, adminJsonHeaders());
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
        HttpEntity<String> entity = new HttpEntity<>(adminHeaders());

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

        Map<String, Object> request = new HashMap<>();
        request.put("to", allowedRecipients);
        request.put("type", "unknown-type");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, adminJsonHeaders());
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
