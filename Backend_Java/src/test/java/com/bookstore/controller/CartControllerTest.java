package com.bookstore.controller;

import com.bookstore.dto.request.CartItemRequest;
import com.bookstore.dto.response.CartItemResponse;
import com.bookstore.dto.response.CartResponse;
import com.bookstore.entity.Product;
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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
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

        CartItemResponse item = CartItemResponse.builder()
                .id(1L)
                .productId(1L)
                .productName("Test Book")
                .productImage("https://example.com/book.jpg")
                .quantity(2)
                .price(BigDecimal.valueOf(100000))
                .subtotal(BigDecimal.valueOf(200000))
                .build();

        cartResponse = CartResponse.builder()
                .id(1L)
                .userId(testUser.getId())
                .items(List.of(item))
                .totalItems(1)
                .total(BigDecimal.valueOf(200000))
                .build();
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("GET /cart - returns 200 with cart data")
    void getCart_success() throws Exception {
        when(cartService.getCart(any(User.class))).thenReturn(cartResponse);

        mockMvc.perform(get("/cart"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(1))
                .andExpect(jsonPath("$.items[0].productName").value("Test Book"));
    }

    @Test
    @DisplayName("GET /cart - returns 401 when not authenticated")
    void getCart_unauthenticated() throws Exception {
        mockMvc.perform(get("/cart"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("POST /cart/items - returns 200 when adding item")
    void addToCart_success() throws Exception {
        when(cartService.addToCart(any(User.class), any(CartItemRequest.class)))
                .thenReturn(cartResponse);

        CartItemRequest request = CartItemRequest.builder()
                .productId(1L)
                .quantity(2)
                .build();

        mockMvc.perform(post("/cart/items")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(1));
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("PUT /cart/items/{id} - returns 200 when updating quantity")
    void updateCartItem_success() throws Exception {
        when(cartService.updateCartItem(any(User.class), eq(1L), eq(5)))
                .thenReturn(cartResponse);

        mockMvc.perform(put("/cart/items/1")
                        .with(csrf())
                        .param("quantity", "5"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("DELETE /cart/items/{id} - returns 200 when removing item")
    void removeFromCart_success() throws Exception {
        when(cartService.removeFromCart(any(User.class), eq(1L)))
                .thenReturn(cartResponse);

        mockMvc.perform(delete("/cart/items/1")
                        .with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("DELETE /cart - returns 204 when clearing cart")
    void clearCart_success() throws Exception {
        mockMvc.perform(delete("/cart")
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }
}
