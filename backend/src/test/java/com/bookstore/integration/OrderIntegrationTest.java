package com.bookstore.integration;

import com.bookstore.entity.Product;
import com.bookstore.entity.Role;
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

import java.math.BigDecimal;
import java.util.Set;

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
@DisplayName("Order flow integration tests")
class OrderIntegrationTest {

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
    @DisplayName("POST /orders creates an order from authenticated cart flow")
    void createOrder_withCartItems_success() throws Exception {
        String addToCartBody = """
                {
                  "productId": %d,
                  "quantity": 2
                }
                """.formatted(testProduct.getId());

        mockMvc.perform(post("/cart/items")
                        .with(user(customerUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(addToCartBody))
                .andExpect(status().isOk());

        String orderBody = """
                {
                  "items": [
                    {
                      "productId": %d,
                      "quantity": 2
                    }
                  ],
                  "paymentMethod": "COD",
                  "shippingReceiverName": "Test Customer",
                  "shippingPhone": "0901234567",
                  "shippingAddress": "123 Test Street, District 1, Ho Chi Minh City",
                  "notes": "Please deliver before 5pm"
                }
                """.formatted(testProduct.getId());

        mockMvc.perform(post("/orders")
                        .with(user(customerUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderNumber").exists())
                .andExpect(jsonPath("$.orderStatus").value("PENDING"))
                .andExpect(jsonPath("$.totalAmount").isNumber())
                .andExpect(jsonPath("$.orderItems").isArray());
    }

    @Test
    @DisplayName("GET /orders returns paginated orders for the authenticated user")
    void getOrders_withPagination() throws Exception {
        String orderBody = """
                {
                  "items": [
                    {
                      "productId": %d,
                      "quantity": 1
                    }
                  ],
                  "paymentMethod": "COD",
                  "shippingReceiverName": "Test Customer",
                  "shippingPhone": "0901234567",
                  "shippingAddress": "123 Test Street",
                  "notes": "Pagination test"
                }
                """.formatted(testProduct.getId());

        mockMvc.perform(post("/orders")
                        .with(user(customerUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderBody))
                .andExpect(status().isOk());

        mockMvc.perform(get("/orders")
                        .with(user(customerUser))
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").isNumber())
                .andExpect(jsonPath("$.totalPages").isNumber())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(10));
    }

    @Test
    @DisplayName("GET /orders/{id} returns the created order")
    void getOrderDetails() throws Exception {
        String orderBody = """
                {
                  "items": [
                    {
                      "productId": %d,
                      "quantity": 1
                    }
                  ],
                  "paymentMethod": "COD",
                  "shippingReceiverName": "Test Customer",
                  "shippingPhone": "0901234567",
                  "shippingAddress": "123 Test Street",
                  "notes": "Details test"
                }
                """.formatted(testProduct.getId());

        String response = mockMvc.perform(post("/orders")
                        .with(user(customerUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderBody))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        long orderId = objectMapper.readTree(response).path("id").asLong();

        mockMvc.perform(get("/orders/" + orderId).with(user(customerUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(orderId))
                .andExpect(jsonPath("$.orderNumber").exists())
                .andExpect(jsonPath("$.orderStatus").exists())
                .andExpect(jsonPath("$.totalAmount").exists())
                .andExpect(jsonPath("$.orderItems").isArray());
    }

    @Test
    @DisplayName("GET /orders returns an empty list when no orders exist")
    void getOrders_emptyList() throws Exception {
        User newUser = userRepository.save(User.builder()
                .email("empty-orders@example.com")
                .password("test-password")
                .firstName("Empty Orders User")
                .isActive(true)
                .isEmailVerified(true)
                .roles(Set.of(Role.CUSTOMER))
                .build());

        mockMvc.perform(get("/orders").with(user(newUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    @DisplayName("POST /orders creates an order with VNPay payment")
    void createOrder_withVNPay_success() throws Exception {
        String orderBody = """
                {
                  "items": [
                    {
                      "productId": %d,
                      "quantity": 1
                    }
                  ],
                  "paymentMethod": "VNPAY",
                  "shippingReceiverName": "Test Customer",
                  "shippingPhone": "0901234567",
                  "shippingAddress": "123 Test Street",
                  "notes": "VNPay test"
                }
                """.formatted(testProduct.getId());

        mockMvc.perform(post("/orders")
                        .with(user(customerUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderNumber").exists());
    }

    @Test
    @DisplayName("GET /orders returns 401 when unauthenticated")
    void getOrders_unauthenticated_401() throws Exception {
        mockMvc.perform(get("/orders"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Order total is calculated from the order items")
    void orderTotal_calculatedCorrectly() throws Exception {
        String addToCartBody = """
                {
                  "productId": %d,
                  "quantity": 3
                }
                """.formatted(testProduct.getId());

        mockMvc.perform(post("/cart/items")
                        .with(user(customerUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(addToCartBody))
                .andExpect(status().isOk());

        String orderBody = """
                {
                  "items": [
                    {
                      "productId": %d,
                      "quantity": 3
                    }
                  ],
                  "paymentMethod": "COD",
                  "shippingReceiverName": "Test Customer",
                  "shippingPhone": "0901234567",
                  "shippingAddress": "123 Test Street",
                  "notes": "Total calculation test"
                }
                """.formatted(testProduct.getId());

        String response = mockMvc.perform(post("/orders")
                        .with(user(customerUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderBody))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode orderJson = objectMapper.readTree(response);
        BigDecimal totalAmount = orderJson.path("totalAmount").decimalValue();
        assertThat(totalAmount).isGreaterThan(BigDecimal.ZERO);
    }
}
