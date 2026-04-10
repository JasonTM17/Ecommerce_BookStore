package com.bookstore.support;

import com.bookstore.dto.request.LoginRequest;
import com.bookstore.dto.request.RegisterRequest;
import com.bookstore.entity.Category;
import com.bookstore.entity.RefreshToken;
import com.bookstore.entity.Role;
import com.bookstore.entity.User;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Shared test data builders so unit and slice tests stay consistent and readable.
 */
public final class TestFixtures {

    private TestFixtures() {
    }

    public static User customerUser() {
        return User.builder()
                .id(1L)
                .email("test@example.com")
                .password("encodedPassword")
                .firstName("Test")
                .lastName("User")
                .phoneNumber("0901234567")
                .isActive(true)
                .isEmailVerified(true)
                .roles(new HashSet<>(Set.of(Role.CUSTOMER)))
                .build();
    }

    public static RegisterRequest registerRequest() {
        return RegisterRequest.builder()
                .email("test@example.com")
                .password("Password123!")
                .firstName("Test")
                .lastName("User")
                .phoneNumber("0901234567")
                .build();
    }

    public static LoginRequest loginRequest() {
        return LoginRequest.builder()
                .email("test@example.com")
                .password("Password123!")
                .build();
    }

    public static RefreshToken refreshTokenFor(User user, String token) {
        return RefreshToken.builder()
                .id(1L)
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusDays(7))
                .deviceInfo("Web Browser")
                .ipAddress(null)
                .isRevoked(false)
                .build();
    }

    public static Category rootCategory(String name) {
        return Category.builder()
                .id(1L)
                .name(name)
                .description("Test category")
                .isActive(true)
                .displayOrder(0)
                .build();
    }
}
