package com.bookstore.controller;

import com.bookstore.dto.request.BrandRequest;
import com.bookstore.dto.response.BrandResponse;
import com.bookstore.service.BrandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/brands")
@RequiredArgsConstructor
@Tag(name = "Brands", description = "API quản lý thương hiệu")
public class BrandController {

    private final BrandService brandService;

    @GetMapping
    @Operation(summary = "Lấy danh sách thương hiệu")
    public ResponseEntity<List<BrandResponse>> getAllBrands() {
        return ResponseEntity.ok(brandService.getAllBrands());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết thương hiệu")
    public ResponseEntity<BrandResponse> getBrandById(@PathVariable Long id) {
        return ResponseEntity.ok(brandService.getBrandById(id));
    }
}
