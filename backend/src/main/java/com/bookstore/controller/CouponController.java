package com.bookstore.controller;

import com.bookstore.dto.request.CouponRequest;
import com.bookstore.dto.request.CouponValidationRequest;
import com.bookstore.dto.response.ApiResponse;
import com.bookstore.dto.response.CouponResponse;
import com.bookstore.entity.User;
import com.bookstore.service.CouponService;
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

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/coupons")
@RequiredArgsConstructor
@Tag(name = "Coupons", description = "API quản lý coupon - mã giảm giá")
@SecurityRequirement(name = "bearerAuth")
public class CouponController {

    private final CouponService couponService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo coupon mới (Admin)")
    public ResponseEntity<ApiResponse<CouponResponse>> createCoupon(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CouponRequest request) {
        CouponResponse coupon = couponService.createCoupon(request, user);
        return ResponseEntity.ok(ApiResponse.success(coupon, "Tạo coupon thành công"));
    }

    @GetMapping("/available")
    @Operation(summary = "Lấy danh sách coupon khả dụng")
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getAvailableCoupons() {
        List<CouponResponse> coupons = couponService.getAvailableCoupons();
        return ResponseEntity.ok(ApiResponse.success(coupons));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lấy tất cả coupon (Admin)")
    public ResponseEntity<ApiResponse<Page<CouponResponse>>> getAllCoupons(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CouponResponse> coupons = couponService.getAllCoupons(pageable);
        return ResponseEntity.ok(ApiResponse.success(coupons));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lấy chi tiết coupon (Admin)")
    public ResponseEntity<ApiResponse<CouponResponse>> getCouponById(@PathVariable Long id) {
        CouponResponse coupon = couponService.getCouponById(id);
        return ResponseEntity.ok(ApiResponse.success(coupon));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật coupon (Admin)")
    public ResponseEntity<ApiResponse<CouponResponse>> updateCoupon(
            @PathVariable Long id,
            @Valid @RequestBody CouponRequest request) {
        CouponResponse coupon = couponService.updateCoupon(id, request);
        return ResponseEntity.ok(ApiResponse.success(coupon, "Cập nhật coupon thành công"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa coupon (Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa coupon thành công"));
    }

    @PostMapping("/validate")
    @Operation(summary = "Kiểm tra coupon có hợp lệ không")
    public ResponseEntity<ApiResponse<CouponResponse>> validateCoupon(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CouponValidationRequest request) {
        BigDecimal orderTotal = request.getOrderTotal() != null ?
                BigDecimal.valueOf(request.getOrderTotal()) : BigDecimal.ZERO;
        CouponResponse coupon = couponService.validateCouponForUser(request.getCode(), user, orderTotal);
        return ResponseEntity.ok(ApiResponse.success(coupon, "Coupon hợp lệ"));
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tìm kiếm coupon (Admin)")
    public ResponseEntity<ApiResponse<Page<CouponResponse>>> searchCoupons(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CouponResponse> coupons = couponService.searchCoupons(keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(coupons));
    }
}
