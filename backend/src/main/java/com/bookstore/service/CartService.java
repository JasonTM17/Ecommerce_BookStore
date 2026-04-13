package com.bookstore.service;

import com.bookstore.dto.request.CartItemRequest;
import com.bookstore.dto.response.CartItemResponse;
import com.bookstore.dto.response.CartResponse;
import com.bookstore.dto.response.ProductResponse;
import com.bookstore.dto.response.UserResponse;
import com.bookstore.entity.Cart;
import com.bookstore.entity.CartItem;
import com.bookstore.entity.Product;
import com.bookstore.entity.User;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.CartItemRepository;
import com.bookstore.repository.CartRepository;
import com.bookstore.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final EffectivePricingService effectivePricingService;

    @Transactional
    public CartResponse addToCart(User user, CartItemRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        if (!product.getIsActive()) {
            throw new BadRequestException("Sản phẩm không còn hoạt động");
        }

        EffectiveProductPricing pricing = effectivePricingService.resolve(product);

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));

        CartItem existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId())
                .orElse(null);

        if (existingItem != null) {
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            validateRequestedQuantity(product, pricing, newQuantity);
            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
        } else {
            validateRequestedQuantity(product, pricing, request.getQuantity());
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                    .build();
            cart.addItem(newItem);
            cartItemRepository.save(newItem);
        }

        return getCart(user);
    }

    @Transactional
    public CartResponse updateCartItem(User user, Long itemId, Integer quantity) {
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "userId", user.getId()));

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Sản phẩm không thuộc giỏ hàng của bạn");
        }

        if (quantity <= 0) {
            cart.removeItem(item);
            cartItemRepository.delete(item);
        } else {
            EffectiveProductPricing pricing = effectivePricingService.resolve(item.getProduct());
            validateRequestedQuantity(item.getProduct(), pricing, quantity);
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return getCart(user);
    }

    @Transactional
    public CartResponse removeFromCart(User user, Long itemId) {
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "userId", user.getId()));

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Sản phẩm không thuộc giỏ hàng của bạn");
        }

        cart.removeItem(item);
        cartItemRepository.delete(item);

        return getCart(user);
    }

    @Transactional
    public void clearCart(User user) {
        Cart cart = cartRepository.findByUserIdWithItems(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "userId", user.getId()));
        cart.clearItems();
    }

    @Transactional(readOnly = true)
    public CartResponse getCart(User user) {
        Cart cart = cartRepository.findByUserIdWithItems(user.getId()).orElse(null);

        if (cart == null) {
            return CartResponse.builder()
                    .user(mapToUserResponse(user))
                    .items(List.of())
                    .totalItems(0)
                    .subtotal(BigDecimal.ZERO)
                    .total(BigDecimal.ZERO)
                    .build();
        }

        var pricingByProductId = effectivePricingService.resolveAll(
                cart.getCartItems().stream()
                        .map(CartItem::getProduct)
                        .toList()
        );

        List<CartItemResponse> items = cart.getCartItems().stream()
                .map(item -> mapToCartItemResponse(item, pricingByProductId.get(item.getProduct().getId())))
                .collect(Collectors.toList());

        BigDecimal subtotal = items.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = items.stream()
                .mapToInt(CartItemResponse::getQuantity)
                .sum();

        return CartResponse.builder()
                .id(cart.getId())
                .user(mapToUserResponse(user))
                .items(items)
                .totalItems(totalItems)
                .subtotal(subtotal)
                .total(subtotal)
                .build();
    }

    private void validateRequestedQuantity(Product product, EffectiveProductPricing pricing, int quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("Số lượng không hợp lệ");
        }

        if (pricing.hasActiveFlashSale()) {
            if (quantity > pricing.maxPerUser()) {
                throw new BadRequestException(
                        "Flash sale cho sản phẩm '" + product.getName() + "' chỉ cho phép mua tối đa "
                                + pricing.maxPerUser() + " cuốn"
                );
            }

            if (quantity > pricing.stockQuantity()) {
                throw new BadRequestException("Số lượng flash sale còn lại không đủ");
            }
            return;
        }

        if (quantity > pricing.stockQuantity()) {
            throw new BadRequestException("Số lượng trong kho không đủ");
        }
    }

    private CartItemResponse mapToCartItemResponse(CartItem item, EffectiveProductPricing pricing) {
        BigDecimal subtotal = pricing.currentPrice().multiply(BigDecimal.valueOf(item.getQuantity()));

        return CartItemResponse.builder()
                .id(item.getId())
                .product(mapToProductResponse(item.getProduct(), pricing))
                .quantity(item.getQuantity())
                .subtotal(subtotal)
                .sortOrder(item.getSortOrder())
                .build();
    }

    private ProductResponse mapToProductResponse(Product product, EffectiveProductPricing pricing) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .imageUrl(product.getImageUrl())
                .price(pricing.originalPrice())
                .discountPrice(pricing.discountPrice())
                .currentPrice(pricing.currentPrice())
                .stockQuantity(pricing.stockQuantity())
                .inStock(pricing.inStock())
                .author(product.getAuthor())
                .discountPercent(pricing.discountPercent())
                .build();
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .build();
    }
}
