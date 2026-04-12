package com.bookstore.service;

import com.bookstore.config.FlashSaleAutoProperties;
import com.bookstore.entity.FlashSale;
import com.bookstore.entity.Product;
import com.bookstore.repository.FlashSaleRepository;
import com.bookstore.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FlashSaleAutomationServiceTest {

    @Mock
    private FlashSaleRepository flashSaleRepository;

    @Mock
    private ProductRepository productRepository;

    private FlashSaleAutoProperties properties;
    private FlashSaleAutomationService flashSaleAutomationService;

    @BeforeEach
    void setUp() {
        properties = new FlashSaleAutoProperties();
        properties.setEnabled(true);
        properties.setTimezone("Asia/Bangkok");
        properties.setBatchSize(4);
        properties.setDiscountMin(15);
        properties.setDiscountMax(30);
        properties.setStockMin(20);
        properties.setStockMax(60);
        properties.setMaxPerUser(2);

        flashSaleAutomationService = new FlashSaleAutomationService(
                flashSaleRepository,
                productRepository,
                properties
        );
    }

    @Test
    void rotateWeeklyFlashSales_createsNextWeekCampaignWhenWindowIsFree() {
        LocalDateTime referenceTime = LocalDateTime.of(2026, 4, 12, 10, 0);

        when(flashSaleRepository.findExpiredActiveFlashSales(referenceTime)).thenReturn(List.of());
        when(flashSaleRepository.existsOverlappingActiveFlashSales(
                LocalDateTime.of(2026, 4, 13, 0, 0),
                LocalDateTime.of(2026, 4, 19, 23, 59, 59)))
                .thenReturn(false);
        when(flashSaleRepository.findScheduledProductIdsFrom(referenceTime)).thenReturn(List.of(99L));
        when(productRepository.findTopProductsByOrderCount(any(Pageable.class))).thenReturn(List.of(
                product(1L, "Sach A", 120_000, 120),
                product(2L, "Sach B", 130_000, 95),
                product(3L, "Sach C", 140_000, 80),
                product(4L, "Sach D", 150_000, 75),
                product(5L, "Sach E", 160_000, 70)
        ));
        when(productRepository.findMostViewedProducts(any(Pageable.class))).thenReturn(new PageImpl<>(List.of()));
        when(productRepository.findFeaturedProducts()).thenReturn(List.of());
        when(productRepository.findNewProducts()).thenReturn(List.of());
        when(flashSaleRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        FlashSaleAutomationResult result = flashSaleAutomationService.rotateWeeklyFlashSales(
                referenceTime,
                ZoneId.of("Asia/Bangkok")
        );

        assertThat(result.skipped()).isFalse();
        assertThat(result.createdCount()).isEqualTo(4);
        assertThat(result.campaignStart()).isEqualTo(LocalDateTime.of(2026, 4, 13, 0, 0));
        assertThat(result.campaignEnd()).isEqualTo(LocalDateTime.of(2026, 4, 19, 23, 59, 59));

        ArgumentCaptor<List<FlashSale>> captor = ArgumentCaptor.forClass(List.class);
        verify(flashSaleRepository).saveAll(captor.capture());

        List<FlashSale> createdFlashSales = captor.getValue();
        assertThat(createdFlashSales).hasSize(4);
        assertThat(createdFlashSales)
                .allSatisfy(flashSale -> {
                    assertThat(flashSale.getStartTime()).isEqualTo(LocalDateTime.of(2026, 4, 13, 0, 0));
                    assertThat(flashSale.getEndTime()).isEqualTo(LocalDateTime.of(2026, 4, 19, 23, 59, 59));
                    assertThat(flashSale.getMaxPerUser()).isEqualTo(2);
                    assertThat(flashSale.getStockLimit()).isBetween(20, 60);
                    assertThat(flashSale.getSalePrice()).isLessThan(flashSale.getOriginalPrice());
                    assertThat(flashSale.getSalePrice().scale()).isEqualTo(0);
                });
    }

    @Test
    void rotateWeeklyFlashSales_skipsWhenUpcomingWindowAlreadyHasCampaign() {
        LocalDateTime referenceTime = LocalDateTime.of(2026, 4, 12, 10, 0);

        when(flashSaleRepository.findExpiredActiveFlashSales(referenceTime)).thenReturn(List.of());
        when(flashSaleRepository.existsOverlappingActiveFlashSales(
                LocalDateTime.of(2026, 4, 13, 0, 0),
                LocalDateTime.of(2026, 4, 19, 23, 59, 59)))
                .thenReturn(true);

        FlashSaleAutomationResult result = flashSaleAutomationService.rotateWeeklyFlashSales(
                referenceTime,
                ZoneId.of("Asia/Bangkok")
        );

        assertThat(result.skipped()).isTrue();
        assertThat(result.reason()).isEqualTo("overlap-existing-campaign");
        verify(productRepository, never()).findTopProductsByOrderCount(any(Pageable.class));
        verify(flashSaleRepository, never()).findScheduledProductIdsFrom(any());
    }

    @Test
    void rotateWeeklyFlashSales_deactivatesExpiredBeforeCheckingNextWindow() {
        LocalDateTime referenceTime = LocalDateTime.of(2026, 4, 12, 10, 0);
        FlashSale expiredOne = FlashSale.builder()
                .id(1L)
                .isActive(true)
                .endTime(referenceTime.minusDays(1))
                .build();
        FlashSale expiredTwo = FlashSale.builder()
                .id(2L)
                .isActive(true)
                .endTime(referenceTime.minusHours(2))
                .build();

        when(flashSaleRepository.findExpiredActiveFlashSales(referenceTime)).thenReturn(List.of(expiredOne, expiredTwo));
        when(flashSaleRepository.existsOverlappingActiveFlashSales(
                LocalDateTime.of(2026, 4, 13, 0, 0),
                LocalDateTime.of(2026, 4, 19, 23, 59, 59)))
                .thenReturn(true);
        when(flashSaleRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        FlashSaleAutomationResult result = flashSaleAutomationService.rotateWeeklyFlashSales(
                referenceTime,
                ZoneId.of("Asia/Bangkok")
        );

        assertThat(result.expiredCount()).isEqualTo(2);
        assertThat(expiredOne.getIsActive()).isFalse();
        assertThat(expiredTwo.getIsActive()).isFalse();
        verify(flashSaleRepository).saveAll(List.of(expiredOne, expiredTwo));
    }

    @Test
    void rotateWeeklyFlashSales_filtersOutInvalidAndDuplicateCandidates() {
        LocalDateTime referenceTime = LocalDateTime.of(2026, 4, 12, 10, 0);
        Product scheduled = product(10L, "Scheduled", 200_000, 80);
        Product lowStock = product(11L, "Low Stock", 200_000, 5);
        Product inactive = product(12L, "Inactive", 200_000, 90);
        inactive.setIsActive(false);
        Product missingPrice = product(13L, "Missing Price", 0, 90);
        Product validOne = product(21L, "Valid One", 180_000, 90);
        Product validTwo = product(22L, "Valid Two", 190_000, 100);
        Product validThree = product(23L, "Valid Three", 210_000, 120);
        Product validFour = product(24L, "Valid Four", 220_000, 140);

        when(flashSaleRepository.findExpiredActiveFlashSales(referenceTime)).thenReturn(List.of());
        when(flashSaleRepository.existsOverlappingActiveFlashSales(
                LocalDateTime.of(2026, 4, 13, 0, 0),
                LocalDateTime.of(2026, 4, 19, 23, 59, 59)))
                .thenReturn(false);
        when(flashSaleRepository.findScheduledProductIdsFrom(referenceTime)).thenReturn(List.of(10L));
        when(productRepository.findTopProductsByOrderCount(any(Pageable.class))).thenReturn(List.of(
                scheduled, lowStock, inactive, missingPrice, validOne, validTwo
        ));
        when(productRepository.findMostViewedProducts(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(
                validTwo, validThree, validFour
        )));
        when(productRepository.findFeaturedProducts()).thenReturn(List.of(validOne, validThree));
        when(productRepository.findNewProducts()).thenReturn(List.of(validFour));
        when(flashSaleRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        flashSaleAutomationService.rotateWeeklyFlashSales(referenceTime, ZoneId.of("Asia/Bangkok"));

        ArgumentCaptor<List<FlashSale>> captor = ArgumentCaptor.forClass(List.class);
        verify(flashSaleRepository).saveAll(captor.capture());
        List<Long> selectedIds = captor.getValue().stream()
                .map(flashSale -> flashSale.getProduct().getId())
                .toList();

        assertThat(selectedIds).containsExactlyInAnyOrder(21L, 22L, 23L, 24L);
    }

    private Product product(Long id, String name, int price, int stockQuantity) {
        return Product.builder()
                .id(id)
                .name(name)
                .price(BigDecimal.valueOf(price))
                .stockQuantity(stockQuantity)
                .soldCount(100)
                .viewCount(500)
                .isActive(true)
                .build();
    }
}
