package com.bookstore.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaymentResponse {

    private boolean success;
    private String message;
    private Long orderId;
    private String transactionId;
    private String paymentUrl;
    private String orderNumber;
    private String paymentStatus;
    private BigDecimal amount;
    private LocalDateTime expiresAt;
}
