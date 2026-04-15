package com.bookstore.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "flash_sales")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashSale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "original_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal originalPrice;

    @Column(name = "sale_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal salePrice;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "stock_limit", nullable = false)
    @Builder.Default
    private Integer stockLimit = 0;

    @Column(name = "sold_count")
    @Builder.Default
    private Integer soldCount = 0;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "max_per_user")
    @Builder.Default
    private Integer maxPerUser = 1;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public boolean isCurrentlyActive(LocalDateTime referenceTime) {
        if (referenceTime == null || startTime == null || endTime == null) {
            return false;
        }

        return Boolean.TRUE.equals(isActive)
                && !referenceTime.isBefore(startTime)
                && referenceTime.isBefore(endTime)
                && getRemainingStock() > 0;
    }

    public boolean isCurrentlyActive() {
        return isCurrentlyActive(LocalDateTime.now());
    }

    public boolean isUpcoming(LocalDateTime referenceTime) {
        if (referenceTime == null || startTime == null) {
            return false;
        }

        return Boolean.TRUE.equals(isActive) && referenceTime.isBefore(startTime);
    }

    public boolean isUpcoming() {
        return isUpcoming(LocalDateTime.now());
    }

    public int getRemainingStock() {
        return stockLimit - soldCount;
    }

    public BigDecimal getDiscountPercent() {
        if (originalPrice == null || originalPrice.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return originalPrice.subtract(salePrice)
                .divide(originalPrice, 4, java.math.RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }
}
