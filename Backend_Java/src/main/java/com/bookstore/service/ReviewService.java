package com.bookstore.service;

import com.bookstore.dto.request.ReviewRequest;
import com.bookstore.dto.response.PageResponse;
import com.bookstore.dto.response.ReviewResponse;
import com.bookstore.dto.response.UserResponse;
import com.bookstore.entity.Order;
import com.bookstore.entity.Product;
import com.bookstore.entity.Review;
import com.bookstore.entity.User;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.ProductRepository;
import com.bookstore.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public ReviewResponse createReview(User user, ReviewRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        boolean hasPurchased = orderRepository.findByUserId(user.getId(), PageRequest.of(0, 100))
                .getContent().stream()
                .flatMap(order -> order.getOrderItems().stream())
                .anyMatch(item -> item.getProduct().getId().equals(product.getId()) &&
                                  order.getOrderStatus() == com.bookstore.entity.OrderStatus.DELIVERED);

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(request.getRating())
                .comment(request.getComment())
                .isVerifiedPurchase(hasPurchased)
                .isApproved(true)
                .isHidden(false)
                .helpfulCount(0)
                .build();

        review = reviewRepository.save(review);

        updateProductRating(product.getId());

        return mapToReviewResponse(review);
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getProductReviews(Long productId, int page, int size) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Page<Review> reviews = reviewRepository.findByProductIdAndIsApprovedTrueAndIsHiddenFalse(
                productId, PageRequest.of(page, size, sort));

        List<ReviewResponse> content = reviews.getContent().stream()
                .map(this::mapToReviewResponse)
                .collect(Collectors.toList());

        return PageResponse.<ReviewResponse>builder()
                .content(content)
                .page(reviews.getNumber())
                .size(reviews.getSize())
                .totalElements(reviews.getTotalElements())
                .totalPages(reviews.getTotalPages())
                .first(reviews.isFirst())
                .last(reviews.isLast())
                .hasNext(reviews.hasNext())
                .hasPrevious(reviews.hasPrevious())
                .build();
    }

    @Transactional(readOnly = true)
    public List<Object[]> getRatingDistribution(Long productId) {
        return reviewRepository.getRatingDistribution(productId);
    }

    @Transactional
    public void deleteReview(Long reviewId, User user) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        if (!review.getUser().getId().equals(user.getId()) &&
            !user.getRoles().contains(com.bookstore.entity.Role.ADMIN)) {
            throw new BadRequestException("Bạn không có quyền xóa đánh giá này");
        }

        Long productId = review.getProduct().getId();
        reviewRepository.delete(review);
        updateProductRating(productId);
    }

    private void updateProductRating(Long productId) {
        Double avgRating = reviewRepository.calculateAverageRatingByProductId(productId);
        long reviewCount = reviewRepository.countApprovedReviewsByProductId(productId);

        Product product = productRepository.findById(productId).orElse(null);
        if (product != null) {
            product.setAvgRating(avgRating != null ? avgRating : 0.0);
            product.setReviewCount((int) reviewCount);
            productRepository.save(product);
        }
    }

    private ReviewResponse mapToReviewResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .user(mapToUserResponse(review.getUser()))
                .productId(review.getProduct().getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .isVerifiedPurchase(review.getIsVerifiedPurchase())
                .helpfulCount(review.getHelpfulCount())
                .createdAt(review.getCreatedAt())
                .build();
    }

    private UserResponse mapToUserResponse(User user) {
        String fullName = (user.getFirstName() != null ? user.getFirstName() : "") + 
                         " " + (user.getLastName() != null ? user.getLastName() : "");
        fullName = fullName.trim();
        if (fullName.isEmpty()) {
            fullName = "Người dùng";
        }

        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(fullName)
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}
