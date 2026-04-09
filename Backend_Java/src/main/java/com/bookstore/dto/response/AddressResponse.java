package com.bookstore.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressResponse {

    private Long id;
    private String receiverName;
    private String phoneNumber;
    private String province;
    private String district;
    private String ward;
    private String streetAddress;
    private String fullAddress;
    private String postalCode;
    private Boolean isDefault;
    private String addressType;
}
