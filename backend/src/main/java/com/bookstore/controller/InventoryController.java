package com.bookstore.controller;

import com.bookstore.dto.request.InventoryAdjustRequest;
import com.bookstore.dto.response.ApiResponse;
import com.bookstore.dto.response.InventoryLogResponse;
import com.bookstore.dto.response.ProductResponse;
import com.bookstore.entity.User;
import com.bookstore.service.InventoryService;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory Management", description = "API quản lý tồn kho (Admin)")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/adjust")
    @Operation(summary = "Điều chỉnh tồn kho")
    public ResponseEntity<ApiResponse<InventoryLogResponse>> adjustInventory(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody InventoryAdjustRequest request) {
        InventoryLogResponse log = inventoryService.adjustInventory(request, user);
        return ResponseEntity.ok(ApiResponse.success(log, "Đã điều chỉnh tồn kho"));
    }

    @GetMapping("/low-stock")
    @Operation(summary = "Lấy danh sách sản phẩm sắp hết hàng")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getLowStockProducts(
            @RequestParam(defaultValue = "10") int threshold) {
        List<ProductResponse> products = inventoryService.getLowStockProducts(threshold);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/history/{productId}")
    @Operation(summary = "Lấy lịch sử tồn kho của sản phẩm")
    public ResponseEntity<ApiResponse<List<InventoryLogResponse>>> getInventoryHistory(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<InventoryLogResponse> history = inventoryService.getInventoryHistory(productId, pageable);
        return ResponseEntity.ok(ApiResponse.success(history.getContent()));
    }

    @GetMapping("/logs")
    @Operation(summary = "Lấy tất cả log tồn kho")
    public ResponseEntity<ApiResponse<List<InventoryLogResponse>>> getAllLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<InventoryLogResponse> logs = inventoryService.getAllInventoryLogs(pageable);
        return ResponseEntity.ok(ApiResponse.success(logs.getContent()));
    }
}
