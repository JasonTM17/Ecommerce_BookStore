package com.bookstore.controller;

import com.bookstore.dto.request.ReviewRequest;
import com.bookstore.dto.response.PageResponse;
import com.bookstore.dto.response.ReviewResponse;
import com.bookstore.entity.User;
import com.bookstore.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "API đánh giá sản phẩm")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/product/{productId}")
    @Operation(summary = "Lấy đánh giá theo sản phẩm")
    public ResponseEntity<PageResponse<ReviewResponse>> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId, page, size));
    }

    @PostMapping
    @Operation(summary = "Tạo đánh giá")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ReviewResponse> createReview(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.createReview(user, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa đánh giá")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Void> deleteReview(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        reviewService.deleteReview(id, user);
        return ResponseEntity.noContent().build();
    }
}
