package com.bookstore.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "rental_pricing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalPricing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    @Column(name = "daily_rate", precision = 12, scale = 2)
    private BigDecimal dailyRate;

    @Column(name = "weekly_rate", precision = 12, scale = 2)
    private BigDecimal weeklyRate;

    @Column(name = "monthly_rate", precision = 12, scale = 2)
    private BigDecimal monthlyRate;

    @Column(name = "deposit_percent")
    @Builder.Default
    private Integer depositPercent = 50;

    @Column(name = "is_available_for_rental")
    @Builder.Default
    private Boolean isAvailableForRental = false;
}
