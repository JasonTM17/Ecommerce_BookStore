package com.bookstore.service;

import com.bookstore.dto.request.ForgotPasswordRequest;
import com.bookstore.dto.request.ResetPasswordRequest;
import com.bookstore.entity.PasswordResetToken;
import com.bookstore.entity.User;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.PasswordResetTokenRepository;
import com.bookstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        User user = userRepository.findByEmail(email).orElse(null);

        if (user != null) {
            passwordResetTokenRepository.deleteByEmailOrExpired(email, LocalDateTime.now());

            PasswordResetToken resetToken = PasswordResetToken.createToken(email);
            passwordResetTokenRepository.save(resetToken);

            emailService.sendPasswordResetEmail(email, resetToken.getToken());

            log.info("Password reset requested for email: {}", email);
        }

    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken storedToken = passwordResetTokenRepository
                .findValidToken(request.getToken(), LocalDateTime.now())
                .orElseThrow(() -> new BadRequestException("Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn"));

        User user = userRepository.findByEmail(storedToken.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", storedToken.getEmail()));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        storedToken.setIsUsed(true);
        passwordResetTokenRepository.save(storedToken);

        log.info("Password reset completed for email: {}", storedToken.getEmail());
    }

    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void cleanupExpiredTokens() {
        passwordResetTokenRepository.deleteExpiredTokens(LocalDateTime.now());
        log.debug("Cleaned up expired password reset tokens");
    }
}
