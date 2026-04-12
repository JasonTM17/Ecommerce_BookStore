package com.bookstore.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {

    private Long id;
    private UserResponse user;
    private Long productId;
    private Integer rating;
    private String comment;
    private Boolean isVerifiedPurchase;
    private Integer helpfulCount;
    private Integer sortOrder;
    private LocalDateTime createdAt;
}
