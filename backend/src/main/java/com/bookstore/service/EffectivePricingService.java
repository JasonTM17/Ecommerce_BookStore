package com.bookstore.service;

import com.bookstore.entity.FlashSale;
import com.bookstore.entity.Product;
import com.bookstore.repository.FlashSaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class EffectivePricingService {

    private final FlashSaleRepository flashSaleRepository;

    @Transactional(readOnly = true)
    public EffectiveProductPricing resolve(Product product) {
        if (product == null) {
            throw new IllegalArgumentException("Product must not be null");
        }

        return resolveAll(List.of(product)).get(product.getId());
    }

    @Transactional(readOnly = true)
    public Map<Long, EffectiveProductPricing> resolveAll(Collection<Product> products) {
        List<Product> candidates = products == null
                ? List.of()
                : products.stream()
                .filter(Objects::nonNull)
                .filter(product -> product.getId() != null)
                .toList();

        if (candidates.isEmpty()) {
            return Map.of();
        }

        LocalDateTime now = LocalDateTime.now();
        List<Long> productIds = candidates.stream()
                .map(Product::getId)
                .distinct()
                .toList();

        List<FlashSale> activeFlashSales = flashSaleRepository.findActiveFlashSalesByProductIds(productIds, now);
        Map<Long, FlashSale> flashSaleByProductId = new LinkedHashMap<>();
        for (FlashSale flashSale : activeFlashSales) {
            flashSaleByProductId.putIfAbsent(flashSale.getProduct().getId(), flashSale);
        }

        Map<Long, EffectiveProductPricing> pricingByProductId = new LinkedHashMap<>();
        for (Product product : candidates) {
            pricingByProductId.put(product.getId(), buildPricing(product, flashSaleByProductId.get(product.getId())));
        }

        return pricingByProductId;
    }

    private EffectiveProductPricing buildPricing(Product product, FlashSale activeFlashSale) {
        BigDecimal originalPrice = normalizePrice(product.getPrice());

        if (activeFlashSale != null) {
            BigDecimal salePrice = normalizePrice(activeFlashSale.getSalePrice());
            int remainingStock = Math.max(0, Math.min(normalizeStock(product.getStockQuantity()), activeFlashSale.getRemainingStock()));

            return new EffectiveProductPricing(
                    originalPrice,
                    salePrice,
                    salePrice,
                    resolveDiscountPercent(originalPrice, salePrice),
                    remainingStock,
                    remainingStock > 0,
                    activeFlashSale
            );
        }

        BigDecimal currentPrice = normalizePrice(product.getCurrentPrice());
        BigDecimal discountPrice = product.getDiscountPrice() != null && product.getDiscountPrice().compareTo(BigDecimal.ZERO) > 0
                ? product.getDiscountPrice()
                : null;
        int stockQuantity = normalizeStock(product.getStockQuantity());

        return new EffectiveProductPricing(
                originalPrice,
                discountPrice,
                currentPrice,
                normalizeDiscountPercent(product.getDiscountPercent(), originalPrice, currentPrice),
                stockQuantity,
                stockQuantity > 0,
                null
        );
    }

    private BigDecimal normalizePrice(BigDecimal price) {
        return price != null ? price : BigDecimal.ZERO;
    }

    private int normalizeStock(Integer stockQuantity) {
        return stockQuantity != null ? Math.max(stockQuantity, 0) : 0;
    }

    private Integer normalizeDiscountPercent(Integer currentDiscountPercent, BigDecimal originalPrice, BigDecimal currentPrice) {
        if (currentDiscountPercent != null && currentDiscountPercent > 0) {
            return currentDiscountPercent;
        }
        return resolveDiscountPercent(originalPrice, currentPrice);
    }

    private Integer resolveDiscountPercent(BigDecimal originalPrice, BigDecimal currentPrice) {
        if (originalPrice == null || currentPrice == null || originalPrice.compareTo(BigDecimal.ZERO) <= 0) {
            return 0;
        }
        if (currentPrice.compareTo(originalPrice) >= 0) {
            return 0;
        }

        return originalPrice.subtract(currentPrice)
                .multiply(BigDecimal.valueOf(100))
                .divide(originalPrice, 0, RoundingMode.HALF_UP)
                .intValue();
    }
}
