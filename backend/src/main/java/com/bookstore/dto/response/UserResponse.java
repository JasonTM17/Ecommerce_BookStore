package com.bookstore.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String phoneNumber;
    private String avatarUrl;
    private Boolean isActive;
    private Boolean isEmailVerified;
    private java.util.Set<String> roles;
    private java.time.LocalDate dateOfBirth;
    private java.time.LocalDateTime createdAt;
}
