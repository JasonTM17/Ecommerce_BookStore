package com.bookstore.service;

import com.bookstore.dto.response.WishlistResponse;
import com.bookstore.dto.response.WishlistResponse.ProductInfo;
import com.bookstore.entity.Product;
import com.bookstore.entity.User;
import com.bookstore.entity.Wishlist;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.CartItemRepository;
import com.bookstore.repository.CartRepository;
import com.bookstore.repository.ProductRepository;
import com.bookstore.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    @Transactional
    public WishlistResponse addToWishlist(User user, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (!product.getIsActive()) {
            throw new BadRequestException("Sản phẩm không còn hoạt động");
        }

        if (wishlistRepository.existsByUserAndProduct(user, product)) {
            throw new BadRequestException("Sản phẩm đã có trong danh sách yêu thích");
        }

        Wishlist wishlist = wishlistRepository.save(Wishlist.builder()
                .user(user)
                .product(product)
                .priority(0)
                .build());

        log.info("Product {} added to wishlist for user {}", productId, user.getEmail());
        return mapToWishlistResponse(wishlist);
    }

    @Transactional(readOnly = true)
    public List<WishlistResponse> getUserWishlist(User user) {
        List<Wishlist> wishlists = wishlistRepository.findByUserWithProduct(user);
        return wishlists.stream()
                .map(this::mapToWishlistResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<WishlistResponse> getUserWishlistPaginated(User user, Pageable pageable) {
        Page<Wishlist> wishlists = wishlistRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        return wishlists.map(this::mapToWishlistResponse);
    }

    @Transactional(readOnly = true)
    public WishlistResponse getWishlistById(User user, Long wishlistId) {
        Wishlist wishlist = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist", "id", wishlistId));

        if (!wishlist.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền truy cập danh sách này");
        }

        return mapToWishlistResponse(wishlist);
    }

    @Transactional
    public void removeFromWishlist(User user, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        Wishlist wishlist = wishlistRepository.findByUserAndProduct(user, product)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist", "productId", productId));

        wishlistRepository.delete(wishlist);
        log.info("Product {} removed from wishlist for user {}", productId, user.getEmail());
    }

    @Transactional
    public void updateWishlistNotes(User user, Long productId, String notes) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        Wishlist wishlist = wishlistRepository.findByUserAndProduct(user, product)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist", "productId", productId));

        wishlist.setNotes(notes);
        wishlistRepository.save(wishlist);
    }

    @Transactional
    public void updateWishlistPriority(User user, Long productId, Integer priority) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        Wishlist wishlist = wishlistRepository.findByUserAndProduct(user, product)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist", "productId", productId));

        wishlist.setPriority(priority);
        wishlistRepository.save(wishlist);
    }

    @Transactional(readOnly = true)
    public boolean isInWishlist(User user, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        return wishlistRepository.existsByUserAndProduct(user, product);
    }

    @Transactional(readOnly = true)
    public long getWishlistCount(User user) {
        return wishlistRepository.countByUser(user);
    }

    private WishlistResponse mapToWishlistResponse(Wishlist wishlist) {
        Product product = wishlist.getProduct();

        ProductInfo productInfo = ProductInfo.builder()
                .id(product.getId())
                .name(product.getName())
                .author(product.getAuthor())
                .imageUrl(product.getImageUrl())
                .price(product.getPrice())
                .currentPrice(product.getCurrentPrice())
                .avgRating(product.getAvgRating())
                .reviewCount(product.getReviewCount())
                .stockQuantity(product.getStockQuantity())
                .discountPercent(product.getDiscountPercent())
                .isNew(product.getIsNew())
                .isBestseller(product.getIsBestseller())
                .build();

        return WishlistResponse.builder()
                .id(wishlist.getId())
                .product(productInfo)
                .notes(wishlist.getNotes())
                .priority(wishlist.getPriority())
                .isInStock(product.isInStock())
                .createdAt(wishlist.getCreatedAt())
                .build();
    }
}
