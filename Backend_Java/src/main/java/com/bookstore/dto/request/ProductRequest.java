package com.bookstore.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(max = 500, message = "Tên sản phẩm không được vượt quá 500 ký tự")
    private String name;

    private String description;

    @Size(max = 500, message = "Mô tả ngắn không được vượt quá 500 ký tự")
    private String shortDescription;

    @Size(max = 300, message = "Tên tác giả không được vượt quá 300 ký tự")
    private String author;

    @Size(max = 200, message = "Nhà xuất bản không được vượt quá 200 ký tự")
    private String publisher;

    @Size(max = 20, message = "ISBN không được vượt quá 20 ký tự")
    private String isbn;

    @NotNull(message = "Giá không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá phải lớn hơn 0")
    private BigDecimal price;

    @DecimalMin(value = "0.0", message = "Giá giảm không được nhỏ hơn 0")
    private BigDecimal discountPrice;

    @Min(value = 0, message = "Phần trăm giảm giá không được nhỏ hơn 0")
    @Max(value = 100, message = "Phần trăm giảm giá không được vượt quá 100")
    private Integer discountPercent;

    @Min(value = 0, message = "Số lượng trong kho không được nhỏ hơn 0")
    private Integer stockQuantity;

    private String imageUrl;

    private List<String> images;

    @NotNull(message = "Danh mục không được để trống")
    private Long categoryId;

    private Long brandId;

    private String specifications;

    private Integer pageCount;

    private Integer publishedYear;

    @Size(max = 50, message = "Ngôn ngữ không được vượt quá 50 ký tự")
    private String language;

    private Integer weightGrams;

    private String dimensions;

    private Boolean isFeatured;

    private Boolean isBestseller;

    private Boolean isNew;
}
