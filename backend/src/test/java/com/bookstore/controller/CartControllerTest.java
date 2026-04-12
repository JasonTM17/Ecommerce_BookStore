package com.bookstore.controller;

import com.bookstore.dto.request.CartItemRequest;
import com.bookstore.dto.response.CartItemResponse;
import com.bookstore.dto.response.CartResponse;
import com.bookstore.dto.response.ProductResponse;
import com.bookstore.dto.response.UserResponse;
import com.bookstore.entity.User;
import com.bookstore.repository.UserRepository;
import com.bookstore.service.CartService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("CartController")
class CartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CartService cartService;

    @Autowired
    private UserRepository userRepository;

    private CartResponse cartResponse;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = userRepository.findByEmail("customer@example.com")
                .orElseThrow(() -> new RuntimeException("Test user not found"));

        ProductResponse product = ProductResponse.builder()
                .id(1L)
                .name("Test Book")
                .author("Test Author")
                .price(BigDecimal.valueOf(100000))
                .currentPrice(BigDecimal.valueOf(100000))
                .imageUrl("https://example.com/book.jpg")
                .stockQuantity(100)
                .inStock(true)
                .build();

        CartItemResponse item = CartItemResponse.builder()
                .id(1L)
                .product(product)
                .quantity(2)
                .subtotal(BigDecimal.valueOf(200000))
                .sortOrder(0)
                .build();

        UserResponse userResponse = UserResponse.builder()
                .id(testUser.getId())
                .email(testUser.getEmail())
                .fullName(testUser.getFullName())
                .build();

        cartResponse = CartResponse.builder()
                .id(1L)
                .user(userResponse)
                .items(List.of(item))
                .totalItems(1)
                .subtotal(BigDecimal.valueOf(200000))
                .total(BigDecimal.valueOf(200000))
                .build();
    }

    @Test
    @DisplayName("GET /cart - returns 200 with cart data")
    void getCart_success() throws Exception {
        when(cartService.getCart(any(User.class))).thenReturn(cartResponse);

        mockMvc.perform(get("/cart").with(user(testUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(1))
                .andExpect(jsonPath("$.items[0].product.name").value("Test Book"));
    }

    @Test
    @DisplayName("GET /cart - returns 401 when not authenticated")
    void getCart_unauthenticated() throws Exception {
        mockMvc.perform(get("/cart"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /cart/items - adds item to cart")
    void addItem_success() throws Exception {
        when(cartService.addToCart(any(User.class), any(CartItemRequest.class))).thenReturn(cartResponse);

        CartItemRequest request = CartItemRequest.builder()
                .productId(1L)
                .quantity(2)
                .build();

        mockMvc.perform(post("/cart/items")
                        .with(user(testUser))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("DELETE /cart/items/{id} - removes item from cart")
    void removeItem_success() throws Exception {
        when(cartService.removeFromCart(any(User.class), any(Long.class))).thenReturn(cartResponse);

        mockMvc.perform(delete("/cart/items/1")
                        .with(user(testUser))
                        .with(csrf()))
                .andExpect(status().isOk());
    }
}
