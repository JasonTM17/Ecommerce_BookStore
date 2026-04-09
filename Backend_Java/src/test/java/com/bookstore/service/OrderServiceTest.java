package com.bookstore.service;

import com.bookstore.dto.request.OrderRequest;
import com.bookstore.dto.response.OrderResponse;
import com.bookstore.entity.*;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private OrderService orderService;

    private User testUser;
    private Product testProduct;
    private Order testOrder;
    private OrderRequest orderRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .firstName("Test")
                .lastName("User")
                .phoneNumber("0901234567")
                .isActive(true)
                .roles(new java.util.HashSet<>(Set.of(Role.CUSTOMER)))
                .build();

        Category category = Category.builder()
                .id(1L)
                .name("Tiểu Thuyết")
                .build();

        testProduct = Product.builder()
                .id(1L)
                .name("Đắc Nhân Tâm")
                .author("Dale Carnegie")
                .price(new BigDecimal("59000"))
                .discountPrice(new BigDecimal("45000"))
                .discountPercent(24)
                .stockQuantity(100)
                .category(category)
                .isActive(true)
                .build();

        OrderItem orderItem = OrderItem.builder()
                .id(1L)
                .product(testProduct)
                .quantity(2)
                .price(testProduct.getCurrentPrice())
                .subtotal(new BigDecimal("90000"))
                .build();

        testOrder = Order.builder()
                .id(1L)
                .orderNumber("ORD12345678")
                .user(testUser)
                .orderStatus(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .shippingAddress("123 ABC, District 1, HCMC")
                .shippingPhone("0901234567")
                .shippingReceiverName("Test User")
                .subtotal(new BigDecimal("90000"))
                .shippingFee(BigDecimal.ZERO)
                .taxAmount(new BigDecimal("9000"))
                .totalAmount(new BigDecimal("99000"))
                .orderItems(new ArrayList<>(List.of(orderItem)))
                .build();
        orderItem.setOrder(testOrder);

        OrderRequest.OrderItemRequest itemRequest = OrderRequest.OrderItemRequest.builder()
                .productId(1L)
                .quantity(2)
                .build();

        orderRequest = OrderRequest.builder()
                .items(List.of(itemRequest))
                .shippingAddress("123 ABC, District 1, HCMC")
                .shippingPhone("0901234567")
                .shippingReceiverName("Test User")
                .paymentMethod("COD")
                .build();
    }

    @Test
    void createOrder_Success() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);
        when(cartRepository.findByUserId(anyLong())).thenReturn(Optional.empty());

        OrderResponse response = orderService.createOrder(testUser, orderRequest);

        assertNotNull(response);
        assertEquals("ORD12345678", response.getOrderNumber());
        assertEquals(OrderStatus.PENDING, response.getOrderStatus());
        assertEquals(PaymentStatus.PENDING, response.getPaymentStatus());

        verify(productRepository).findById(1L);
        verify(productRepository).save(any(Product.class));
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void createOrder_EmptyItems_ThrowsException() {
        orderRequest.setItems(List.of());

        assertThrows(BadRequestException.class, () -> 
            orderService.createOrder(testUser, orderRequest));

        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void createOrder_ProductOutOfStock_ThrowsException() {
        testProduct.setStockQuantity(0);
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        assertThrows(BadRequestException.class, () -> 
            orderService.createOrder(testUser, orderRequest));

        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void getUserOrders_Success() {
        Page<Order> orderPage = new PageImpl<>(List.of(testOrder));
        when(orderRepository.findByUserId(anyLong(), any(Pageable.class))).thenReturn(orderPage);

        var response = orderService.getUserOrders(testUser, 0, 10);

        assertNotNull(response);
        assertEquals(1, response.getTotalElements());
        assertEquals(1, response.getContent().size());
        assertEquals("ORD12345678", response.getContent().get(0).getOrderNumber());
    }

    @Test
    void getOrderById_Success() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));

        OrderResponse response = orderService.getOrderById(testUser, 1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("ORD12345678", response.getOrderNumber());
    }

    @Test
    void getOrderById_NotFound_ThrowsException() {
        when(orderRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> 
            orderService.getOrderById(testUser, 1L));
    }

    @Test
    void updateOrderStatus_ToConfirmed_Success() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order savedOrder = invocation.getArgument(0);
            savedOrder.setOrderStatus(OrderStatus.CONFIRMED);
            return savedOrder;
        });

        OrderResponse response = orderService.updateOrderStatus(1L, OrderStatus.CONFIRMED);

        assertNotNull(response);
        assertEquals(OrderStatus.CONFIRMED, response.getOrderStatus());
    }

    @Test
    void updateOrderStatus_ToCancelled_RestoresStock() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order savedOrder = invocation.getArgument(0);
            savedOrder.setOrderStatus(OrderStatus.CANCELLED);
            return savedOrder;
        });

        OrderResponse response = orderService.updateOrderStatus(1L, OrderStatus.CANCELLED);

        assertNotNull(response);
        assertEquals(OrderStatus.CANCELLED, response.getOrderStatus());
        verify(productRepository).save(any(Product.class));
    }
}
