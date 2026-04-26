package com.bookstore.config;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class SecurityConfigTest {

    @Test
    void parseAllowedOriginPatterns_trimsAndDropsBlankValues() {
        assertEquals(
                List.of("https://bookstore-web-dr1k.onrender.com", "http://localhost:3000"),
                SecurityConfig.parseAllowedOriginPatterns(" https://bookstore-web-dr1k.onrender.com, , http://localhost:3000 ")
        );
    }

    @Test
    void parseAllowedOriginPatterns_rejectsEmptyValues() {
        assertThrows(
                IllegalStateException.class,
                () -> SecurityConfig.parseAllowedOriginPatterns(" , ")
        );
    }

    @Test
    void parseAllowedOriginPatterns_rejectsUnsafeValues() {
        assertThrows(
                IllegalStateException.class,
                () -> SecurityConfig.parseAllowedOriginPatterns("${CORS_ORIGINS}")
        );
        assertThrows(
                IllegalStateException.class,
                () -> SecurityConfig.parseAllowedOriginPatterns("*")
        );
    }
}
