package com.bookstore.service;

import com.bookstore.entity.FlashSale;

import java.math.BigDecimal;

public record EffectiveProductPricing(
        BigDecimal originalPrice,
        BigDecimal discountPrice,
        BigDecimal currentPrice,
        Integer discountPercent,
        Integer stockQuantity,
        boolean inStock,
        FlashSale activeFlashSale
) {
    public boolean hasActiveFlashSale() {
        return activeFlashSale != null;
    }

    public int maxPerUser() {
        if (activeFlashSale == null || activeFlashSale.getMaxPerUser() == null) {
            return Integer.MAX_VALUE;
        }
        return activeFlashSale.getMaxPerUser();
    }
}
