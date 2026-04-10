package com.bookstore.dto.request;

import com.bookstore.entity.CouponType;
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
public class CouponRequest {

    @NotBlank(message = "Mã coupon không được để trống")
    @Size(min = 3, max = 50, message = "Mã coupon phải từ 3 đến 50 ký tự")
    @Pattern(regexp = "^[A-Z0-9_-]+$", message = "Mã coupon chỉ chứa chữ hoa, số, gạch dưới và gạch ngang")
    private String code;

    @Size(max = 255, message = "Mô tả không quá 255 ký tự")
    private String description;

    @NotNull(message = "Loại coupon không được để trống")
    private CouponType type;

    @NotNull(message = "Giá trị giảm giá không được để trống")
    @Positive(message = "Giá trị giảm giá phải lớn hơn 0")
    private BigDecimal discountValue;

    @PositiveOrZero(message = "Đơn tối thiểu phải >= 0")
    private BigDecimal minOrderAmount;

    @Positive(message = "Giảm tối đa phải > 0")
    private BigDecimal maxDiscount;

    @Future(message = "Ngày bắt đầu phải trong tương lai")
    private LocalDateTime startDate;

    @Future(message = "Ngày kết thúc phải trong tương lai")
    private LocalDateTime endDate;

    @Min(value = 0, message = "Số lần sử dụng không được âm")
    private Integer usageLimit;

    @Min(value = 1, message = "Giới hạn sử dụng cho mỗi user phải >= 1")
    private Integer perUserLimit;

    private Boolean isPublic;

    private String applicableCategories;

    private String applicableProducts;
}
