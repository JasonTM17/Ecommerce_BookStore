package com.bookstore.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_tokens",
       indexes = {
           @Index(name = "idx_password_reset_token", columnList = "token", unique = true),
           @Index(name = "idx_password_reset_email", columnList = "email")
       })
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken {

    private static final int EXPIRATION_HOURS = 1;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 500)
    private String token;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;

    @Column(name = "is_used")
    @Builder.Default
    private Boolean isUsed = false;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }

    public boolean isValid() {
        return !isExpired() && !isUsed;
    }

    public static PasswordResetToken createToken(String email) {
        return PasswordResetToken.builder()
                .token(java.util.UUID.randomUUID().toString() + "-" + java.util.UUID.randomUUID().toString())
                .email(email)
                .expiryDate(LocalDateTime.now().plusHours(EXPIRATION_HOURS))
                .isUsed(false)
                .build();
    }
}
