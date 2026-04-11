package com.bookstore.dto.response;

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
public class ProductResponse {

    private Long id;
    private String name;
    private String description;
    private String shortDescription;
    private String author;
    private String publisher;
    private String isbn;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private Integer discountPercent;
    private BigDecimal currentPrice;
    private Integer stockQuantity;
    private boolean inStock;
    private String imageUrl;
    private List<String> images;
    private CategoryResponse category;
    private BrandResponse brand;
    private String specifications;
    private Integer pageCount;
    private Integer publishedYear;
    private String language;
    private Integer weightGrams;
    private String dimensions;
    private Double avgRating;
    private Integer reviewCount;
    private Integer soldCount;
    private Integer viewCount;
    private Boolean isFeatured;
    private Boolean isBestseller;
    private Boolean isNew;
    private Integer sortOrder;
}
