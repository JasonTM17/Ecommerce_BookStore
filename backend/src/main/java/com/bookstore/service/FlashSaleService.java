package com.bookstore.service;

import com.bookstore.dto.request.FlashSaleRequest;
import com.bookstore.dto.response.FlashSaleResponse;
import com.bookstore.dto.response.FlashSaleResponse.ProductInfo;
import com.bookstore.entity.FlashSale;
import com.bookstore.entity.Product;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.FlashSaleRepository;
import com.bookstore.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlashSaleService {

    private final FlashSaleRepository flashSaleRepository;
    private final ProductRepository productRepository;
    private final FlashSaleTimeService flashSaleTimeService;

    @Transactional
    public FlashSaleResponse createFlashSale(FlashSaleRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        if (request.getSalePrice().compareTo(request.getOriginalPrice()) >= 0) {
            throw new BadRequestException("Giá sale phải nhỏ hơn giá gốc");
        }
        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new BadRequestException("Thời gian kết thúc phải sau thời gian bắt đầu");
        }

        FlashSale flashSale = flashSaleRepository.save(FlashSale.builder()
                .product(product)
                .originalPrice(request.getOriginalPrice())
                .salePrice(request.getSalePrice())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .stockLimit(request.getStockLimit())
                .soldCount(0)
                .isActive(true)
                .maxPerUser(request.getMaxPerUser() != null ? request.getMaxPerUser() : 1)
                .build());

        log.info("Flash sale created for product {}", product.getName());
        return mapToFlashSaleResponse(flashSale, flashSaleTimeService.now());
    }

    @Transactional
    public FlashSaleResponse updateFlashSale(Long id, FlashSaleRequest request) {
        FlashSale flashSale = flashSaleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FlashSale", "id", id));

        if (request.getSalePrice() != null) flashSale.setSalePrice(request.getSalePrice());
        if (request.getEndTime() != null) flashSale.setEndTime(request.getEndTime());
        if (request.getStockLimit() != null) flashSale.setStockLimit(request.getStockLimit());
        if (request.getMaxPerUser() != null) flashSale.setMaxPerUser(request.getMaxPerUser());
        if (request.getIsActive() != null) flashSale.setIsActive(request.getIsActive());

        flashSale = flashSaleRepository.save(flashSale);
        return mapToFlashSaleResponse(flashSale, flashSaleTimeService.now());
    }

    @Transactional(readOnly = true)
    public List<FlashSaleResponse> getActiveFlashSales() {
        LocalDateTime referenceTime = flashSaleTimeService.now();
        return flashSaleRepository.findActiveFlashSales(referenceTime)
                .stream().map(flashSale -> mapToFlashSaleResponse(flashSale, referenceTime))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FlashSaleResponse> getUpcomingFlashSales() {
        LocalDateTime referenceTime = flashSaleTimeService.now();
        return flashSaleRepository.findUpcomingFlashSales(referenceTime)
                .stream().map(flashSale -> mapToFlashSaleResponse(flashSale, referenceTime))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<FlashSaleResponse> getAllFlashSales(Pageable pageable) {
        LocalDateTime referenceTime = flashSaleTimeService.now();
        return flashSaleRepository.findByIsActiveTrueOrderByStartTimeDesc(pageable)
                .map(flashSale -> mapToFlashSaleResponse(flashSale, referenceTime));
    }

    @Transactional(readOnly = true)
    public FlashSaleResponse getFlashSaleById(Long id) {
        FlashSale flashSale = flashSaleRepository.findByIdWithProduct(id);
        if (flashSale == null) {
            throw new ResourceNotFoundException("FlashSale", "id", id);
        }
        return mapToFlashSaleResponse(flashSale, flashSaleTimeService.now());
    }

    @Transactional
    public boolean purchaseFlashSale(Long flashSaleId, int quantity) {
        FlashSale flashSale = flashSaleRepository.findById(flashSaleId)
                .orElseThrow(() -> new ResourceNotFoundException("FlashSale", "id", flashSaleId));

        if (!flashSale.isCurrentlyActive(flashSaleTimeService.now())) {
            throw new BadRequestException("Flash sale không còn hoạt động");
        }
        if (quantity > flashSale.getRemainingStock()) {
            throw new BadRequestException("Số lượng vượt quá tồn kho flash sale");
        }

        flashSale.setSoldCount(flashSale.getSoldCount() + quantity);
        flashSaleRepository.save(flashSale);
        log.info("Flash sale purchase: {} units sold for flash sale {}", quantity, flashSaleId);
        return true;
    }

    @Transactional
    public void deactivateExpiredFlashSales() {
        List<FlashSale> allActive = flashSaleRepository.findByIsActiveTrueOrderByStartTimeDesc(Pageable.unpaged()).getContent();
        LocalDateTime now = flashSaleTimeService.now();
        for (FlashSale fs : allActive) {
            if (fs.getEndTime().isBefore(now)) {
                fs.setIsActive(false);
                flashSaleRepository.save(fs);
            }
        }
    }

    private FlashSaleResponse mapToFlashSaleResponse(FlashSale fs, LocalDateTime referenceTime) {
        Product p = fs.getProduct();
        ProductInfo productInfo = ProductInfo.builder()
                .id(p.getId()).name(p.getName()).author(p.getAuthor()).imageUrl(p.getImageUrl()).build();

        BigDecimal discountPercent = fs.getDiscountPercent();

        return FlashSaleResponse.builder()
                .id(fs.getId()).product(productInfo)
                .originalPrice(fs.getOriginalPrice()).salePrice(fs.getSalePrice())
                .discountPercent(discountPercent)
                .startTime(flashSaleTimeService.toOffsetDateTime(fs.getStartTime()))
                .endTime(flashSaleTimeService.toOffsetDateTime(fs.getEndTime()))
                .stockLimit(fs.getStockLimit()).soldCount(fs.getSoldCount())
                .remainingStock(fs.getRemainingStock())
                .isActive(fs.getIsActive())
                .isCurrentlyActive(fs.isCurrentlyActive(referenceTime))
                .isUpcoming(fs.isUpcoming(referenceTime))
                .maxPerUser(fs.getMaxPerUser())
                .createdAt(flashSaleTimeService.toOffsetDateTime(fs.getCreatedAt()))
                .build();
    }
}
