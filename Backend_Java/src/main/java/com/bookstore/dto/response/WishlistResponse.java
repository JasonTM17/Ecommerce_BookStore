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
public class WishlistResponse {

    private Long id;
    private ProductInfo product;
    private String notes;
    private Integer priority;
    private Boolean isInStock;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductInfo {
        private Long id;
        private String name;
        private String author;
        private String imageUrl;
        private BigDecimal price;
        private BigDecimal currentPrice;
        private Double avgRating;
        private Integer reviewCount;
        private Integer stockQuantity;
        private Integer discountPercent;
        private Boolean isNew;
        private Boolean isBestseller;
    }
}
