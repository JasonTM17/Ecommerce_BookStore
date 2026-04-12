package com.bookstore.controller;

import com.bookstore.dto.request.FlashSaleRequest;
import com.bookstore.dto.response.ApiResponse;
import com.bookstore.dto.response.FlashSaleResponse;
import com.bookstore.repository.ProductRepository;
import com.bookstore.service.FlashSaleService;
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
@DisplayName("FlashSaleController")
class FlashSaleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private FlashSaleService flashSaleService;

    @Autowired
    private ProductRepository productRepository;

    private FlashSaleResponse flashSaleResponse;

    @BeforeEach
    void setUp() {
        var testProduct = productRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No products found"));

        FlashSaleResponse.ProductInfo productInfo = FlashSaleResponse.ProductInfo.builder()
                .id(testProduct.getId())
                .name(testProduct.getName())
                .author(testProduct.getAuthor())
                .imageUrl(testProduct.getImageUrl())
                .build();

        flashSaleResponse = FlashSaleResponse.builder()
                .id(1L)
                .product(productInfo)
                .originalPrice(BigDecimal.valueOf(100000))
                .salePrice(BigDecimal.valueOf(80000))
                .discountPercent(BigDecimal.valueOf(20))
                .stockLimit(50)
                .soldCount(10)
                .remainingStock(40)
                .startTime(LocalDateTime.now())
                .endTime(LocalDateTime.now().plusHours(12))
                .isActive(true)
                .isCurrentlyActive(true)
                .isUpcoming(false)
                .maxPerUser(2)
                .build();
    }

    @Test
    @DisplayName("GET /api/flash-sales/active - returns active flash sales")
    void getActiveFlashSales_success() throws Exception {
        when(flashSaleService.getActiveFlashSales()).thenReturn(List.of(flashSaleResponse));

        mockMvc.perform(get("/flash-sales/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[0].discountPercent").value(20));
    }

    @Test
    @DisplayName("GET /api/flash-sales/upcoming - returns upcoming flash sales")
    void getUpcomingFlashSales_success() throws Exception {
        when(flashSaleService.getUpcomingFlashSales()).thenReturn(List.of());

        mockMvc.perform(get("/flash-sales/upcoming"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/flash-sales/{id} - returns flash sale by id")
    void getFlashSale_success() throws Exception {
        when(flashSaleService.getFlashSaleById(1L)).thenReturn(flashSaleResponse);

        mockMvc.perform(get("/flash-sales/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.salePrice").value(80000));
    }

    @Test
    @WithMockUser(username = "admin@bookstore.com", roles = {"ADMIN"})
    @DisplayName("GET /api/admin/flash-sales - returns all flash sales for admin")
    void getAllFlashSales_asAdmin() throws Exception {
        when(flashSaleService.getAllFlashSales(any()))
                .thenReturn(new org.springframework.data.domain.PageImpl<>(List.of(flashSaleResponse)));

        mockMvc.perform(get("/admin/flash-sales")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin@bookstore.com", roles = {"ADMIN"})
    @DisplayName("POST /api/admin/flash-sales - creates flash sale as admin")
    void createFlashSale_asAdmin() throws Exception {
        when(flashSaleService.createFlashSale(any(FlashSaleRequest.class)))
                .thenReturn(flashSaleResponse);

        var testProduct = productRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No products found"));

        FlashSaleRequest request = FlashSaleRequest.builder()
                .productId(testProduct.getId())
                .originalPrice(BigDecimal.valueOf(100000))
                .salePrice(BigDecimal.valueOf(80000))
                .stockLimit(50)
                .startTime(LocalDateTime.now())
                .endTime(LocalDateTime.now().plusHours(12))
                .maxPerUser(2)
                .build();

        mockMvc.perform(post("/admin/flash-sales")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.discountPercent").value(20));
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("POST /api/admin/flash-sales - returns 403 for non-admin")
    void createFlashSale_asCustomer_forbidden() throws Exception {
        FlashSaleRequest request = FlashSaleRequest.builder()
                .productId(1L)
                .originalPrice(BigDecimal.valueOf(100000))
                .salePrice(BigDecimal.valueOf(80000))
                .stockLimit(50)
                .startTime(LocalDateTime.now())
                .endTime(LocalDateTime.now().plusHours(12))
                .build();

        mockMvc.perform(post("/admin/flash-sales")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
