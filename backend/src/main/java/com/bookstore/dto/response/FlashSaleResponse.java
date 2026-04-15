package com.bookstore.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FlashSaleResponse {

    private Long id;
    private ProductInfo product;
    private BigDecimal originalPrice;
    private BigDecimal salePrice;
    private BigDecimal discountPercent;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private Integer stockLimit;
    private Integer soldCount;
    private Integer remainingStock;
    private Boolean isActive;
    private Boolean isCurrentlyActive;
    private Boolean isUpcoming;
    private Integer maxPerUser;
    private OffsetDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductInfo {
        private Long id;
        private String name;
        private String author;
        private String imageUrl;
    }
}
