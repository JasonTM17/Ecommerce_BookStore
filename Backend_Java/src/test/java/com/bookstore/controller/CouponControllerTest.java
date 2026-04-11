package com.bookstore.controller;

import com.bookstore.dto.request.CouponRequest;
import com.bookstore.dto.request.CouponValidationRequest;
import com.bookstore.dto.response.ApiResponse;
import com.bookstore.dto.response.CouponResponse;
import com.bookstore.entity.CouponType;
import com.bookstore.entity.User;
import com.bookstore.repository.UserRepository;
import com.bookstore.service.CouponService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("CouponController")
class CouponControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CouponService couponService;

    @Autowired
    private UserRepository userRepository;

    private CouponResponse couponResponse;
    private User adminUser;

    @BeforeEach
    void setUp() {
        adminUser = userRepository.findByEmail("admin@bookstore.com")
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        couponResponse = CouponResponse.builder()
                .id(1L)
                .code("SAVE20")
                .description("Save 20% on your order")
                .type(CouponType.PERCENTAGE)
                .discountValue(BigDecimal.valueOf(20))
                .minOrderAmount(BigDecimal.valueOf(100000))
                .maxDiscount(BigDecimal.valueOf(50000))
                .usageLimit(100)
                .usedCount(0)
                .startDate(LocalDateTime.now().minusDays(1))
                .endDate(LocalDateTime.now().plusDays(30))
                .isActive(true)
                .build();
    }

    @Test
    @WithMockUser(username = "admin@bookstore.com", roles = {"ADMIN"})
    @DisplayName("POST /api/coupons - creates coupon as admin")
    void createCoupon_asAdmin() throws Exception {
        when(couponService.createCoupon(any(CouponRequest.class), any(User.class)))
                .thenReturn(couponResponse);

        CouponRequest request = CouponRequest.builder()
                .code("SAVE20")
                .type(CouponType.PERCENTAGE)
                .discountValue(BigDecimal.valueOf(20))
                .minOrderAmount(BigDecimal.valueOf(100000))
                .build();

        mockMvc.perform(post("/api/coupons")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.code").value("SAVE20"))
                .andExpect(jsonPath("$.data.discountValue").value(20));
    }

    @Test
    @DisplayName("GET /api/coupons/available - returns available coupons")
    void getAvailableCoupons_success() throws Exception {
        when(couponService.getAvailableCoupons()).thenReturn(List.of(couponResponse));

        mockMvc.perform(get("/api/coupons/available"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].code").value("SAVE20"));
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("POST /api/coupons/validate - validates coupon for user")
    void validateCoupon_success() throws Exception {
        when(couponService.validateCouponForUser(any(), any(), any()))
                .thenReturn(couponResponse);

        CouponValidationRequest request = CouponValidationRequest.builder()
                .code("SAVE20")
                .orderTotal(200000.0)
                .build();

        mockMvc.perform(post("/api/coupons/validate")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.code").value("SAVE20"))
                .andExpect(jsonPath("$.message").value("Coupon hợp lệ"));
    }

    @Test
    @WithMockUser(username = "admin@bookstore.com", roles = {"ADMIN"})
    @DisplayName("GET /api/coupons - returns paginated coupons for admin")
    void getAllCoupons_asAdmin() throws Exception {
        when(couponService.getAllCoupons(any())).thenReturn(new org.springframework.data.domain.PageImpl<>(List.of(couponResponse)));

        mockMvc.perform(get("/api/coupons")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("DELETE /api/coupons/{id} - returns 403 for non-admin")
    void deleteCoupon_asCustomer_forbidden() throws Exception {
        mockMvc.perform(delete("/api/coupons/1")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }
}
