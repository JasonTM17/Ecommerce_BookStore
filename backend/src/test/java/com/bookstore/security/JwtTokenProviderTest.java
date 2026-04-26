package com.bookstore.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("JwtTokenProvider")
class JwtTokenProviderTest {

    @Test
    void rejectsMissingSecretPlaceholder() {
        JwtTokenProvider provider = providerWithSecret("${JWT_SECRET}");

        assertThatThrownBy(provider::validateConfiguration)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("real secret value");
    }

    @Test
    void rejectsShortSecret() {
        JwtTokenProvider provider = providerWithSecret("too-short");

        assertThatThrownBy(provider::validateConfiguration)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("at least 32 bytes");
    }

    @Test
    void rejectsKnownPublicPlaceholderSecret() {
        JwtTokenProvider provider = providerWithSecret(
                "YourSuperSecretKeyForJWTTokenGenerationThatShouldBeAtLeast256BitsLong!");

        assertThatThrownBy(provider::validateConfiguration)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("public placeholder");
    }

    @Test
    void acceptsStrongSecret() {
        JwtTokenProvider provider = providerWithSecret("StrongJwtSecretForTestsWithAtLeast32Bytes");

        assertThatCode(provider::validateConfiguration).doesNotThrowAnyException();
    }

    private JwtTokenProvider providerWithSecret(String secret) {
        JwtTokenProvider provider = new JwtTokenProvider();
        ReflectionTestUtils.setField(provider, "jwtSecret", secret);
        return provider;
    }
}
