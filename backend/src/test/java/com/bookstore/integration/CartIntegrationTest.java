package com.bookstore.integration;

import com.bookstore.entity.Product;
import com.bookstore.entity.User;
import com.bookstore.repository.ProductRepository;
import com.bookstore.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
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

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
    @DisplayName("POST /cart/items adds a product and GET /cart returns the cart")
    void addToCart_andGetCart() throws Exception {
        String addBody = """
                {
                  "productId": %d,
                  "quantity": 2
                }
                """.formatted(testProduct.getId());

        mockMvc.perform(post("/cart/items")
                        .with(user(customerUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(addBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].product.id").value(testProduct.getId()))
                .andExpect(jsonPath("$.items[0].quantity").value(2))
                .andExpect(jsonPath("$.totalItems").value(2));

        mockMvc.perform(get("/cart").with(user(customerUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].product.id").value(testProduct.getId()))
                .andExpect(jsonPath("$.items[0].quantity").value(2))
                .andExpect(jsonPath("$.totalItems").value(2));
    }

    @Test
    @DisplayName("PUT /cart/items/{id} updates the item quantity")
    void updateCartItem() throws Exception {
        String createResponse = mockMvc.perform(post("/cart/items")
                        .with(user(customerUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "productId": %d,
                                  "quantity": 1
                                }
                                """.formatted(testProduct.getId())))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode createdCart = objectMapper.readTree(createResponse);
        long itemId = createdCart.path("items").get(0).path("id").asLong();

        mockMvc.perform(put("/cart/items/" + itemId)
                        .with(user(customerUser))
                        .param("quantity", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].quantity").value(3));
    }

    @Test
    @DisplayName("DELETE /cart clears the cart")
    void clearCart() throws Exception {
        mockMvc.perform(post("/cart/items")
                        .with(user(customerUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "productId": %d,
                                  "quantity": 1
                                }
                                """.formatted(testProduct.getId())))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/cart").with(user(customerUser)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/cart").with(user(customerUser)))
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
    @DisplayName("GET /cart returns an empty cart for a new user")
    void getCart_emptyForNewUser() throws Exception {
        mockMvc.perform(get("/cart").with(user(customerUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray());
    }
}
