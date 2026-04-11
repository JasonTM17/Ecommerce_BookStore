package com.bookstore.integration;

import com.bookstore.entity.Product;
import com.bookstore.entity.User;
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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("Cart flow integration tests")
class CartIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    private User customerUser;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        customerUser = userRepository.findByEmail("customer@example.com")
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        testProduct = productRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No products found"));
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("POST /cart/items adds product and GET /cart returns updated cart")
    void addToCart_andGetCart() throws Exception {
        String addBody = """
                {
                  "productId": %d,
                  "quantity": 2
                }
                """.formatted(testProduct.getId());

        mockMvc.perform(post("/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(addBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").isNumber());

        mockMvc.perform(get("/cart"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray());
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("PUT /cart/items/{id} updates item quantity")
    void updateCartItem() throws Exception {
        mockMvc.perform(post("/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "productId": %d,
                                  "quantity": 1
                                }
                                """.formatted(testProduct.getId())))
                .andExpect(status().isOk());

        mockMvc.perform(get("/cart"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].quantity").value(1));
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("DELETE /cart clears all items")
    void clearCart() throws Exception {
        mockMvc.perform(post("/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "productId": %d,
                                  "quantity": 1
                                }
                                """.formatted(testProduct.getId())))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/cart"))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/cart"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isEmpty())
                .andExpect(jsonPath("$.totalItems").value(0));
    }

    @Test
    @DisplayName("GET /cart returns 401 when not authenticated")
    void getCart_unauthenticated() throws Exception {
        mockMvc.perform(get("/cart"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("GET /cart returns empty cart for new user")
    void getCart_emptyForNewUser() throws Exception {
        mockMvc.perform(get("/cart"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray());
    }
}
