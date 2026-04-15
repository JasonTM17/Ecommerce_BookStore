package com.bookstore.service;

import com.bookstore.dto.response.FlashSaleResponse;
import com.bookstore.entity.FlashSale;
import com.bookstore.entity.Product;
import com.bookstore.exception.BadRequestException;
import com.bookstore.repository.FlashSaleRepository;
import com.bookstore.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FlashSaleServiceTest {

    @Mock
    private FlashSaleRepository flashSaleRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private FlashSaleTimeService flashSaleTimeService;

    @InjectMocks
    private FlashSaleService flashSaleService;

    @Test
    void getActiveFlashSales_usesBusinessTimeAndReturnsOffsetTimestamps() {
        LocalDateTime businessNow = LocalDateTime.of(2026, 4, 15, 9, 15);
        Product product = Product.builder()
                .id(10L)
                .name("Atomic Habits")
                .author("James Clear")
                .imageUrl("/images/books/atomic-habits.jpg")
                .build();
        FlashSale flashSale = FlashSale.builder()
                .id(5L)
                .product(product)
                .originalPrice(new BigDecimal("129000"))
                .salePrice(new BigDecimal("88546"))
                .startTime(LocalDateTime.of(2026, 4, 15, 8, 0))
                .endTime(LocalDateTime.of(2026, 4, 15, 16, 0))
                .stockLimit(20)
                .soldCount(4)
                .isActive(true)
                .maxPerUser(2)
                .build();

        when(flashSaleTimeService.now()).thenReturn(businessNow);
        when(flashSaleTimeService.toOffsetDateTime(any(LocalDateTime.class))).thenAnswer(invocation ->
                ((LocalDateTime) invocation.getArgument(0)).atZone(ZoneId.of("Asia/Bangkok")).toOffsetDateTime());
        when(flashSaleRepository.findActiveFlashSales(businessNow)).thenReturn(List.of(flashSale));

        List<FlashSaleResponse> responses = flashSaleService.getActiveFlashSales();

        assertEquals(1, responses.size());
        assertEquals(
                flashSale.getEndTime().atZone(ZoneId.of("Asia/Bangkok")).toOffsetDateTime(),
                responses.get(0).getEndTime()
        );
        verify(flashSaleRepository).findActiveFlashSales(eq(businessNow));
    }

    @Test
    void purchaseFlashSale_rejectsCampaignThatAlreadyEndedInBusinessTimezone() {
        LocalDateTime businessNow = LocalDateTime.of(2026, 4, 15, 9, 15);
        FlashSale flashSale = FlashSale.builder()
                .id(12L)
                .product(Product.builder().id(99L).name("Expired deal").build())
                .originalPrice(new BigDecimal("100000"))
                .salePrice(new BigDecimal("75000"))
                .startTime(LocalDateTime.of(2026, 4, 15, 6, 0))
                .endTime(LocalDateTime.of(2026, 4, 15, 8, 59))
                .stockLimit(10)
                .soldCount(1)
                .isActive(true)
                .maxPerUser(2)
                .build();

        when(flashSaleTimeService.now()).thenReturn(businessNow);
        when(flashSaleRepository.findById(12L)).thenReturn(Optional.of(flashSale));

        assertThrows(BadRequestException.class, () -> flashSaleService.purchaseFlashSale(12L, 1));
    }
}
