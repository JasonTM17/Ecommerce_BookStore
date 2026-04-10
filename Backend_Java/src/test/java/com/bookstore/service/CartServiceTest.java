package com.bookstore.service;

import com.bookstore.dto.request.CartItemRequest;
import com.bookstore.dto.response.CartResponse;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private CartService cartService;

    private User testUser;
    private Product testProduct1;
    private Product testProduct2;
    private Category testCategory;
    private Cart testCart;
    private CartItem testCartItem;

    @BeforeEach
    void setUp() {
        testCategory = Category.builder()
                .id(1L)
                .name("Tiểu Thuyết")
                .isActive(true)
                .build();

        testProduct1 = Product.builder()
                .id(1L)
                .name("Đắc Nhân Tâm")
                .author("Dale Carnegie")
                .price(new BigDecimal("59000"))
                .discountPrice(new BigDecimal("45000"))
                .discountPercent(24)
                .stockQuantity(100)
                .category(testCategory)
                .isActive(true)
                .imageUrl("http://example.com/book1.jpg")
                .build();

        testProduct2 = Product.builder()
                .id(2L)
                .name("Nhà Giả Kim")
                .author("Paulo Coelho")
                .price(new BigDecimal("75000"))
                .stockQuantity(50)
                .category(testCategory)
                .isActive(true)
                .imageUrl("http://example.com/book2.jpg")
                .build();

        testUser = User.builder()
                .id(1L)
                .email("user@example.com")
                .firstName("Test")
                .lastName("User")
                .isActive(true)
                .roles(new java.util.HashSet<>(Set.of(Role.CUSTOMER)))
                .build();

        testCart = Cart.builder()
                .id(1L)
                .user(testUser)
                .cartItems(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .build();

        testCartItem = CartItem.builder()
                .id(1L)
                .cart(testCart)
                .product(testProduct1)
                .quantity(2)
                .addedAt(LocalDateTime.now())
                .build();
        testCart.getCartItems().add(testCartItem);
    }

    @Test
    void getCart_Success() {
        when(cartRepository.findByUserIdWithItems(testUser.getId())).thenReturn(Optional.of(testCart));

        CartResponse response = cartService.getCart(testUser);

        assertNotNull(response);
        assertEquals(1L, response.getId());
    }

    @Test
    void getCart_EmptyCart_ReturnsEmptyCart() {
        when(cartRepository.findByUserIdWithItems(testUser.getId())).thenReturn(Optional.empty());

        CartResponse response = cartService.getCart(testUser);

        assertNotNull(response);
        assertNull(response.getId());
        assertTrue(response.getItems().isEmpty());
        assertEquals(0, response.getTotalItems());
        verify(cartRepository, never()).save(any(Cart.class));
    }

    @Test
    void addToCart_NewItem_Success() {
        CartItemRequest request = CartItemRequest.builder()
                .productId(2L)
                .quantity(1)
                .build();

        when(cartRepository.findByUserId(testUser.getId())).thenReturn(Optional.of(testCart));
        when(cartRepository.findByUserIdWithItems(testUser.getId())).thenReturn(Optional.of(testCart));
        when(productRepository.findById(2L)).thenReturn(Optional.of(testProduct2));
        when(cartItemRepository.findByCartIdAndProductId(testCart.getId(), 2L))
                .thenReturn(Optional.empty());
        when(cartItemRepository.save(any(CartItem.class))).thenAnswer(i -> {
            CartItem ci = i.getArgument(0);
            testCart.getCartItems().add(ci);
            return ci;
        });

        CartResponse response = cartService.addToCart(testUser, request);

        assertNotNull(response);
        verify(cartItemRepository).save(any(CartItem.class));
    }

    @Test
    void addToCart_ProductNotFound_ThrowsException() {
        CartItemRequest request = CartItemRequest.builder()
                .productId(999L)
                .quantity(1)
                .build();

        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                cartService.addToCart(testUser, request));
    }

    @Test
    void addToCart_ProductInactive_ThrowsException() {
        testProduct1.setIsActive(false);
        CartItemRequest request = CartItemRequest.builder()
                .productId(1L)
                .quantity(1)
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct1));

        assertThrows(BadRequestException.class, () ->
                cartService.addToCart(testUser, request));
    }

    @Test
    void addToCart_OutOfStock_ThrowsException() {
        testProduct1.setStockQuantity(0);
        CartItemRequest request = CartItemRequest.builder()
                .productId(1L)
                .quantity(1)
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct1));

        assertThrows(BadRequestException.class, () ->
                cartService.addToCart(testUser, request));
    }

    @Test
    void addToCart_ExceedsStock_ThrowsException() {
        CartItemRequest request = CartItemRequest.builder()
                .productId(1L)
                .quantity(150)
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct1));

        assertThrows(BadRequestException.class, () ->
                cartService.addToCart(testUser, request));
    }

    @Test
    void removeFromCart_Success() {
        when(cartRepository.findByUserId(testUser.getId())).thenReturn(Optional.of(testCart));
        when(cartItemRepository.findById(1L)).thenReturn(Optional.of(testCartItem));
        doAnswer(inv -> {
            testCart.getCartItems().remove(testCartItem);
            return null;
        }).when(cartItemRepository).delete(testCartItem);
        when(cartRepository.findByUserIdWithItems(testUser.getId())).thenReturn(Optional.of(testCart));

        CartResponse response = cartService.removeFromCart(testUser, 1L);

        assertNotNull(response);
        verify(cartItemRepository).delete(testCartItem);
    }

    @Test
    void removeFromCart_ItemNotFound_ThrowsException() {
        when(cartRepository.findByUserId(testUser.getId())).thenReturn(Optional.of(testCart));
        when(cartItemRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                cartService.removeFromCart(testUser, 999L));
    }

    @Test
    void clearCart_Success() {
        when(cartRepository.findByUserId(testUser.getId())).thenReturn(Optional.of(testCart));

        cartService.clearCart(testUser);

        verify(cartItemRepository).deleteAllByCartId(testCart.getId());
    }
}
