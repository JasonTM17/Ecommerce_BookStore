package com.bookstore.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {

    @Size(max = 100, message = "Họ không được vượt quá 100 ký tự")
    private String firstName;

    @Size(max = 100, message = "Tên không được vượt quá 100 ký tự")
    private String lastName;

    @Email(message = "Email không hợp lệ")
    private String email;

    @Size(min = 10, max = 20, message = "Số điện thoại phải từ 10 đến 20 ký tự")
    private String phoneNumber;

    private String avatarUrl;

    private java.time.LocalDate dateOfBirth;
}
