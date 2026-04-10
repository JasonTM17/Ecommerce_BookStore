package com.bookstore.controller;

import com.bookstore.dto.response.ApiResponse;
import com.bookstore.dto.response.PaymentResponse;
import com.bookstore.entity.User;
import com.bookstore.service.VNPayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "API thanh toán VNPay")
@SecurityRequirement(name = "bearerAuth")
public class PaymentController {

    private final VNPayService vnPayService;

    @PostMapping("/vnpay/create")
    @Operation(summary = "Tạo thanh toán VNPay")
    public ResponseEntity<ApiResponse<PaymentResponse>> createVNPayPayment(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> request) {
        Long orderId = Long.valueOf(request.get("orderId").toString());
        String ipAddress = request.get("ipAddress") != null ? request.get("ipAddress").toString() : "127.0.0.1";
        PaymentResponse response = vnPayService.createPayment(orderId, ipAddress);
        return ResponseEntity.ok(ApiResponse.success(response, response.getMessage()));
    }

    @GetMapping("/vnpay/return")
    @Operation(summary = "VNPay return URL - client redirect")
    public ResponseEntity<ApiResponse<PaymentResponse>> handleReturn(@RequestParam Map<String, String> params) {
        PaymentResponse response = vnPayService.handleReturn(new java.util.HashMap<>(params));
        if (response.isSuccess()) {
            return ResponseEntity.ok(ApiResponse.success(response, response.getMessage()));
        }
        return ResponseEntity.badRequest().body(ApiResponse.error(response.getMessage()));
    }

    @PostMapping("/vnpay/ipn")
    @Operation(summary = "VNPay IPN - server to server callback")
    public ResponseEntity<PaymentResponse> handleIPN(@RequestParam Map<String, String> params) {
        PaymentResponse response = vnPayService.handleIPN(new java.util.HashMap<>(params));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{orderId}/status")
    @Operation(summary = "Kiểm tra trạng thái thanh toán")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPaymentStatus(
            @AuthenticationPrincipal User user,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success(Map.of("orderId", orderId, "status", "check_with_repository")));
    }

    @PostMapping("/{orderId}/refund")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Hoàn tiền (Admin)")
    public ResponseEntity<ApiResponse<PaymentResponse>> refund(
            @PathVariable Long orderId,
            @RequestBody Map<String, Object> request) {
        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        String reason = request.get("reason") != null ? request.get("reason").toString() : "Customer request";
        PaymentResponse response = vnPayService.refund(orderId, amount, reason);
        return ResponseEntity.ok(ApiResponse.success(response, response.getMessage()));
    }
}
