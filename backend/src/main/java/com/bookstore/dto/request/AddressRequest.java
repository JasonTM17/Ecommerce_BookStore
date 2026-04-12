package com.bookstore.dto.request;

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
public class AddressRequest {

    @NotBlank(message = "Tên người nhận không được để trống")
    @Size(max = 200, message = "Tên người nhận không được vượt quá 200 ký tự")
    private String receiverName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Size(min = 10, max = 20, message = "Số điện thoại phải từ 10 đến 20 ký tự")
    private String phoneNumber;

    @NotBlank(message = "Tỉnh/Thành phố không được để trống")
    @Size(max = 100, message = "Tỉnh/Thành phố không được vượt quá 100 ký tự")
    private String province;

    @NotBlank(message = "Quận/Huyện không được để trống")
    @Size(max = 100, message = "Quận/Huyện không được vượt quá 100 ký tự")
    private String district;

    @NotBlank(message = "Phường/Xã không được để trống")
    @Size(max = 100, message = "Phường/Xã không được vượt quá 100 ký tự")
    private String ward;

    @NotBlank(message = "Địa chỉ cụ thể không được để trống")
    private String streetAddress;

    private String postalCode;

    private Boolean isDefault;

    @Size(max = 50, message = "Loại địa chỉ không được vượt quá 50 ký tự")
    private String addressType;
}
