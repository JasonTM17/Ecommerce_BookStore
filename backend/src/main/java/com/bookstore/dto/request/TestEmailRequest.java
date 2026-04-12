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
public class TestEmailRequest {

    @NotBlank(message = "Email người nhận không được để trống")
    @Email(message = "Email không hợp lệ")
    private String to;

    @NotBlank(message = "Loại email không được để trống")
    @Size(max = 50, message = "Loại email không được vượt quá 50 ký tự")
    private String type;

    private String firstName;

    private String orderNumber;

    private String resetToken;
}
