package com.bookstore.controller;

import com.bookstore.dto.response.ApiResponse;
import com.bookstore.dto.response.BookClubResponse;
import com.bookstore.entity.User;
import com.bookstore.service.BookClubService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Book Club", description = "API Cộng đồng đọc sách")
@SecurityRequirement(name = "bearerAuth")
public class BookClubController {

    private final BookClubService clubService;

    @PostMapping("/api/clubs")
    @Operation(summary = "Tạo club mới")
    public ResponseEntity<ApiResponse<BookClubResponse>> createClub(
            @AuthenticationPrincipal User user, @RequestBody Map<String, String> body) {
        var club = clubService.createClub(body.get("name"), body.get("description"), user);
        return ResponseEntity.ok(ApiResponse.success(club, "Club đã được tạo"));
    }

    @GetMapping("/api/clubs")
    @Operation(summary = "Lấy danh sách club công khai")
    public ResponseEntity<ApiResponse<Page<BookClubResponse>>> getClubs(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(clubService.getPublicClubs(PageRequest.of(page, size))));
    }

    @GetMapping("/api/clubs/{id}")
    @Operation(summary = "Lấy chi tiết club")
    public ResponseEntity<ApiResponse<BookClubResponse>> getClub(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(clubService.getClub(id)));
    }

    @PostMapping("/api/clubs/{id}/join")
    @Operation(summary = "Tham gia club")
    public ResponseEntity<ApiResponse<Void>> joinClub(
            @AuthenticationPrincipal User user, @PathVariable Long id) {
        clubService.joinClub(id, user);
        return ResponseEntity.ok(ApiResponse.success(null, "Đã tham gia club"));
    }

    @PostMapping("/api/clubs/{id}/leave")
    @Operation(summary = "Rời club")
    public ResponseEntity<ApiResponse<Void>> leaveClub(
            @AuthenticationPrincipal User user, @PathVariable Long id) {
        clubService.leaveClub(id, user);
        return ResponseEntity.ok(ApiResponse.success(null, "Đã rời club"));
    }

    @GetMapping("/api/clubs/{id}/members")
    @Operation(summary = "Lấy danh sách thành viên")
    public ResponseEntity<ApiResponse<List<BookClubResponse.BookClubMemberResponse>>> getMembers(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(clubService.getMembers(id)));
    }
}
