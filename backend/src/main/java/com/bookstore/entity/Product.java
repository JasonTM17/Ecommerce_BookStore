package com.bookstore.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products", indexes = {
    @Index(name = "idx_product_is_active", columnList = "is_active"),
    @Index(name = "idx_product_category", columnList = "category_id"),
    @Index(name = "idx_product_brand", columnList = "brand_id"),
    @Index(name = "idx_product_is_featured", columnList = "is_featured"),
    @Index(name = "idx_product_is_bestseller", columnList = "is_bestseller"),
    @Index(name = "idx_product_is_new", columnList = "is_new"),
    @Index(name = "idx_product_created_at", columnList = "created_at"),
    @Index(name = "idx_product_sold_count", columnList = "sold_count"),
    @Index(name = "idx_product_view_count", columnList = "view_count"),
    @Index(name = "idx_product_stock_quantity", columnList = "stock_quantity"),
    @Index(name = "idx_product_isbn", columnList = "isbn")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String shortDescription;

    @Column(name = "author", length = 300)
    private String author;

    @Column(name = "publisher", length = 200)
    private String publisher;

    @Column(name = "isbn", unique = true, length = 20)
    private String isbn;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "discount_price", precision = 12, scale = 2)
    private BigDecimal discountPrice;

    @Column(name = "discount_percent")
    @Builder.Default
    private Integer discountPercent = 0;

    @Column(name = "stock_quantity")
    @Builder.Default
    private Integer stockQuantity = 0;

    @Column(name = "image_url")
    private String imageUrl;

    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> images = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @Builder.Default
    private List<OrderItem> orderItems = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String specifications;

    @Column(name = "page_count")
    private Integer pageCount;

    @Column(name = "published_year")
    private Integer publishedYear;

    @Column(name = "language", length = 50)
    @Builder.Default
    private String language = "Vietnamese";

    @Column(name = "weight_grams")
    private Integer weightGrams;

    @Column(name = "dimensions")
    private String dimensions;

    @Column(name = "avg_rating")
    @Builder.Default
    private Double avgRating = 0.0;

    @Column(name = "review_count")
    @Builder.Default
    private Integer reviewCount = 0;

    @Column(name = "sold_count")
    @Builder.Default
    private Integer soldCount = 0;

    @Column(name = "view_count")
    @Builder.Default
    private Integer viewCount = 0;

    @Column(name = "is_featured")
    @Builder.Default
    private Boolean isFeatured = false;

    @Column(name = "is_bestseller")
    @Builder.Default
    private Boolean isBestseller = false;

    @Column(name = "is_new")
    @Builder.Default
    private Boolean isNew = false;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    @Version
    private Long version;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void calculateDiscountPrice() {
        if (discountPercent != null && discountPercent > 0 && price != null) {
            BigDecimal discount = price.multiply(BigDecimal.valueOf(discountPercent))
                    .divide(BigDecimal.valueOf(100));
            discountPrice = price.subtract(discount);
        }
    }

    public BigDecimal getCurrentPrice() {
        return discountPrice != null && discountPrice.compareTo(BigDecimal.ZERO) > 0 
                ? discountPrice : price;
    }

    public boolean isInStock() {
        return stockQuantity != null && stockQuantity > 0;
    }
}
