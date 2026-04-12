package com.bookstore.dto.response;

import com.bookstore.entity.CouponType;
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
public class CouponResponse {

    private Long id;
    private String code;
    private String description;
    private CouponType type;
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer usageLimit;
    private Integer usedCount;
    private Integer perUserLimit;
    private Boolean isActive;
    private Boolean isPublic;
    private Boolean isValid;
    private Boolean isExpired;
    private String discountDisplay;
    private Integer sortOrder;
    private LocalDateTime createdAt;
}
