package com.bookstore.controller;

import com.bookstore.dto.request.ProductRequest;
import com.bookstore.dto.response.PageResponse;
import com.bookstore.dto.response.ProductResponse;
import com.bookstore.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "API quản lý sản phẩm")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Lấy danh sách sản phẩm với bộ lọc và phân trang")
    public ResponseEntity<PageResponse<ProductResponse>> getProducts(
            @Parameter(description = "Từ khóa tìm kiếm") @RequestParam(required = false) String keyword,
            @Parameter(description = "ID danh mục") @RequestParam(required = false) Long categoryId,
            @Parameter(description = "ID thương hiệu") @RequestParam(required = false) Long brandId,
            @Parameter(description = "Giá tối thiểu") @RequestParam(required = false) BigDecimal minPrice,
            @Parameter(description = "Giá tối đa") @RequestParam(required = false) BigDecimal maxPrice,
            @Parameter(description = "Còn hàng") @RequestParam(required = false) Boolean inStock,
            @Parameter(description = "Sắp xếp theo") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Hướng sắp xếp") @RequestParam(defaultValue = "DESC") String direction,
            @Parameter(description = "Trang") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Kích thước trang") @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(productService.searchProducts(
                keyword, categoryId, brandId, minPrice, maxPrice, inStock, sortBy, direction, page, size));
    }

    @GetMapping("/featured")
    @Operation(summary = "Lấy sản phẩm nổi bật")
    public ResponseEntity<List<ProductResponse>> getFeaturedProducts() {
        return ResponseEntity.ok(productService.getFeaturedProducts());
    }

    @GetMapping("/bestsellers")
    @Operation(summary = "Lấy sản phẩm bán chạy")
    public ResponseEntity<List<ProductResponse>> getBestsellerProducts() {
        return ResponseEntity.ok(productService.getBestsellerProducts());
    }

    @GetMapping("/new")
    @Operation(summary = "Lấy sản phẩm mới")
    public ResponseEntity<List<ProductResponse>> getNewProducts() {
        return ResponseEntity.ok(productService.getNewProducts());
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Lấy sản phẩm theo danh mục")
    public ResponseEntity<PageResponse<ProductResponse>> getProductsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(productService.getProductsByCategory(categoryId, page, size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết sản phẩm")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/{id}/related")
    @Operation(summary = "Lấy sản phẩm liên quan")
    public ResponseEntity<List<ProductResponse>> getRelatedProducts(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "0") Long categoryId) {
        return ResponseEntity.ok(productService.getRelatedProducts(id, categoryId));
    }

    @GetMapping("/low-stock")
    @Operation(summary = "Lấy sản phẩm sắp hết hàng")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<ProductResponse>> getLowStockProducts(
            @RequestParam(defaultValue = "10") int threshold) {
        return ResponseEntity.ok(productService.getLowStockProducts(threshold));
    }
}
