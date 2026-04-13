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
import java.util.Map;
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

    @Mock
    private EffectivePricingService effectivePricingService;

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

        lenient().when(effectivePricingService.resolve(testProduct1)).thenReturn(pricingFor(testProduct1));
        lenient().when(effectivePricingService.resolve(testProduct2)).thenReturn(pricingFor(testProduct2));
        lenient().when(effectivePricingService.resolveAll(any())).thenReturn(Map.of(
                testProduct1.getId(), pricingFor(testProduct1),
                testProduct2.getId(), pricingFor(testProduct2)
        ));
        lenient().when(cartRepository.save(any(Cart.class))).thenAnswer(invocation -> {
            Cart cart = invocation.getArgument(0);
            if (cart.getId() == null) {
                cart.setId(testCart.getId());
            }
            return cart;
        });
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
        when(effectivePricingService.resolve(testProduct1)).thenReturn(pricingFor(testProduct1));

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
        when(cartRepository.findByUserIdWithItems(testUser.getId())).thenReturn(Optional.of(testCart));

        cartService.clearCart(testUser);

        assertTrue(testCart.getCartItems().isEmpty());
        verify(cartItemRepository, never()).deleteAllByCartId(any(Long.class));
    }

    @Test
    void addToCart_ActiveFlashSale_RejectsQuantityAboveMaxPerUser() {
        FlashSale flashSale = FlashSale.builder()
                .id(50L)
                .product(testProduct1)
                .originalPrice(testProduct1.getPrice())
                .salePrice(new BigDecimal("39000"))
                .stockLimit(20)
                .soldCount(2)
                .maxPerUser(2)
                .isActive(true)
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct1));
        when(effectivePricingService.resolve(testProduct1)).thenReturn(new EffectiveProductPricing(
                testProduct1.getPrice(),
                flashSale.getSalePrice(),
                flashSale.getSalePrice(),
                34,
                18,
                true,
                flashSale
        ));

        CartItemRequest request = CartItemRequest.builder()
                .productId(1L)
                .quantity(3)
                .build();

        assertThrows(BadRequestException.class, () -> cartService.addToCart(testUser, request));
    }

    private EffectiveProductPricing pricingFor(Product product) {
        BigDecimal currentPrice = product.getDiscountPrice() != null && product.getDiscountPrice().compareTo(BigDecimal.ZERO) > 0
                ? product.getDiscountPrice()
                : product.getPrice();

        return new EffectiveProductPricing(
                product.getPrice(),
                product.getDiscountPrice(),
                currentPrice,
                product.getDiscountPercent(),
                product.getStockQuantity(),
                product.getStockQuantity() != null && product.getStockQuantity() > 0,
                null
        );
    }
}
