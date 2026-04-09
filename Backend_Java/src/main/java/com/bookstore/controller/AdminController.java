package com.bookstore.controller;

import com.bookstore.dto.response.DashboardStats;
import com.bookstore.dto.response.PageResponse;
import com.bookstore.dto.response.UserResponse;
import com.bookstore.entity.Role;
import com.bookstore.service.DashboardService;
import com.bookstore.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Dashboard", description = "API bảng điều khiển quản trị")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final DashboardService dashboardService;
    private final UserService userService;

    @GetMapping("/dashboard")
    @Operation(summary = "Lấy thống kê dashboard")
    public ResponseEntity<DashboardStats> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }

    @GetMapping("/users")
    @Operation(summary = "Lấy danh sách người dùng")
    public ResponseEntity<PageResponse<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(userService.getAllUsers(page, size));
    }

    @GetMapping("/users/search")
    @Operation(summary = "Tìm kiếm người dùng")
    public ResponseEntity<PageResponse<UserResponse>> searchUsers(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(userService.searchUsers(keyword, page, size));
    }

    @PutMapping("/users/{id}/role")
    @Operation(summary = "Cập nhật vai trò người dùng")
    public ResponseEntity<UserResponse> updateUserRole(
            @PathVariable Long id,
            @RequestBody Set<Role> roles) {
        return ResponseEntity.ok(userService.updateUserRole(id, roles));
    }

    @PutMapping("/users/{id}/activate")
    @Operation(summary = "Kích hoạt người dùng")
    public ResponseEntity<Void> activateUser(@PathVariable Long id) {
        userService.activateUser(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/users/{id}/deactivate")
    @Operation(summary = "Vô hiệu hóa người dùng")
    public ResponseEntity<Void> deactivateUser(@PathVariable Long id) {
        userService.deactivateUser(id);
        return ResponseEntity.ok().build();
    }
}
