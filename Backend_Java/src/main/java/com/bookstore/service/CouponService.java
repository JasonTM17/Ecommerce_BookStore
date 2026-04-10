package com.bookstore.service;

import com.bookstore.dto.request.CouponRequest;
import com.bookstore.dto.response.CouponResponse;
import com.bookstore.entity.Coupon;
import com.bookstore.entity.CouponType;
import com.bookstore.entity.CouponUsage;
import com.bookstore.entity.User;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.CouponRepository;
import com.bookstore.repository.CouponUsageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;

    @Transactional
    public CouponResponse createCoupon(CouponRequest request, User admin) {
        if (couponRepository.existsByCode(request.getCode().toUpperCase())) {
            throw new BadRequestException("Mã coupon đã tồn tại");
        }

        Coupon coupon = Coupon.builder()
                .code(request.getCode().toUpperCase())
                .description(request.getDescription())
                .type(request.getType())
                .discountValue(request.getDiscountValue())
                .minOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO)
                .maxDiscount(request.getMaxDiscount() != null ? request.getMaxDiscount() : BigDecimal.ZERO)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .usageLimit(request.getUsageLimit() != null ? request.getUsageLimit() : 0)
                .usedCount(0)
                .perUserLimit(request.getPerUserLimit() != null ? request.getPerUserLimit() : 1)
                .isActive(true)
                .isPublic(request.getIsPublic() != null ? request.getIsPublic() : true)
                .applicableCategories(request.getApplicableCategories())
                .applicableProducts(request.getApplicableProducts())
                .createdBy(admin.getId())
                .build();

        coupon = couponRepository.save(coupon);
        log.info("Coupon {} created by admin {}", coupon.getCode(), admin.getEmail());

        return mapToCouponResponse(coupon);
    }

    @Transactional
    public CouponResponse updateCoupon(Long couponId, CouponRequest request) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", couponId));

        if (request.getDescription() != null) {
            coupon.setDescription(request.getDescription());
        }
        if (request.getType() != null) {
            coupon.setType(request.getType());
        }
        if (request.getDiscountValue() != null) {
            coupon.setDiscountValue(request.getDiscountValue());
        }
        if (request.getMinOrderAmount() != null) {
            coupon.setMinOrderAmount(request.getMinOrderAmount());
        }
        if (request.getMaxDiscount() != null) {
            coupon.setMaxDiscount(request.getMaxDiscount());
        }
        if (request.getStartDate() != null) {
            coupon.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            coupon.setEndDate(request.getEndDate());
        }
        if (request.getUsageLimit() != null) {
            coupon.setUsageLimit(request.getUsageLimit());
        }
        if (request.getPerUserLimit() != null) {
            coupon.setPerUserLimit(request.getPerUserLimit());
        }
        if (request.getIsPublic() != null) {
            coupon.setIsPublic(request.getIsPublic());
        }
        if (request.getApplicableCategories() != null) {
            coupon.setApplicableCategories(request.getApplicableCategories());
        }
        if (request.getApplicableProducts() != null) {
            coupon.setApplicableProducts(request.getApplicableProducts());
        }

        coupon = couponRepository.save(coupon);
        return mapToCouponResponse(coupon);
    }

    @Transactional
    public void deleteCoupon(Long couponId) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", couponId));
        coupon.setIsActive(false);
        couponRepository.save(coupon);
        log.info("Coupon {} deactivated", coupon.getCode());
    }

    @Transactional(readOnly = true)
    public Page<CouponResponse> getAllCoupons(Pageable pageable) {
        return couponRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::mapToCouponResponse);
    }

    @Transactional(readOnly = true)
    public Page<CouponResponse> getActiveCoupons(Pageable pageable) {
        return couponRepository.findByIsActiveTrueOrderByCreatedAtDesc(pageable)
                .map(this::mapToCouponResponse);
    }

    @Transactional(readOnly = true)
    public List<CouponResponse> getAvailableCoupons() {
        return couponRepository.findAvailableCoupons(LocalDateTime.now())
                .stream().map(this::mapToCouponResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CouponResponse getCouponById(Long couponId) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", couponId));
        return mapToCouponResponse(coupon);
    }

    @Transactional(readOnly = true)
    public CouponResponse getCouponByCode(String code) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "code", code));
        return mapToCouponResponse(coupon);
    }

    @Transactional(readOnly = true)
    public CouponResponse validateCoupon(String code, BigDecimal orderTotal) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "code", code));

        return validateAndReturn(coupon, orderTotal);
    }

    @Transactional(readOnly = true)
    public CouponResponse validateCouponForUser(String code, User user, BigDecimal orderTotal) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "code", code));

        if (coupon.getPerUserLimit() > 0) {
            long userUsageCount = couponUsageRepository.countByUserAndCoupon(coupon.getId(), user.getId());
            if (userUsageCount >= coupon.getPerUserLimit()) {
                throw new BadRequestException("Bạn đã sử dụng coupon này rồi");
            }
        }

        return validateAndReturn(coupon, orderTotal);
    }

    private CouponResponse validateAndReturn(Coupon coupon, BigDecimal orderTotal) {
        if (!coupon.getIsActive()) {
            throw new BadRequestException("Coupon không còn hoạt động");
        }

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStartDate() != null && now.isBefore(coupon.getStartDate())) {
            throw new BadRequestException("Coupon chưa bắt đầu");
        }
        if (coupon.getEndDate() != null && now.isAfter(coupon.getEndDate())) {
            throw new BadRequestException("Coupon đã hết hạn");
        }
        if (coupon.getUsageLimit() > 0 && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new BadRequestException("Coupon đã hết lượt sử dụng");
        }
        if (orderTotal != null && coupon.getMinOrderAmount() != null &&
                orderTotal.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new BadRequestException("Đơn hàng phải từ " + coupon.getMinOrderAmount() + "đ để sử dụng coupon này");
        }

        return mapToCouponResponse(coupon);
    }

    public BigDecimal calculateDiscount(Coupon coupon, BigDecimal orderTotal) {
        BigDecimal discount = BigDecimal.ZERO;

        switch (coupon.getType()) {
            case PERCENTAGE:
                discount = orderTotal.multiply(coupon.getDiscountValue())
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                if (coupon.getMaxDiscount().compareTo(BigDecimal.ZERO) > 0 &&
                        discount.compareTo(coupon.getMaxDiscount()) > 0) {
                    discount = coupon.getMaxDiscount();
                }
                break;
            case FIXED_AMOUNT:
                discount = coupon.getDiscountValue();
                break;
            case FREE_SHIPPING:
                break;
        }

        if (discount.compareTo(orderTotal) > 0) {
            discount = orderTotal;
        }

        return discount;
    }

    @Transactional
    public void useCoupon(Coupon coupon, User user, Long orderId, BigDecimal discountAmount) {
        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);

        CouponUsage usage = CouponUsage.builder()
                .coupon(coupon)
                .user(user)
                .discountAmount(discountAmount != null ? discountAmount.doubleValue() : 0.0)
                .build();
        couponUsageRepository.save(usage);

        log.info("Coupon {} used by user {} on order {}", coupon.getCode(), user.getEmail(), orderId);
    }

    @Transactional(readOnly = true)
    public Page<CouponResponse> searchCoupons(String keyword, Pageable pageable) {
        return couponRepository.searchCoupons(keyword, pageable)
                .map(this::mapToCouponResponse);
    }

    private CouponResponse mapToCouponResponse(Coupon coupon) {
        String discountDisplay;
        switch (coupon.getType()) {
            case PERCENTAGE:
                discountDisplay = coupon.getDiscountValue() + "% OFF";
                break;
            case FIXED_AMOUNT:
                discountDisplay = formatCurrency(coupon.getDiscountValue()) + " giảm";
                break;
            case FREE_SHIPPING:
                discountDisplay = "Miễn phí vận chuyển";
                break;
            default:
                discountDisplay = coupon.getDiscountValue().toString();
        }

        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .type(coupon.getType())
                .discountValue(coupon.getDiscountValue())
                .minOrderAmount(coupon.getMinOrderAmount())
                .maxDiscount(coupon.getMaxDiscount())
                .startDate(coupon.getStartDate())
                .endDate(coupon.getEndDate())
                .usageLimit(coupon.getUsageLimit())
                .usedCount(coupon.getUsedCount())
                .perUserLimit(coupon.getPerUserLimit())
                .isActive(coupon.getIsActive())
                .isPublic(coupon.getIsPublic())
                .isValid(coupon.isValid())
                .isExpired(coupon.isExpired())
                .discountDisplay(discountDisplay)
                .createdAt(coupon.getCreatedAt())
                .build();
    }

    private String formatCurrency(BigDecimal amount) {
        if (amount == null) return "0đ";
        return String.format("%,.0fđ", amount.doubleValue()).replace(",", ".");
    }
}
