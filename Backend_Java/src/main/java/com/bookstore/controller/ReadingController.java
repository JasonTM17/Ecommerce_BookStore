package com.bookstore.controller;

import com.bookstore.dto.response.ApiResponse;
import com.bookstore.dto.response.ReadingProgressResponse;
import com.bookstore.dto.response.ReadingStatsResponse;
import com.bookstore.entity.User;
import com.bookstore.service.ReadingTrackerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Reading Tracker", description = "API theo dõi đọc sách")
@SecurityRequirement(name = "bearerAuth")
public class ReadingController {

    private final ReadingTrackerService readingService;

    @PostMapping("/api/reading/start/{productId}")
    @Operation(summary = "Bắt đầu đọc sách")
    public ResponseEntity<ApiResponse<ReadingProgressResponse>> startReading(
            @AuthenticationPrincipal User user, @PathVariable Long productId) {
        ReadingProgressResponse progress = readingService.startReading(productId, user);
        return ResponseEntity.ok(ApiResponse.success(progress, "Đã bắt đầu đọc sách"));
    }

    @GetMapping("/api/reading/progress")
    @Operation(summary = "Lấy danh sách tiến độ đọc")
    public ResponseEntity<ApiResponse<List<ReadingProgressResponse>>> getProgress(
            @AuthenticationPrincipal User user) {
        List<ReadingProgressResponse> progress = readingService.getUserProgress(user);
        return ResponseEntity.ok(ApiResponse.success(progress));
    }

    @PutMapping("/api/reading/progress/{id}")
    @Operation(summary = "Cập nhật trang đang đọc")
    public ResponseEntity<ApiResponse<ReadingProgressResponse>> updateProgress(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body) {
        int currentPage = body.get("currentPage");
        ReadingProgressResponse progress = readingService.updateProgress(id, currentPage, user);
        return ResponseEntity.ok(ApiResponse.success(progress, "Đã cập nhật tiến độ"));
    }

    @PostMapping("/api/reading/finish/{id}")
    @Operation(summary = "Hoàn thành sách")
    public ResponseEntity<ApiResponse<ReadingProgressResponse>> finishBook(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body) {
        Integer rating = body != null && body.get("rating") != null ? (Integer) body.get("rating") : null;
        String review = body != null ? (String) body.get("review") : null;
        ReadingProgressResponse progress = readingService.finishBook(id, rating, review, user);
        return ResponseEntity.ok(ApiResponse.success(progress, "Đã hoàn thành sách!"));
    }

    @GetMapping("/api/reading/stats")
    @Operation(summary = "Lấy thống kê đọc sách")
    public ResponseEntity<ApiResponse<ReadingStatsResponse>> getStats(
            @AuthenticationPrincipal User user) {
        ReadingStatsResponse stats = readingService.getUserStats(user);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
