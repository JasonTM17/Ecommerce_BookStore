package com.bookstore.integration;

import com.bookstore.service.EmailService;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.util.StringUtils;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Real SMTP integration smoke.
 * This lane is intentionally skipped unless credentials are explicitly configured.
 */
@SpringBootTest
@ActiveProfiles("integration-test")
@TestPropertySource(properties = {
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

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    private boolean realSmtpConfigured() {
        return integrationTestEnabled
                && StringUtils.hasText(mailUsername)
                && StringUtils.hasText(mailPassword);
    }

    @Test
    @DisplayName("Should skip real SMTP lane unless credentials are configured")
    void skipIfDisabled() {
        Assumptions.assumeTrue(
                realSmtpConfigured(),
                "Real SMTP integration is disabled or missing credentials."
        );
        assertThat(emailService).isNotNull();
    }
}
