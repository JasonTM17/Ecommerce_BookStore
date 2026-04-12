package com.bookstore.controller;

import com.bookstore.dto.response.ApiResponse;
import com.bookstore.service.StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/uploads")
@RequiredArgsConstructor
@Tag(name = "File Upload", description = "API upload file và quản lý media")
public class FileController {

    private final StorageService storageService;

    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload một file ảnh", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<String>> uploadImage(
            @RequestParam("file") MultipartFile file) {
        String fileUrl = storageService.uploadFile(file, "products");
        return ResponseEntity.ok(ApiResponse.success(fileUrl, "Upload ảnh thành công"));
    }

    @PostMapping(value = "/images/multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload nhiều file ảnh", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<List<String>>> uploadMultipleImages(
            @RequestParam("files") MultipartFile[] files) {
        List<String> fileUrls = storageService.uploadMultipleFiles(files);
        return ResponseEntity.ok(ApiResponse.success(fileUrls, "Upload ảnh thành công"));
    }

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload ảnh đại diện người dùng", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<String>> uploadAvatar(
            @RequestParam("file") MultipartFile file) {
        String fileUrl = storageService.uploadFile(file, "avatars");
        return ResponseEntity.ok(ApiResponse.success(fileUrl, "Upload avatar thành công"));
    }

    @DeleteMapping
    @Operation(summary = "Xóa file ảnh", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteImage(@RequestParam("url") String fileUrl) {
        storageService.deleteFile(fileUrl);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa ảnh thành công"));
    }
}
