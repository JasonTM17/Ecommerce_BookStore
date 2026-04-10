package com.bookstore.controller;

import com.bookstore.dto.response.ApiResponse;
import com.bookstore.dto.response.WishlistResponse;
import com.bookstore.entity.User;
import com.bookstore.repository.UserRepository;
import com.bookstore.service.WishlistService;
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
import java.util.Map;

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
@DisplayName("WishlistController")
class WishlistControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private WishlistService wishlistService;

    @Autowired
    private UserRepository userRepository;

    private WishlistResponse wishlistResponse;

    @BeforeEach
    void setUp() {
        wishlistResponse = WishlistResponse.builder()
                .id(1L)
                .productId(1L)
                .productName("Test Book")
                .productImage("https://example.com/book.jpg")
                .productPrice(BigDecimal.valueOf(150000))
                .addedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("POST /api/wishlist/{productId} - adds product to wishlist")
    void addToWishlist_success() throws Exception {
        when(wishlistService.addToWishlist(any(User.class), eq(1L)))
                .thenReturn(wishlistResponse);

        mockMvc.perform(post("/api/wishlist/1")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.productName").value("Test Book"))
                .andExpect(jsonPath("$.message").value("Đã thêm vào danh sách yêu thích"));
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("GET /api/wishlist - returns user wishlist")
    void getWishlist_success() throws Exception {
        when(wishlistService.getUserWishlist(any(User.class)))
                .thenReturn(List.of(wishlistResponse));

        mockMvc.perform(get("/api/wishlist"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].productName").value("Test Book"));
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("GET /api/wishlist/{productId} - checks if product is in wishlist")
    void checkInWishlist_success() throws Exception {
        when(wishlistService.isInWishlist(any(User.class), eq(1L)))
                .thenReturn(true);

        mockMvc.perform(get("/api/wishlist/1")
                        .param("check", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isInWishlist").value(true));
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("DELETE /api/wishlist/{productId} - removes product from wishlist")
    void removeFromWishlist_success() throws Exception {
        mockMvc.perform(delete("/api/wishlist/1")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Đã xóa khỏi danh sách yêu thích"));
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("PATCH /api/wishlist/{productId}/notes - updates wishlist notes")
    void updateNotes_success() throws Exception {
        mockMvc.perform(patch("/api/wishlist/1/notes")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("notes", "Want to buy later"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Đã cập nhật ghi chú"));
    }

    @Test
    @DisplayName("GET /api/wishlist - returns 401 when not authenticated")
    void getWishlist_unauthenticated() throws Exception {
        mockMvc.perform(get("/api/wishlist"))
                .andExpect(status().isUnauthorized());
    }
}
