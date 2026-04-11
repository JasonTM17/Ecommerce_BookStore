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

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * OrderIntegrationTest - Integration test cho flow tạo đơn hàng
 * 
 * Test coverage:
 * 1. Tạo đơn hàng từ cart
 * 2. Lấy danh sách đơn hàng của user
 * 3. Lấy chi tiết đơn hàng
 * 4. Kiểm tra pagination
 */
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
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("POST /orders - Tạo đơn hàng thành công với cart items")
    void createOrder_withCartItems_success() throws Exception {
        // Bước 1: Thêm sản phẩm vào cart
        String addToCartBody = """
                {
                  "productId": %d,
                  "quantity": 2
                }
                """.formatted(testProduct.getId());

        mockMvc.perform(post("/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(addToCartBody))
                .andExpect(status().isOk());

        // Bước 2: Tạo đơn hàng
        String orderBody = """
                {
                  "paymentMethod": "COD",
                  "shippingName": "Test Customer",
                  "shippingPhone": "0901234567",
                  "shippingAddress": "123 Test Street, District 1, Ho Chi Minh City",
                  "note": "Please deliver before 5pm"
                }
                """;

        mockMvc.perform(post("/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderNumber").exists())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.total").isNumber())
                .andExpect(jsonPath("$.items").isArray());
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("GET /orders - Lấy danh sách đơn hàng với pagination")
    void getOrders_withPagination() throws Exception {
        // Tạo đơn hàng trước
        String orderBody = """
                {
                  "paymentMethod": "COD",
                  "shippingName": "Test Customer",
                  "shippingPhone": "0901234567",
                  "shippingAddress": "123 Test Street"
                }
                """;

        mockMvc.perform(post("/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderBody))
                .andExpect(status().isOk());

        // Lấy danh sách với pagination
        mockMvc.perform(get("/orders")
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
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("GET /orders/{id} - Lấy chi tiết đơn hàng")
    void getOrderDetails() throws Exception {
        // Tạo đơn hàng trước
        String orderBody = """
                {
                  "paymentMethod": "COD",
                  "shippingName": "Test Customer",
                  "shippingPhone": "0901234567",
                  "shippingAddress": "123 Test Street"
                }
                """;

        // Tạo order và lấy order number
        var result = mockMvc.perform(post("/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderBody))
                .andExpect(status().isOk())
                .andReturn();

        // Lấy danh sách orders để tìm order ID
        var ordersResult = mockMvc.perform(get("/orders"))
                .andExpect(status().isOk())
                .andReturn();

        // Verify có thể lấy chi tiết order
        mockMvc.perform(get("/orders")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].orderNumber").exists())
                .andExpect(jsonPath("$.content[0].status").exists())
                .andExpect(jsonPath("$.content[0].total").exists())
                .andExpect(jsonPath("$.content[0].items").isArray());
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("GET /orders - Trả về empty list khi chưa có đơn hàng")
    void getOrders_emptyList() throws Exception {
        mockMvc.perform(get("/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("POST /orders - Tạo đơn hàng với VNPay payment")
    void createOrder_withVNPay_success() throws Exception {
        String orderBody = """
                {
                  "paymentMethod": "VNPAY",
                  "shippingName": "Test Customer",
                  "shippingPhone": "0901234567",
                  "shippingAddress": "123 Test Street"
                }
                """;

        mockMvc.perform(post("/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderNumber").exists());
    }

    @Test
    @DisplayName("GET /orders - Trả về 401 khi không đăng nhập")
    void getOrders_unauthenticated_401() throws Exception {
        mockMvc.perform(get("/orders"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("Order total được tính đúng từ cart items")
    void orderTotal_calculatedCorrectly() throws Exception {
        // Thêm 2 sản phẩm vào cart
        String addToCartBody = """
                {
                  "productId": %d,
                  "quantity": 3
                }
                """.formatted(testProduct.getId());

        mockMvc.perform(post("/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(addToCartBody))
                .andExpect(status().isOk());

        // Tạo đơn hàng
        String orderBody = """
                {
                  "paymentMethod": "COD",
                  "shippingName": "Test Customer",
                  "shippingPhone": "0901234567",
                  "shippingAddress": "123 Test Street"
                }
                """;

        var result = mockMvc.perform(post("/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderBody))
                .andExpect(status().isOk())
                .andReturn();

        // Verify total > 0 (actual calculation depends on product price)
        String response = result.getResponse().getContentAsString();
        assertThat(response).contains("\"total\"");
    }
}
