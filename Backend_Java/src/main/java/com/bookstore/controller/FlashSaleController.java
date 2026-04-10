package com.bookstore.controller;

import com.bookstore.dto.request.FlashSaleRequest;
import com.bookstore.dto.response.ApiResponse;
import com.bookstore.dto.response.FlashSaleResponse;
import com.bookstore.service.FlashSaleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Flash Sale", description = "API Flash Sale")
@SecurityRequirement(name = "bearerAuth")
public class FlashSaleController {

    private final FlashSaleService flashSaleService;

    @GetMapping("/api/flash-sales/active")
    @Operation(summary = "Lấy danh sách flash sale đang hoạt động")
    public ResponseEntity<ApiResponse<List<FlashSaleResponse>>> getActiveFlashSales() {
        List<FlashSaleResponse> sales = flashSaleService.getActiveFlashSales();
        return ResponseEntity.ok(ApiResponse.success(sales));
    }

    @GetMapping("/api/flash-sales/upcoming")
    @Operation(summary = "Lấy danh sách flash sale sắp tới")
    public ResponseEntity<ApiResponse<List<FlashSaleResponse>>> getUpcomingFlashSales() {
        List<FlashSaleResponse> sales = flashSaleService.getUpcomingFlashSales();
        return ResponseEntity.ok(ApiResponse.success(sales));
    }

    @GetMapping("/api/flash-sales/{id}")
    @Operation(summary = "Lấy chi tiết flash sale")
    public ResponseEntity<ApiResponse<FlashSaleResponse>> getFlashSale(@PathVariable Long id) {
        FlashSaleResponse sale = flashSaleService.getFlashSaleById(id);
        return ResponseEntity.ok(ApiResponse.success(sale));
    }

    @GetMapping("/api/admin/flash-sales")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lấy tất cả flash sale (Admin)")
    public ResponseEntity<ApiResponse<Page<FlashSaleResponse>>> getAllFlashSales(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<FlashSaleResponse> sales = flashSaleService.getAllFlashSales(pageable);
        return ResponseEntity.ok(ApiResponse.success(sales));
    }

    @PostMapping("/api/admin/flash-sales")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo flash sale mới (Admin)")
    public ResponseEntity<ApiResponse<FlashSaleResponse>> createFlashSale(
            @Valid @RequestBody FlashSaleRequest request) {
        FlashSaleResponse sale = flashSaleService.createFlashSale(request);
        return ResponseEntity.ok(ApiResponse.success(sale, "Flash sale đã được tạo"));
    }

    @PutMapping("/api/admin/flash-sales/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật flash sale (Admin)")
    public ResponseEntity<ApiResponse<FlashSaleResponse>> updateFlashSale(
            @PathVariable Long id,
            @Valid @RequestBody FlashSaleRequest request) {
        FlashSaleResponse sale = flashSaleService.updateFlashSale(id, request);
        return ResponseEntity.ok(ApiResponse.success(sale, "Flash sale đã được cập nhật"));
    }
}
