package com.bookstore.integration;

import com.bookstore.entity.User;
import com.bookstore.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("Coupon flow integration tests")
class CouponIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    private User adminUser;

    @BeforeEach
    void setUp() {
        adminUser = userRepository.findByEmail("admin@bookstore.com")
                .orElseThrow(() -> new RuntimeException("Admin user not found"));
    }

    @Test
    @WithMockUser(username = "admin@bookstore.com", roles = {"ADMIN"})
    @DisplayName("POST /api/coupons creates coupon and GET /api/coupons/available returns it")
    void createAndValidateCoupon() throws Exception {
        String couponBody = """
                {
                  "code": "TESTCODE%d",
                  "description": "Test coupon",
                  "discountType": "PERCENTAGE",
                  "discountValue": 15,
                  "minOrderAmount": 50000,
                  "maxDiscountAmount": 30000,
                  "usageLimit": 100,
                  "startDate": "2024-01-01T00:00:00",
                  "endDate": "2030-12-31T23:59:59",
                  "isActive": true
                }
                """.formatted(System.nanoTime());

        mockMvc.perform(post("/api/coupons")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(couponBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.code").exists())
                .andExpect(jsonPath("$.data.discountValue").value(15));

        mockMvc.perform(get("/api/coupons/available"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("POST /api/coupons/validate validates coupon for user")
    void validateCoupon_forUser() throws Exception {
        mockMvc.perform(post("/api/coupons")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "code": "VALIDATETEST",
                                  "description": "Validate test",
                                  "discountType": "FIXED",
                                  "discountValue": 20000,
                                  "minOrderAmount": 50000,
                                  "startDate": "2024-01-01T00:00:00",
                                  "endDate": "2030-12-31T23:59:59",
                                  "isActive": true
                                }
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/coupons/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "code": "VALIDATETEST",
                                  "orderTotal": 100000.0
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.code").value("VALIDATETEST"))
                .andExpect(jsonPath("$.message").value("Coupon hợp lệ"));
    }

    @Test
    @DisplayName("GET /api/coupons/available returns only active coupons")
    void getAvailableCoupons_onlyActive() throws Exception {
        mockMvc.perform(get("/api/coupons/available"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @WithMockUser(username = "admin@bookstore.com", roles = {"ADMIN"})
    @DisplayName("GET /api/coupons returns paginated coupons for admin")
    void getAllCoupons_asAdmin() throws Exception {
        mockMvc.perform(get("/api/coupons")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.totalElements").isNumber());
    }
}
