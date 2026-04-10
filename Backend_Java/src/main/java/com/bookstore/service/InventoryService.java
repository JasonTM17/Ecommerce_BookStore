package com.bookstore.service;

import com.bookstore.dto.request.InventoryAdjustRequest;
import com.bookstore.dto.response.InventoryLogResponse;
import com.bookstore.dto.response.ProductResponse;
import com.bookstore.entity.*;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.InventoryLogRepository;
import com.bookstore.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private final InventoryLogRepository inventoryLogRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService;

    private static final int LOW_STOCK_THRESHOLD = 10;

    @Transactional
    public InventoryLogResponse adjustInventory(InventoryAdjustRequest request, User admin) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        int stockBefore = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        int stockAfter;

        switch (request.getAction()) {
            case PURCHASE:
            case RETURN:
            case ADJUSTMENT:
            case INITIAL:
                stockAfter = stockBefore + Math.abs(request.getQuantityChange());
                break;
            case SALE:
                stockAfter = stockBefore - Math.abs(request.getQuantityChange());
                if (stockAfter < 0) {
                    throw new BadRequestException("Số lượng tồn kho không đủ. Hiện tại: " + stockBefore);
                }
                break;
            case DAMAGED:
                stockAfter = stockBefore - Math.abs(request.getQuantityChange());
                break;
            default:
                stockAfter = stockBefore;
        }

        product.setStockQuantity(stockAfter);
        productRepository.save(product);

        InventoryLog logEntry = InventoryLog.builder()
                .product(product)
                .action(request.getAction())
                .quantityChange(request.getQuantityChange())
                .stockBefore(stockBefore)
                .stockAfter(stockAfter)
                .reason(request.getReason())
                .createdBy(admin)
                .build();

        logEntry = inventoryLogRepository.save(logEntry);
        log.info("Inventory adjusted for product {}: {} ({} -> {})",
                product.getName(), request.getAction(), stockBefore, stockAfter);

        if (stockAfter <= LOW_STOCK_THRESHOLD && stockBefore > LOW_STOCK_THRESHOLD) {
            notifyLowStock(product, stockAfter);
        }

        return mapToInventoryLogResponse(logEntry, product);
    }

    private void notifyLowStock(Product product, int stockAfter) {
        try {
            log.warn("Low stock alert: {} has only {} units remaining", product.getName(), stockAfter);
        } catch (Exception e) {
            log.warn("Could not send low stock notification: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getLowStockProducts() {
        List<Product> products = productRepository.findLowStockProducts(LOW_STOCK_THRESHOLD);
        return products.stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getLowStockProducts(int threshold) {
        List<Product> products = productRepository.findLowStockProducts(threshold);
        return products.stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<InventoryLogResponse> getInventoryHistory(Long productId, Pageable pageable) {
        Page<InventoryLog> logs = inventoryLogRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable);
        return logs.map(log -> mapToInventoryLogResponse(log, log.getProduct()));
    }

    @Transactional(readOnly = true)
    public List<InventoryLogResponse> getInventoryHistory(Long productId) {
        List<InventoryLog> logs = inventoryLogRepository.findByProductIdOrderByCreatedAtDesc(productId);
        return logs.stream()
                .map(log -> mapToInventoryLogResponse(log, log.getProduct()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<InventoryLogResponse> getAllInventoryLogs(Pageable pageable) {
        Page<InventoryLog> logs = inventoryLogRepository.findAll(pageable);
        return logs.map(log -> mapToInventoryLogResponse(log, log.getProduct()));
    }

    @Transactional
    public void recordSale(Long productId, int quantity, Long orderId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        int stockBefore = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        int stockAfter = stockBefore - quantity;

        product.setStockQuantity(stockAfter);
        productRepository.save(product);

        InventoryLog logEntry = InventoryLog.builder()
                .product(product)
                .action(InventoryAction.SALE)
                .quantityChange(-quantity)
                .stockBefore(stockBefore)
                .stockAfter(stockAfter)
                .referenceId(orderId)
                .referenceType("ORDER")
                .reason("Bán hàng - Đơn hàng #" + orderId)
                .build();

        inventoryLogRepository.save(logEntry);

        if (stockAfter <= LOW_STOCK_THRESHOLD) {
            notifyLowStock(product, stockAfter);
        }
    }

    @Transactional
    public void recordReturn(Long productId, int quantity, Long orderId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        int stockBefore = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        int stockAfter = stockBefore + quantity;

        product.setStockQuantity(stockAfter);
        productRepository.save(product);

        InventoryLog logEntry = InventoryLog.builder()
                .product(product)
                .action(InventoryAction.RETURN)
                .quantityChange(quantity)
                .stockBefore(stockBefore)
                .stockAfter(stockAfter)
                .referenceId(orderId)
                .referenceType("ORDER")
                .reason("Trả hàng - Đơn hàng #" + orderId)
                .build();

        inventoryLogRepository.save(logEntry);
        log.info("Return recorded for product {}: {} units returned", product.getName(), quantity);
    }

    private InventoryLogResponse mapToInventoryLogResponse(InventoryLog log, Product product) {
        String createdByName = log.getCreatedBy() != null ? log.getCreatedBy().getFullName() : "System";

        return InventoryLogResponse.builder()
                .id(log.getId())
                .productId(product.getId())
                .productName(product.getName())
                .action(log.getAction())
                .quantityChange(log.getQuantityChange())
                .stockBefore(log.getStockBefore())
                .stockAfter(log.getStockAfter())
                .reason(log.getReason())
                .referenceId(log.getReferenceId())
                .referenceType(log.getReferenceType())
                .createdByName(createdByName)
                .createdAt(log.getCreatedAt())
                .build();
    }

    private ProductResponse mapToProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .author(product.getAuthor())
                .price(product.getPrice())
                .discountPrice(product.getDiscountPrice())
                .stockQuantity(product.getStockQuantity())
                .imageUrl(product.getImageUrl())
                .avgRating(product.getAvgRating())
                .reviewCount(product.getReviewCount())
                .build();
    }
}
