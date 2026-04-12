package com.bookstore.service;

import com.bookstore.dto.request.ReviewRequest;
import com.bookstore.dto.response.PageResponse;
import com.bookstore.dto.response.ReviewResponse;
import com.bookstore.entity.*;
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
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private ReviewService reviewService;

    private User testUser;
    private User adminUser;
    private Product testProduct;
    private Category testCategory;
    private Review testReview;
    private ReviewRequest reviewRequest;

    @BeforeEach
    void setUp() {
        testCategory = Category.builder()
                .id(1L)
                .name("Tiểu Thuyết")
                .isActive(true)
                .build();

        testProduct = Product.builder()
                .id(1L)
                .name("Đắc Nhân Tâm")
                .author("Dale Carnegie")
                .price(new BigDecimal("59000"))
                .stockQuantity(100)
                .category(testCategory)
                .isActive(true)
                .avgRating(4.5)
                .reviewCount(10)
                .build();

        testUser = User.builder()
                .id(1L)
                .email("user@example.com")
                .firstName("Test")
                .lastName("User")
                .isActive(true)
                .isEmailVerified(true)
                .roles(new java.util.HashSet<>(Set.of(Role.CUSTOMER)))
                .build();

        adminUser = User.builder()
                .id(2L)
                .email("admin@example.com")
                .firstName("Admin")
                .lastName("User")
                .isActive(true)
                .isEmailVerified(true)
                .roles(new java.util.HashSet<>(Set.of(Role.ADMIN)))
                .build();

        testReview = Review.builder()
                .id(1L)
                .user(testUser)
                .product(testProduct)
                .rating(5)
                .comment("Sách rất hay!")
                .isVerifiedPurchase(true)
                .isApproved(true)
                .isHidden(false)
                .helpfulCount(0)
                .createdAt(LocalDateTime.now())
                .build();

        reviewRequest = ReviewRequest.builder()
                .productId(1L)
                .rating(5)
                .comment("Sách rất hay!")
                .build();
    }

    @Test
    void createReview_Success() {
        Order testOrder = Order.builder()
                .id(1L)
                .orderStatus(OrderStatus.DELIVERED)
                .user(testUser)
                .orderItems(List.of(OrderItem.builder()
                        .product(testProduct)
                        .quantity(1)
                        .price(new BigDecimal("45000"))
                        .build()))
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(orderRepository.findByUserId(anyLong(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(testOrder)));
        when(reviewRepository.save(any(Review.class))).thenReturn(testReview);
        when(reviewRepository.calculateAverageRatingByProductId(anyLong())).thenReturn(5.0);
        when(reviewRepository.countApprovedReviewsByProductId(anyLong())).thenReturn(1L);
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        ReviewResponse response = reviewService.createReview(testUser, reviewRequest);

        assertNotNull(response);
        assertEquals(5, response.getRating());
        assertEquals("Sách rất hay!", response.getComment());
        assertTrue(response.getIsVerifiedPurchase());

        verify(reviewRepository).save(any(Review.class));
    }

    @Test
    void createReview_ProductNotFound_ThrowsException() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        ReviewRequest invalidRequest = ReviewRequest.builder()
                .productId(999L)
                .rating(5)
                .comment("Test")
                .build();

        assertThrows(ResourceNotFoundException.class, () ->
                reviewService.createReview(testUser, invalidRequest));

        verify(reviewRepository, never()).save(any(Review.class));
    }

    @Test
    void getProductReviews_Success() {
        Page<Review> reviewPage = new PageImpl<>(List.of(testReview));
        when(reviewRepository.findByProductIdAndIsApprovedTrueAndIsHiddenFalse(anyLong(), any(Pageable.class)))
                .thenReturn(reviewPage);

        PageResponse<ReviewResponse> response = reviewService.getProductReviews(1L, 0, 10);

        assertNotNull(response);
        assertEquals(1, response.getTotalElements());
        assertEquals(1, response.getContent().size());
        assertEquals(5, response.getContent().get(0).getRating());
    }

    @Test
    void getProductReviews_EmptyList() {
        Page<Review> emptyPage = new PageImpl<>(List.of());
        when(reviewRepository.findByProductIdAndIsApprovedTrueAndIsHiddenFalse(anyLong(), any(Pageable.class)))
                .thenReturn(emptyPage);

        PageResponse<ReviewResponse> response = reviewService.getProductReviews(1L, 0, 10);

        assertNotNull(response);
        assertEquals(0, response.getTotalElements());
    }

    @Test
    void deleteReview_ByUser_Success() {
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(testReview));
        when(reviewRepository.calculateAverageRatingByProductId(anyLong())).thenReturn(0.0);
        when(reviewRepository.countApprovedReviewsByProductId(anyLong())).thenReturn(0L);
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        doNothing().when(reviewRepository).delete(any(Review.class));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        reviewService.deleteReview(1L, testUser);

        verify(reviewRepository).delete(testReview);
    }

    @Test
    void deleteReview_ByAdmin_Success() {
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(testReview));
        when(reviewRepository.calculateAverageRatingByProductId(anyLong())).thenReturn(0.0);
        when(reviewRepository.countApprovedReviewsByProductId(anyLong())).thenReturn(0L);
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        doNothing().when(reviewRepository).delete(any(Review.class));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        reviewService.deleteReview(1L, adminUser);

        verify(reviewRepository).delete(testReview);
    }

    @Test
    void deleteReview_NotFound_ThrowsException() {
        when(reviewRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                reviewService.deleteReview(999L, testUser));
    }

    @Test
    void deleteReview_Unauthorized_ThrowsException() {
        User otherUser = User.builder()
                .id(3L)
                .email("other@example.com")
                .isActive(true)
                .roles(new java.util.HashSet<>(Set.of(Role.CUSTOMER)))
                .build();

        when(reviewRepository.findById(1L)).thenReturn(Optional.of(testReview));

        assertThrows(com.bookstore.exception.BadRequestException.class, () ->
                reviewService.deleteReview(1L, otherUser));
    }

    @Test
    void getRatingDistribution_Success() {
        List<Object[]> distribution = List.of(
                new Object[]{5, 10L},
                new Object[]{4, 5L},
                new Object[]{3, 2L}
        );
        when(reviewRepository.getRatingDistribution(1L)).thenReturn(distribution);

        var result = reviewService.getRatingDistribution(1L);

        assertNotNull(result);
        assertEquals(3, result.size());
    }
}
