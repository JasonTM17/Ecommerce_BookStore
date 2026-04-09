package com.bookstore.service;

import com.bookstore.entity.RefreshToken;
import com.bookstore.entity.Role;
import com.bookstore.entity.User;
import com.bookstore.exception.BadRequestException;
import com.bookstore.repository.RefreshTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    private User testUser;
    private RefreshToken testRefreshToken;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(refreshTokenService, "refreshExpirationMs", 604800000L);

        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .firstName("Test")
                .lastName("User")
                .isActive(true)
                .roles(new HashSet<>(Set.of(Role.CUSTOMER)))
                .build();

        testRefreshToken = RefreshToken.builder()
                .id(1L)
                .token("validRefreshToken123")
                .user(testUser)
                .expiryDate(LocalDateTime.now().plusDays(7))
                .deviceInfo("Chrome Browser")
                .ipAddress("127.0.0.1")
                .isRevoked(false)
                .build();
    }

    @Test
    void createRefreshToken_Success() {
        when(refreshTokenRepository.countByUser(testUser)).thenReturn(0L);
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenReturn(testRefreshToken);

        RefreshToken result = refreshTokenService.createRefreshToken(testUser, "Chrome Browser", "127.0.0.1");

        assertNotNull(result);
        assertEquals(testUser, result.getUser());
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void createRefreshToken_MaxTokensExceeded_CleansUpOldest() {
        when(refreshTokenRepository.countByUser(testUser)).thenReturn(5L);
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenReturn(testRefreshToken);

        refreshTokenService.createRefreshToken(testUser, "Chrome Browser", "127.0.0.1");

        verify(refreshTokenRepository).delete(any(RefreshToken.class));
    }

    @Test
    void verifyToken_ValidToken() {
        when(refreshTokenRepository.findValidToken("validRefreshToken123", any(LocalDateTime.class)))
                .thenReturn(Optional.of(testRefreshToken));

        RefreshToken result = refreshTokenService.verifyToken("validRefreshToken123");

        assertNotNull(result);
        assertEquals("validRefreshToken123", result.getToken());
    }

    @Test
    void verifyToken_InvalidToken_ThrowsException() {
        when(refreshTokenRepository.findValidToken("invalidToken", any(LocalDateTime.class)))
                .thenReturn(Optional.empty());

        assertThrows(BadRequestException.class, () ->
                refreshTokenService.verifyToken("invalidToken"));
    }

    @Test
    void rotateToken_Success() {
        RefreshToken newToken = RefreshToken.builder()
                .id(2L)
                .token("newRefreshToken456")
                .user(testUser)
                .expiryDate(LocalDateTime.now().plusDays(7))
                .deviceInfo("Firefox Browser")
                .ipAddress("192.168.1.1")
                .isRevoked(false)
                .build();

        when(refreshTokenRepository.findValidToken("validRefreshToken123", any(LocalDateTime.class)))
                .thenReturn(Optional.of(testRefreshToken));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenReturn(newToken);
        when(refreshTokenRepository.countByUser(testUser)).thenReturn(1L);

        RefreshToken result = refreshTokenService.rotateToken("validRefreshToken123", "Firefox Browser", "192.168.1.1");

        assertNotNull(result);
        verify(refreshTokenRepository, times(2)).save(any(RefreshToken.class));
    }

    @Test
    void revokeToken_Success() {
        when(refreshTokenRepository.findByToken("validRefreshToken123"))
                .thenReturn(Optional.of(testRefreshToken));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenReturn(testRefreshToken);

        refreshTokenService.revokeToken("validRefreshToken123");

        verify(refreshTokenRepository).save(any(RefreshToken.class));
        assertTrue(testRefreshToken.getIsRevoked());
    }

    @Test
    void revokeToken_NotFound_ThrowsException() {
        when(refreshTokenRepository.findByToken("invalidToken"))
                .thenReturn(Optional.empty());

        assertThrows(BadRequestException.class, () ->
                refreshTokenService.revokeToken("invalidToken"));
    }

    @Test
    void revokeAllUserTokens_Success() {
        doNothing().when(refreshTokenRepository).revokeAllUserTokens(testUser);

        refreshTokenService.revokeAllUserTokens(testUser);

        verify(refreshTokenRepository).revokeAllUserTokens(testUser);
    }

    @Test
    void cleanupExpiredTokens_Success() {
        doNothing().when(refreshTokenRepository).deleteExpiredTokens(any(LocalDateTime.class));

        refreshTokenService.cleanupExpiredTokens();

        verify(refreshTokenRepository).deleteExpiredTokens(any(LocalDateTime.class));
    }

    @Test
    void cleanupOldestToken_WithTokens() {
        RefreshToken oldToken = RefreshToken.builder()
                .id(2L)
                .token("oldToken")
                .user(testUser)
                .expiryDate(LocalDateTime.now().plusDays(7))
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();

        RefreshToken newToken = RefreshToken.builder()
                .id(3L)
                .token("newToken")
                .user(testUser)
                .expiryDate(LocalDateTime.now().plusDays(7))
                .createdAt(LocalDateTime.now())
                .build();

        when(refreshTokenRepository.findAll()).thenReturn(java.util.List.of(oldToken, newToken));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenReturn(testRefreshToken);
        when(refreshTokenRepository.countByUser(testUser)).thenReturn(1L);

        int result = refreshTokenService.cleanupOldestToken(testUser);

        assertEquals(1, result);
        verify(refreshTokenRepository).delete(oldToken);
    }

    @Test
    void cleanupOldestToken_NoTokens() {
        when(refreshTokenRepository.findAll()).thenReturn(java.util.List.of());

        int result = refreshTokenService.cleanupOldestToken(testUser);

        assertEquals(0, result);
        verify(refreshTokenRepository, never()).delete(any(RefreshToken.class));
    }
}
