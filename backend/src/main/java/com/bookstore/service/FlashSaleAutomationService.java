package com.bookstore.service;

import com.bookstore.config.FlashSaleAutoProperties;
import com.bookstore.entity.FlashSale;
import com.bookstore.entity.Product;
import com.bookstore.repository.FlashSaleRepository;
import com.bookstore.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Random;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlashSaleAutomationService {

    private final FlashSaleRepository flashSaleRepository;
    private final ProductRepository productRepository;
    private final FlashSaleAutoProperties properties;

    @Transactional
    public FlashSaleAutomationResult rotateWeeklyFlashSales() {
        ZoneId zoneId = ZoneId.of(properties.getTimezone());
        return rotateWeeklyFlashSales(LocalDateTime.now(zoneId), zoneId);
    }

    @Transactional
    FlashSaleAutomationResult rotateWeeklyFlashSales(LocalDateTime referenceTime, ZoneId zoneId) {
        if (!properties.isEnabled()) {
            return new FlashSaleAutomationResult(0, 0, true, "automation-disabled", null, null);
        }

        LocalDateTime normalizedReference = referenceTime.withSecond(0).withNano(0);
        int expiredCount = deactivateExpiredFlashSales(normalizedReference);
        CampaignWindow nextCampaign = resolveNextCampaignWindow(normalizedReference, zoneId);

        if (flashSaleRepository.existsOverlappingActiveFlashSales(nextCampaign.start(), nextCampaign.end())) {
            log.info("Skipping flash sale rotation because a campaign already overlaps {} -> {}", nextCampaign.start(), nextCampaign.end());
            return new FlashSaleAutomationResult(
                    expiredCount,
                    0,
                    true,
                    "overlap-existing-campaign",
                    nextCampaign.start(),
                    nextCampaign.end()
            );
        }

        Set<Long> excludedProductIds = new HashSet<>(flashSaleRepository.findScheduledProductIdsFrom(normalizedReference));
        List<Product> selectedProducts = selectProductsForNextCampaign(excludedProductIds, nextCampaign.start());

        if (selectedProducts.isEmpty()) {
            log.warn("Skipping flash sale rotation because no eligible products were found for {}", nextCampaign.start());
            return new FlashSaleAutomationResult(
                    expiredCount,
                    0,
                    true,
                    "no-eligible-products",
                    nextCampaign.start(),
                    nextCampaign.end()
            );
        }

        List<FlashSale> flashSales = buildFlashSales(selectedProducts, nextCampaign);
        flashSaleRepository.saveAll(flashSales);

        log.info("Created {} weekly flash sale items for {} -> {}", flashSales.size(), nextCampaign.start(), nextCampaign.end());
        return new FlashSaleAutomationResult(
                expiredCount,
                flashSales.size(),
                false,
                "created",
                nextCampaign.start(),
                nextCampaign.end()
        );
    }

    private int deactivateExpiredFlashSales(LocalDateTime referenceTime) {
        List<FlashSale> expiredFlashSales = flashSaleRepository.findExpiredActiveFlashSales(referenceTime);
        if (expiredFlashSales.isEmpty()) {
            return 0;
        }

        expiredFlashSales.forEach(flashSale -> flashSale.setIsActive(false));
        flashSaleRepository.saveAll(expiredFlashSales);
        log.info("Deactivated {} expired flash sale entries", expiredFlashSales.size());
        return expiredFlashSales.size();
    }

    private CampaignWindow resolveNextCampaignWindow(LocalDateTime referenceTime, ZoneId zoneId) {
        LocalDate nextMonday = referenceTime.atZone(zoneId)
                .toLocalDate()
                .with(TemporalAdjusters.next(DayOfWeek.MONDAY));
        LocalDateTime start = nextMonday.atStartOfDay();
        LocalDateTime end = nextMonday.plusDays(6).atTime(LocalTime.of(23, 59, 59));
        return new CampaignWindow(start, end);
    }

    private List<Product> selectProductsForNextCampaign(Set<Long> excludedProductIds, LocalDateTime campaignStart) {
        int batchSize = Math.max(1, properties.getBatchSize());
        int poolSize = Math.max(batchSize * 4, 12);
        long weekSeed = Math.max(1L, campaignStart.toLocalDate().toEpochDay() / 7L);

        List<Product> bestSellers = rotate(productRepository.findTopProductsByOrderCount(PageRequest.of(0, poolSize)), weekSeed);
        List<Product> mostViewed = rotate(productRepository.findMostViewedProducts(PageRequest.of(0, poolSize)).getContent(), weekSeed + 1);
        List<Product> featured = rotate(productRepository.findFeaturedProducts().stream()
                .sorted(productPriority())
                .limit(poolSize)
                .toList(), weekSeed + 2);
        List<Product> newest = rotate(productRepository.findNewProducts().stream()
                .sorted(productPriority())
                .limit(poolSize)
                .toList(), weekSeed + 3);

        LinkedHashMap<Long, Product> uniqueCandidates = new LinkedHashMap<>();
        appendEligible(uniqueCandidates, bestSellers, excludedProductIds);
        appendEligible(uniqueCandidates, mostViewed, excludedProductIds);
        appendEligible(uniqueCandidates, featured, excludedProductIds);
        appendEligible(uniqueCandidates, newest, excludedProductIds);

        List<Product> selected = new ArrayList<>(uniqueCandidates.values());
        if (selected.size() > batchSize) {
            return new ArrayList<>(selected.subList(0, batchSize));
        }
        return selected;
    }

    private void appendEligible(LinkedHashMap<Long, Product> uniqueCandidates,
                                List<Product> products,
                                Set<Long> excludedProductIds) {
        for (Product product : products) {
            if (isEligible(product, excludedProductIds)) {
                uniqueCandidates.putIfAbsent(product.getId(), product);
            }
        }
    }

    private boolean isEligible(Product product, Set<Long> excludedProductIds) {
        if (product == null || product.getId() == null) {
            return false;
        }
        if (excludedProductIds.contains(product.getId())) {
            return false;
        }
        if (!Boolean.TRUE.equals(product.getIsActive())) {
            return false;
        }

        Integer stockQuantity = product.getStockQuantity();
        if (stockQuantity == null || stockQuantity < effectiveStockMin()) {
            return false;
        }

        BigDecimal currentPrice = product.getCurrentPrice();
        return currentPrice != null && currentPrice.compareTo(BigDecimal.ONE) > 0;
    }

    private List<FlashSale> buildFlashSales(List<Product> products, CampaignWindow nextCampaign) {
        Random random = new Random(nextCampaign.start().toLocalDate().toEpochDay());
        List<FlashSale> flashSales = new ArrayList<>();

        for (Product product : products) {
            BigDecimal originalPrice = product.getCurrentPrice().setScale(0, RoundingMode.HALF_UP);
            int discountPercent = boundedRandom(random, effectiveDiscountMin(), effectiveDiscountMax());
            BigDecimal salePrice = originalPrice
                    .multiply(BigDecimal.valueOf(100 - discountPercent))
                    .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);

            if (salePrice.compareTo(originalPrice) >= 0) {
                salePrice = originalPrice.subtract(BigDecimal.ONE).max(BigDecimal.ONE);
            }

            int stockLimitCap = Math.min(product.getStockQuantity(), effectiveStockMax());
            int stockLimit = boundedRandom(random, effectiveStockMin(), stockLimitCap);

            flashSales.add(FlashSale.builder()
                    .product(product)
                    .originalPrice(originalPrice)
                    .salePrice(salePrice)
                    .startTime(nextCampaign.start())
                    .endTime(nextCampaign.end())
                    .stockLimit(stockLimit)
                    .soldCount(0)
                    .isActive(true)
                    .maxPerUser(Math.max(1, properties.getMaxPerUser()))
                    .build());
        }

        return flashSales;
    }

    private Comparator<Product> productPriority() {
        return Comparator
                .comparingInt((Product product) -> product.getSoldCount() != null ? product.getSoldCount() : 0)
                .reversed()
                .thenComparing(Comparator.comparingInt((Product product) -> product.getViewCount() != null ? product.getViewCount() : 0).reversed())
                .thenComparing(Product::getId);
    }

    private List<Product> rotate(List<Product> products, long seed) {
        if (products == null || products.isEmpty()) {
            return List.of();
        }

        List<Product> rotated = new ArrayList<>(products);
        int offset = Math.floorMod((int) seed, rotated.size());
        Collections.rotate(rotated, -offset);
        return rotated;
    }

    private int boundedRandom(Random random, int min, int max) {
        int normalizedMin = Math.max(1, min);
        int normalizedMax = Math.max(normalizedMin, max);
        return normalizedMin + random.nextInt(normalizedMax - normalizedMin + 1);
    }

    private int effectiveDiscountMin() {
        return Math.max(1, Math.min(properties.getDiscountMin(), properties.getDiscountMax()));
    }

    private int effectiveDiscountMax() {
        return Math.max(effectiveDiscountMin(), Math.max(properties.getDiscountMin(), properties.getDiscountMax()));
    }

    private int effectiveStockMin() {
        return Math.max(1, Math.min(properties.getStockMin(), properties.getStockMax()));
    }

    private int effectiveStockMax() {
        return Math.max(effectiveStockMin(), Math.max(properties.getStockMin(), properties.getStockMax()));
    }

    private record CampaignWindow(LocalDateTime start, LocalDateTime end) {
    }
}
