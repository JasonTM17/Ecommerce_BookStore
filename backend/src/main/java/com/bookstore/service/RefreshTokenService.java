package com.bookstore.service;

import com.bookstore.entity.RefreshToken;
import com.bookstore.entity.User;
import com.bookstore.exception.BadRequestException;
import com.bookstore.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpirationMs;

    private static final int MAX_TOKENS_PER_USER = 5;

    @Transactional
    public RefreshToken createRefreshToken(User user, String deviceInfo, String ipAddress) {
        String tokenValue = generateToken();

        RefreshToken refreshToken = RefreshToken.builder()
                .token(tokenValue)
                .user(user)
                .expiryDate(calculateExpiryDate())
                .deviceInfo(deviceInfo)
                .ipAddress(ipAddress)
                .isRevoked(false)
                .build();

        long tokenCount = refreshTokenRepository.countByUser(user);
        if (tokenCount >= MAX_TOKENS_PER_USER) {
            cleanupOldestToken(user);
        }

        return refreshTokenRepository.save(refreshToken);
    }

    @Transactional(readOnly = true)
    public RefreshToken verifyToken(String token) {
        return refreshTokenRepository.findValidToken(token, LocalDateTime.now())
                .orElseThrow(() -> new BadRequestException("Refresh token không hợp lệ hoặc đã hết hạn"));
    }

    @Transactional
    public RefreshToken rotateToken(String oldToken, String deviceInfo, String ipAddress) {
        RefreshToken oldRefreshToken = verifyToken(oldToken);

        User user = oldRefreshToken.getUser();
        oldRefreshToken.revoke();
        refreshTokenRepository.save(oldRefreshToken);

        return createRefreshToken(user, deviceInfo, ipAddress);
    }

    @Transactional
    public void revokeToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Token không tồn tại"));
        refreshToken.revoke();
        refreshTokenRepository.save(refreshToken);
        log.info("Revoked refresh token for user: {}", refreshToken.getUser().getEmail());
    }

    @Transactional
    public void revokeAllUserTokens(User user) {
        refreshTokenRepository.revokeAllUserTokens(user);
        log.info("Revoked all refresh tokens for user: {}", user.getEmail());
    }

    @Transactional
    public void cleanupExpiredTokens() {
        refreshTokenRepository.deleteExpiredTokens(LocalDateTime.now());
        log.info("Cleaned up expired refresh tokens");
    }

    @Transactional
    public int cleanupOldestToken(User user) {
        var tokens = refreshTokenRepository.findAll().stream()
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .sorted((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
                .toList();

        if (!tokens.isEmpty()) {
            RefreshToken oldest = tokens.get(0);
            refreshTokenRepository.delete(oldest);
            log.info("Cleaned up oldest refresh token for user: {}", user.getEmail());
            return 1;
        }
        return 0;
    }

    private String generateToken() {
        return UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
    }

    private LocalDateTime calculateExpiryDate() {
        return LocalDateTime.now().plusSeconds(refreshExpirationMs / 1000);
    }
}
