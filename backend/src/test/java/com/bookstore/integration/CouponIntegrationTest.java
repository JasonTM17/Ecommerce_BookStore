package com.bookstore.integration;

import com.bookstore.entity.User;
import com.bookstore.entity.Role;
import com.bookstore.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("Coupon flow integration tests")
class CouponIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User adminUser;
    private User customerUser;

    @BeforeEach
    void setUp() {
        adminUser = userRepository.findByEmail("admin@bookstore.com")
                .orElseGet(() -> userRepository.save(User.builder()
                        .email("admin@bookstore.com")
                        .password(passwordEncoder.encode("Admin123!"))
                        .firstName("Admin")
                        .phoneNumber("0901234567")
                        .isActive(true)
                        .isEmailVerified(true)
                        .roles(new HashSet<>(Set.of(Role.ADMIN)))
                        .build()));
        customerUser = userRepository.findByEmail("customer@example.com")
                .orElseGet(() -> userRepository.save(User.builder()
                        .email("customer@example.com")
                        .password(passwordEncoder.encode("Customer123!"))
                        .firstName("Customer Test")
                        .phoneNumber("0903456789")
                        .isActive(true)
                        .isEmailVerified(true)
                        .roles(new HashSet<>(Set.of(Role.CUSTOMER)))
                        .build()));
    }

    @Test
    @DisplayName("POST /api/coupons creates a coupon and GET /api/coupons/available returns data")
    void createAndValidateCoupon() throws Exception {
        String couponBody = """
                {
                  "code": "TESTCODE%d",
                  "description": "Test coupon",
                  "type": "PERCENTAGE",
                  "discountValue": 15,
                  "minOrderAmount": 50000,
                  "maxDiscount": 30000,
                  "usageLimit": 100,
                  "perUserLimit": 1,
                  "endDate": "2099-12-31T23:59:59",
                  "isPublic": true
                }
                """.formatted(System.nanoTime());

        mockMvc.perform(post("/coupons")
                        .with(user(adminUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(couponBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.code").exists())
                .andExpect(jsonPath("$.data.discountValue").value(15));

        mockMvc.perform(get("/coupons/available"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("POST /api/coupons/validate validates a coupon for a customer")
    void validateCoupon_forUser() throws Exception {
        mockMvc.perform(post("/coupons")
                        .with(user(adminUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "code": "VALIDATETEST",
                                  "description": "Validate test",
                                  "type": "FIXED_AMOUNT",
                                  "discountValue": 20000,
                                  "minOrderAmount": 50000,
                                  "maxDiscount": 20000,
                                  "usageLimit": 100,
                                  "perUserLimit": 1,
                                  "endDate": "2099-12-31T23:59:59",
                                  "isPublic": true
                                }
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(post("/coupons/validate")
                        .with(user(customerUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "code": "VALIDATETEST",
                                  "orderTotal": 100000.0
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.code").value("VALIDATETEST"))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("GET /api/coupons/available returns active coupons")
    void getAvailableCoupons_onlyActive() throws Exception {
        mockMvc.perform(get("/coupons/available"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("GET /api/coupons returns paginated coupons for an admin")
    void getAllCoupons_asAdmin() throws Exception {
        mockMvc.perform(get("/coupons")
                        .with(user(adminUser))
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.totalElements").isNumber());
    }
}
