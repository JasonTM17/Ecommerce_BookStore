package com.bookstore.controller;

import com.bookstore.dto.request.AddressRequest;
import com.bookstore.dto.response.AddressResponse;
import com.bookstore.entity.User;
import com.bookstore.service.AddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/addresses")
@RequiredArgsConstructor
@Tag(name = "Addresses", description = "API địa chỉ giao hàng")
@SecurityRequirement(name = "bearerAuth")
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    @Operation(summary = "Lấy danh sách địa chỉ")
    public ResponseEntity<List<AddressResponse>> getUserAddresses(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(addressService.getUserAddresses(user));
    }

    @PostMapping
    @Operation(summary = "Tạo địa chỉ mới")
    public ResponseEntity<AddressResponse> createAddress(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.ok(addressService.createAddress(user, request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật địa chỉ")
    public ResponseEntity<AddressResponse> updateAddress(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.ok(addressService.updateAddress(user, id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa địa chỉ")
    public ResponseEntity<Void> deleteAddress(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        addressService.deleteAddress(user, id);
        return ResponseEntity.noContent().build();
    }
}
