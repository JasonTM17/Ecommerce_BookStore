package com.bookstore.integration;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

/**
 * Base for full-stack tests: H2 from {@code application-test.properties}, no prod seeding ({@code @Profile("!test")}).
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public abstract class AbstractIntegrationTest {
}
