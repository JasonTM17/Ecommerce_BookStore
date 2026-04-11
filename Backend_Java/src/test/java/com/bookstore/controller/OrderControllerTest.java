package com.bookstore.controller;

import com.bookstore.dto.request.OrderRequest;
import com.bookstore.dto.response.OrderItemResponse;
import com.bookstore.dto.response.OrderResponse;
import com.bookstore.dto.response.PageResponse;
import com.bookstore.dto.response.ProductResponse;
import com.bookstore.entity.OrderStatus;
import com.bookstore.entity.PaymentStatus;
import com.bookstore.entity.User;
import com.bookstore.repository.UserRepository;
import com.bookstore.service.OrderService;
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
@DisplayName("OrderController Tests")
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OrderService orderService;

    @Autowired
    private UserRepository userRepository;

    private User testUser;
    private OrderResponse orderResponse;

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

        OrderItemResponse item = OrderItemResponse.builder()
                .id(1L)
                .product(product)
                .quantity(2)
                .price(BigDecimal.valueOf(100000))
                .subtotal(BigDecimal.valueOf(200000))
                .build();

        orderResponse = OrderResponse.builder()
                .id(1L)
                .orderNumber("ORD-2024-001")
                .orderStatus(OrderStatus.PENDING)
                .orderStatusDisplayName("Chờ xử lý")
                .paymentStatus(PaymentStatus.PENDING)
                .paymentStatusDisplayName("Chờ thanh toán")
                .subtotal(BigDecimal.valueOf(200000))
                .shippingFee(BigDecimal.valueOf(30000))
                .discountAmount(BigDecimal.valueOf(0))
                .totalAmount(BigDecimal.valueOf(230000))
                .paymentMethod("COD")
                .shippingAddress("123 Main St, District 1, Ho Chi Minh City")
                .shippingPhone("0901234567")
                .shippingReceiverName("Test User")
                .notes("Please deliver in the morning")
                .createdAt(LocalDateTime.now())
                .build();

        // Set orderItems using reflection
        try {
            var field = OrderResponse.class.getDeclaredField("orderItems");
            field.setAccessible(true);
            field.set(orderResponse, List.of(item));
        } catch (Exception e) {
            // Fallback: create response without items
        }
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("POST /orders - Tạo đơn hàng thành công")
    void createOrder_success() throws Exception {
        when(orderService.createOrder(any(User.class), any(OrderRequest.class)))
                .thenReturn(orderResponse);

        OrderRequest.OrderItemRequest itemRequest = OrderRequest.OrderItemRequest.builder()
                .productId(1L)
                .quantity(2)
                .build();

        OrderRequest request = OrderRequest.builder()
                .items(List.of(itemRequest))
                .paymentMethod("COD")
                .shippingAddress("123 Main St, District 1, Ho Chi Minh City")
                .shippingPhone("0901234567")
                .shippingReceiverName("Test User")
                .notes("Please deliver in the morning")
                .build();

        mockMvc.perform(post("/orders")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderNumber").value("ORD-2024-001"))
                .andExpect(jsonPath("$.orderStatus").value("PENDING"))
                .andExpect(jsonPath("$.totalAmount").value(230000));
    }

    @Test
    @DisplayName("POST /orders - Trả về 401 khi chưa đăng nhập")
    void createOrder_unauthenticated_401() throws Exception {
        OrderRequest request = OrderRequest.builder()
                .paymentMethod("COD")
                .build();

        mockMvc.perform(post("/orders")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("GET /orders - Lấy danh sách đơn hàng của user")
    void getUserOrders_success() throws Exception {
        PageResponse<OrderResponse> page = PageResponse.<OrderResponse>builder()
                .content(List.of(orderResponse))
                .totalElements(1L)
                .totalPages(1)
                .page(0)
                .size(10)
                .first(true)
                .last(true)
                .build();

        when(orderService.getUserOrders(any(User.class), eq(0), eq(10)))
                .thenReturn(page);

        mockMvc.perform(get("/orders")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].orderNumber").value("ORD-2024-001"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /orders - Trả về 401 khi chưa đăng nhập")
    void getUserOrders_unauthenticated_401() throws Exception {
        mockMvc.perform(get("/orders"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("GET /orders/{id} - Lấy chi tiết đơn hàng thành công")
    void getOrderById_success() throws Exception {
        when(orderService.getOrderById(any(User.class), eq(1L)))
                .thenReturn(orderResponse);

        mockMvc.perform(get("/orders/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.orderNumber").value("ORD-2024-001"))
                .andExpect(jsonPath("$.orderStatus").value("PENDING"));
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("GET /orders/{id} - Trả về 404 khi đơn hàng không tồn tại")
    void getOrderById_notFound() throws Exception {
        when(orderService.getOrderById(any(User.class), eq(999L)))
                .thenThrow(new RuntimeException("Order not found"));

        mockMvc.perform(get("/orders/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /orders/{id} - Trả về 401 khi chưa đăng nhập")
    void getOrderById_unauthenticated_401() throws Exception {
        mockMvc.perform(get("/orders/1"))
                .andExpect(status().isUnauthorized());
    }
}
