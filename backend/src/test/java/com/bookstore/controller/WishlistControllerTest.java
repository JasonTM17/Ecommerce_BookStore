package com.bookstore.controller;

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
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = userRepository.findByEmail("customer@example.com")
                .orElseThrow(() -> new RuntimeException("Customer user not found"));

        WishlistResponse.ProductInfo productInfo = WishlistResponse.ProductInfo.builder()
                .id(1L)
                .name("Test Book")
                .author("Test Author")
                .imageUrl("https://example.com/book.jpg")
                .price(BigDecimal.valueOf(150000))
                .currentPrice(BigDecimal.valueOf(150000))
                .stockQuantity(100)
                .avgRating(4.5)
                .reviewCount(10)
                .build();

        wishlistResponse = WishlistResponse.builder()
                .id(1L)
                .product(productInfo)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("POST /api/wishlist/{productId} adds a product")
    void addToWishlist_success() throws Exception {
        when(wishlistService.addToWishlist(any(User.class), eq(1L)))
                .thenReturn(wishlistResponse);

        mockMvc.perform(post("/wishlist/1")
                        .with(user(testUser))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.product.name").value("Test Book"))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("GET /api/wishlist returns wrapped wishlist data")
    void getWishlist_success() throws Exception {
        when(wishlistService.getUserWishlist(any(User.class)))
                .thenReturn(List.of(wishlistResponse));

        mockMvc.perform(get("/wishlist").with(user(testUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].product.name").value("Test Book"));
    }

    @Test
    @DisplayName("DELETE /api/wishlist/{productId} removes a product")
    void removeFromWishlist_success() throws Exception {
        mockMvc.perform(delete("/wishlist/1")
                        .with(user(testUser))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("PATCH /api/wishlist/{productId}/notes updates notes")
    void updateNotes_success() throws Exception {
        mockMvc.perform(patch("/wishlist/1/notes")
                        .with(user(testUser))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("notes", "Want to buy later"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("GET /api/wishlist returns 401 when unauthenticated")
    void getWishlist_unauthenticated() throws Exception {
        mockMvc.perform(get("/wishlist"))
                .andExpect(status().isUnauthorized());
    }
}
