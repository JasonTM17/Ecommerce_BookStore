package com.bookstore.dto.response;

import com.bookstore.entity.ReadingStatus;
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
public class ReadingProgressResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productAuthor;
    private String productImage;
    private ReadingStatus status;
    private Integer currentPage;
    private Integer totalPages;
    private Integer progressPercent;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private Integer rating;
    private String review;
    private LocalDateTime createdAt;
}
