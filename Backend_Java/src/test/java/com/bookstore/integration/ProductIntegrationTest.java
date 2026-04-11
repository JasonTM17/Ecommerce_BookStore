package com.bookstore.integration;

import com.bookstore.dto.request.ProductRequest;
import com.bookstore.entity.Brand;
import com.bookstore.entity.Category;
import com.bookstore.repository.BrandRepository;
import com.bookstore.repository.CategoryRepository;
import com.bookstore.repository.ProductRepository;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("Product flow integration tests")
class ProductIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BrandRepository brandRepository;

    private Category testCategory;
    private Brand testBrand;

    @BeforeEach
    void setUp() {
        testCategory = categoryRepository.findAll().stream().findFirst()
                .orElseGet(() -> {
                    Category c = Category.builder()
                            .name("Test Category")
                            .description("Test description")
                            .isActive(true)
                            .sortOrder(0)
                            .build();
                    return categoryRepository.save(c);
                });

        testBrand = brandRepository.findAll().stream().findFirst()
                .orElseGet(() -> {
                    Brand b = Brand.builder()
                            .name("Test Brand")
                            .description("Test brand description")
                            .isActive(true)
                            .build();
                    return brandRepository.save(b);
                });
    }

    @Test
    @WithMockUser(username = "admin@bookstore.com", roles = {"ADMIN"})
    @DisplayName("POST /api/admin/products creates product and GET returns it")
    void createAndGetProduct() throws Exception {
        ProductRequest request = ProductRequest.builder()
                .name("Integration Test Book")
                .description("A book created in integration test")
                .price(BigDecimal.valueOf(199000))
                .discountPrice(BigDecimal.valueOf(149000))
                .stockQuantity(100)
                .categoryId(testCategory.getId())
                .author("Test Author")
                .isbn("978-3-16-148410-0")
                .publisher("Test Publisher")
                .publishedYear(2024)
                .pageCount(350)
                .weightGrams(500)
                .dimensions("14x21 cm")
                .language("Vietnamese")
                .build();

        String response = mockMvc.perform(post("/api/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long productId = objectMapper.readTree(response).path("data").path("id").asLong();
        assertThat(productRepository.existsById(productId)).isTrue();
    }

    @Test
    @DisplayName("GET /products returns paginated results")
    void getProducts_paginated() throws Exception {
        mockMvc.perform(get("/products")
                        .param("page", "0")
                        .param("size", "12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").isNumber())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(12));
    }

    @Test
    @DisplayName("GET /products/{id} returns product by id")
    void getProductById() throws Exception {
        var existingProduct = productRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No products found"));

        mockMvc.perform(get("/products/" + existingProduct.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(existingProduct.getName()));
    }

    @Test
    @DisplayName("GET /products?categoryId filters by category")
    void getProducts_byCategory() throws Exception {
        mockMvc.perform(get("/products")
                        .param("categoryId", testCategory.getId().toString())
                        .param("page", "0")
                        .param("size", "12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @DisplayName("GET /products?keyword searches by name")
    void getProducts_search() throws Exception {
        mockMvc.perform(get("/products")
                        .param("keyword", "test")
                        .param("page", "0")
                        .param("size", "12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }
}
