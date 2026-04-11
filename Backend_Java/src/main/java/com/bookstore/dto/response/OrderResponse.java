package com.bookstore.dto.response;

import com.bookstore.entity.OrderStatus;
import com.bookstore.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private Long id;
    private String orderNumber;
    private UserResponse user;
    private OrderStatus orderStatus;
    private String orderStatusDisplayName;
    private PaymentStatus paymentStatus;
    private String paymentStatusDisplayName;
    private List<OrderItemResponse> orderItems;
    private String shippingAddress;
    private String shippingPhone;
    private String shippingReceiverName;
    private String shippingMethod;
    private BigDecimal shippingFee;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String notes;
    private LocalDateTime estimatedDelivery;
    private LocalDateTime deliveredAt;
    private LocalDateTime cancelledAt;
    private String cancelReason;
    private Integer sortOrder;
    private LocalDateTime createdAt;
}
