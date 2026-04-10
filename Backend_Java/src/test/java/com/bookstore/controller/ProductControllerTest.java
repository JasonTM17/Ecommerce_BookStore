package com.bookstore.controller;

import com.bookstore.dto.response.PageResponse;
import com.bookstore.dto.response.ProductResponse;
import com.bookstore.service.ProductService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("ProductController")
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

    @Test
    @DisplayName("GET /products - returns paginated products")
    void getProducts_success() throws Exception {
        ProductResponse product = ProductResponse.builder()
                .id(1L)
                .name("Test Book")
                .slug("test-book")
                .price(BigDecimal.valueOf(150000))
                .currentPrice(BigDecimal.valueOf(120000))
                .stockQuantity(50)
                .inStock(true)
                .avgRating(4.5)
                .reviewCount(10)
                .build();

        PageResponse<ProductResponse> page = PageResponse.<ProductResponse>builder()
                .content(List.of(product))
                .totalElements(1L)
                .totalPages(1)
                .page(0)
                .size(12)
                .first(true)
                .last(true)
                .build();

        when(productService.searchProducts(
                any(), any(), any(), any(), any(), any(), any(), any(), any(int.class), any(int.class)))
                .thenReturn(page);

        mockMvc.perform(get("/products")
                        .param("page", "0")
                        .param("size", "12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Test Book"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /products?keyword=java - returns filtered products")
    void getProducts_withKeyword() throws Exception {
        ProductResponse product = ProductResponse.builder()
                .id(2L)
                .name("Java Programming")
                .slug("java-programming")
                .price(BigDecimal.valueOf(200000))
                .currentPrice(BigDecimal.valueOf(180000))
                .stockQuantity(30)
                .inStock(true)
                .build();

        PageResponse<ProductResponse> page = PageResponse.<ProductResponse>builder()
                .content(List.of(product))
                .totalElements(1L)
                .totalPages(1)
                .page(0)
                .size(12)
                .first(true)
                .last(true)
                .build();

        when(productService.searchProducts(
                any(), any(), any(), any(), any(), any(), any(), any(), any(int.class), any(int.class)))
                .thenReturn(page);

        mockMvc.perform(get("/products")
                        .param("keyword", "java")
                        .param("page", "0")
                        .param("size", "12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Java Programming"));
    }

    @Test
    @DisplayName("GET /products/featured - returns featured products")
    void getFeaturedProducts_success() throws Exception {
        ProductResponse product = ProductResponse.builder()
                .id(1L)
                .name("Featured Book")
                .slug("featured-book")
                .price(BigDecimal.valueOf(100000))
                .currentPrice(BigDecimal.valueOf(90000))
                .inStock(true)
                .isFeatured(true)
                .build();

        when(productService.getFeaturedProducts()).thenReturn(List.of(product));

        mockMvc.perform(get("/products/featured"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Featured Book"));
    }

    @Test
    @DisplayName("GET /products/new - returns new products")
    void getNewProducts_success() throws Exception {
        when(productService.getNewProducts()).thenReturn(List.of());

        mockMvc.perform(get("/products/new"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /products/{id} - returns product by id")
    void getProductById_success() throws Exception {
        ProductResponse product = ProductResponse.builder()
                .id(1L)
                .name("Test Book")
                .slug("test-book")
                .price(BigDecimal.valueOf(150000))
                .currentPrice(BigDecimal.valueOf(120000))
                .stockQuantity(50)
                .inStock(true)
                .build();

        when(productService.getProductById(1L)).thenReturn(product);

        mockMvc.perform(get("/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Book"))
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @DisplayName("GET /products/{id} - returns 404 for non-existent product")
    void getProductById_notFound() throws Exception {
        when(productService.getProductById(999L))
                .thenThrow(new RuntimeException("Product not found"));

        mockMvc.perform(get("/products/999"))
                .andExpect(status().isNotFound());
    }
}
