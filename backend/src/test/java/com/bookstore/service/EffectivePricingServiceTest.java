package com.bookstore.service;

import com.bookstore.entity.FlashSale;
import com.bookstore.entity.Product;
import com.bookstore.repository.FlashSaleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EffectivePricingServiceTest {

    @Mock
    private FlashSaleRepository flashSaleRepository;

    @Mock
    private FlashSaleTimeService flashSaleTimeService;

    @InjectMocks
    private EffectivePricingService effectivePricingService;

    @Test
    void resolve_returnsRegularPricingWhenNoActiveFlashSale() {
        LocalDateTime businessNow = LocalDateTime.of(2026, 4, 15, 9, 0);
        Product product = Product.builder()
                .id(1L)
                .price(new BigDecimal("150000"))
                .discountPrice(new BigDecimal("120000"))
                .discountPercent(20)
                .stockQuantity(30)
                .build();

        when(flashSaleTimeService.now()).thenReturn(businessNow);
        when(flashSaleRepository.findActiveFlashSalesByProductIds(anyList(), any(LocalDateTime.class))).thenReturn(List.of());

        EffectiveProductPricing pricing = effectivePricingService.resolve(product);

        assertEquals(new BigDecimal("150000"), pricing.originalPrice());
        assertEquals(new BigDecimal("120000"), pricing.currentPrice());
        assertEquals(30, pricing.stockQuantity());
        assertFalse(pricing.hasActiveFlashSale());
    }

    @Test
    void resolve_returnsFlashSalePriceAndRemainingStockWhenCampaignIsActive() {
        LocalDateTime businessNow = LocalDateTime.of(2026, 4, 15, 9, 0);
        Product product = Product.builder()
                .id(1L)
                .price(new BigDecimal("150000"))
                .stockQuantity(40)
                .build();
        FlashSale flashSale = FlashSale.builder()
                .id(99L)
                .product(product)
                .originalPrice(new BigDecimal("150000"))
                .salePrice(new BigDecimal("99000"))
                .startTime(LocalDateTime.now().minusHours(1))
                .endTime(LocalDateTime.now().plusHours(1))
                .stockLimit(25)
                .soldCount(7)
                .maxPerUser(2)
                .isActive(true)
                .build();

        when(flashSaleTimeService.now()).thenReturn(businessNow);
        when(flashSaleRepository.findActiveFlashSalesByProductIds(anyList(), any(LocalDateTime.class))).thenReturn(List.of(flashSale));

        EffectiveProductPricing pricing = effectivePricingService.resolve(product);

        assertTrue(pricing.hasActiveFlashSale());
        assertEquals(new BigDecimal("99000"), pricing.currentPrice());
        assertEquals(18, pricing.stockQuantity());
        assertEquals(34, pricing.discountPercent());
    }

    @Test
    void resolve_queriesRepositoryUsingBusinessTimezoneReference() {
        LocalDateTime businessNow = LocalDateTime.of(2026, 4, 15, 9, 15);
        Product product = Product.builder()
                .id(8L)
                .price(new BigDecimal("200000"))
                .stockQuantity(10)
                .build();

        when(flashSaleTimeService.now()).thenReturn(businessNow);
        when(flashSaleRepository.findActiveFlashSalesByProductIds(anyList(), any(LocalDateTime.class))).thenReturn(List.of());

        effectivePricingService.resolve(product);

        org.mockito.Mockito.verify(flashSaleRepository)
                .findActiveFlashSalesByProductIds(anyList(), org.mockito.ArgumentMatchers.eq(businessNow));
    }
}
