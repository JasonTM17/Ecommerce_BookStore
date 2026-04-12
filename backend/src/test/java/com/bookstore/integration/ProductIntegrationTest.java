package com.bookstore.integration;

import com.bookstore.dto.request.ProductRequest;
import com.bookstore.entity.Brand;
import com.bookstore.entity.Category;
import com.bookstore.entity.User;
import com.bookstore.repository.BrandRepository;
import com.bookstore.repository.CategoryRepository;
import com.bookstore.repository.ProductRepository;
import com.bookstore.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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

    @Autowired
    private UserRepository userRepository;

    private Category testCategory;
    private Brand testBrand;
    private User adminUser;

    @BeforeEach
    void setUp() {
        testCategory = categoryRepository.findAll().stream().findFirst()
                .orElseGet(() -> categoryRepository.save(Category.builder()
                        .name("Test Category")
                        .description("Test description")
                        .isActive(true)
                        .sortOrder(0)
                        .build()));

        testBrand = brandRepository.findAll().stream().findFirst()
                .orElseGet(() -> brandRepository.save(Brand.builder()
                        .name("Test Brand")
                        .description("Test brand description")
                        .isActive(true)
                        .build()));

        adminUser = userRepository.findByEmail("admin@bookstore.com")
                .orElseThrow(() -> new RuntimeException("Admin user not found"));
    }

    @Test
    @DisplayName("POST /admin/products creates a product and GET /products/{id} returns it")
    void createAndGetProduct() throws Exception {
        ProductRequest request = ProductRequest.builder()
                .name("Integration Test Book")
                .description("A book created in integration test")
                .price(BigDecimal.valueOf(199000))
                .discountPrice(BigDecimal.valueOf(149000))
                .stockQuantity(100)
                .categoryId(testCategory.getId())
                .brandId(testBrand.getId())
                .author("Test Author")
                .isbn("978-3-16-148410-0")
                .publisher("Test Publisher")
                .publishedYear(2024)
                .pageCount(350)
                .weightGrams(500)
                .dimensions("14x21 cm")
                .language("Vietnamese")
                .build();

        String response = mockMvc.perform(post("/admin/products")
                        .with(user(adminUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        long productId = objectMapper.readTree(response).path("id").asLong();
        assertThat(productRepository.existsById(productId)).isTrue();

        mockMvc.perform(get("/products/" + productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(productId))
                .andExpect(jsonPath("$.name").value("Integration Test Book"));
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
    @DisplayName("GET /products/{id} returns a product by id")
    void getProductById() throws Exception {
        var existingProduct = productRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No products found"));

        mockMvc.perform(get("/products/" + existingProduct.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(existingProduct.getName()));
    }

    @Test
    @DisplayName("GET /products filters by category")
    void getProducts_byCategory() throws Exception {
        mockMvc.perform(get("/products")
                        .param("categoryId", testCategory.getId().toString())
                        .param("page", "0")
                        .param("size", "12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @DisplayName("GET /products searches by keyword")
    void getProducts_search() throws Exception {
        mockMvc.perform(get("/products")
                        .param("keyword", "test")
                        .param("page", "0")
                        .param("size", "12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }
}
