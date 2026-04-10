package com.bookstore.dto.request;

import jakarta.validation.constraints.*;
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
public class FlashSaleRequest {

    @NotNull(message = "ID sản phẩm không được để trống")
    private Long productId;

    @NotNull(message = "Giá gốc không được để trống")
    @Positive(message = "Giá gốc phải > 0")
    private BigDecimal originalPrice;

    @NotNull(message = "Giá sale không được để trống")
    @Positive(message = "Giá sale phải > 0")
    private BigDecimal salePrice;

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    private LocalDateTime startTime;

    @NotNull(message = "Thời gian kết thúc không được để trống")
    @Future(message = "Thời gian kết thúc phải trong tương lai")
    private LocalDateTime endTime;

    @NotNull(message = "Số lượng giới hạn không được để trống")
    @Positive(message = "Số lượng phải > 0")
    private Integer stockLimit;

    @Min(value = 1, message = "Mỗi user tối thiểu mua 1 sản phẩm")
    private Integer maxPerUser;
}
