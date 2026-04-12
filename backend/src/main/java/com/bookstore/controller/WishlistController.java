package com.bookstore.controller;

import com.bookstore.dto.response.ApiResponse;
import com.bookstore.dto.response.WishlistResponse;
import com.bookstore.entity.User;
import com.bookstore.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/wishlist")
@RequiredArgsConstructor
@Tag(name = "Wishlist", description = "API danh sách yêu thích")
@SecurityRequirement(name = "bearerAuth")
public class WishlistController {

    private final WishlistService wishlistService;

    @PostMapping("/{productId}")
    @Operation(summary = "Thêm sản phẩm vào wishlist")
    public ResponseEntity<ApiResponse<WishlistResponse>> addToWishlist(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId) {
        WishlistResponse wishlist = wishlistService.addToWishlist(user, productId);
        return ResponseEntity.ok(ApiResponse.success(wishlist, "Đã thêm vào danh sách yêu thích"));
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách wishlist của user")
    public ResponseEntity<ApiResponse<List<WishlistResponse>>> getWishlist(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "false") boolean paginated,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (paginated) {
            Pageable pageable = PageRequest.of(page, size);
            Page<WishlistResponse> wishlistPage = wishlistService.getUserWishlistPaginated(user, pageable);
            return ResponseEntity.ok(ApiResponse.success(wishlistPage.getContent()));
        }
        List<WishlistResponse> wishlists = wishlistService.getUserWishlist(user);
        return ResponseEntity.ok(ApiResponse.success(wishlists));
    }

    @GetMapping("/{productId}")
    @Operation(summary = "Kiểm tra sản phẩm có trong wishlist không")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkInWishlist(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId) {
        boolean isInWishlist = wishlistService.isInWishlist(user, productId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("isInWishlist", isInWishlist)));
    }

    @GetMapping("/count")
    @Operation(summary = "Lấy số lượng sản phẩm trong wishlist")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getWishlistCount(
            @AuthenticationPrincipal User user) {
        long count = wishlistService.getWishlistCount(user);
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", count)));
    }

    @DeleteMapping("/{productId}")
    @Operation(summary = "Xóa sản phẩm khỏi wishlist")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId) {
        wishlistService.removeFromWishlist(user, productId);
        return ResponseEntity.ok(ApiResponse.success(null, "Đã xóa khỏi danh sách yêu thích"));
    }

    @PatchMapping("/{productId}/notes")
    @Operation(summary = "Cập nhật ghi chú cho sản phẩm trong wishlist")
    public ResponseEntity<ApiResponse<Void>> updateNotes(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId,
            @RequestBody Map<String, String> body) {
        String notes = body.get("notes");
        wishlistService.updateWishlistNotes(user, productId, notes);
        return ResponseEntity.ok(ApiResponse.success(null, "Đã cập nhật ghi chú"));
    }

    @PatchMapping("/{productId}/priority")
    @Operation(summary = "Cập nhật độ ưu tiên sản phẩm trong wishlist")
    public ResponseEntity<ApiResponse<Void>> updatePriority(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId,
            @RequestBody Map<String, Integer> body) {
        Integer priority = body.get("priority");
        wishlistService.updateWishlistPriority(user, productId, priority);
        return ResponseEntity.ok(ApiResponse.success(null, "Đã cập nhật độ ưu tiên"));
    }
}
