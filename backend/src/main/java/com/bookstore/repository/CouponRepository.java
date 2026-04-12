package com.bookstore.repository;

import com.bookstore.entity.Coupon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByCode(String code);

    boolean existsByCode(String code);

    Page<Coupon> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Coupon> findByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT c FROM Coupon c WHERE c.isActive = true AND (c.startDate IS NULL OR c.startDate <= :now) AND (c.endDate IS NULL OR c.endDate >= :now)")
    List<Coupon> findActiveCoupons(@Param("now") LocalDateTime now);

    @Query("SELECT c FROM Coupon c WHERE c.isActive = true AND c.usageLimit > 0 AND c.usedCount < c.usageLimit AND (c.endDate IS NULL OR c.endDate >= :now)")
    List<Coupon> findAvailableCoupons(@Param("now") LocalDateTime now);

    @Query("SELECT c FROM Coupon c WHERE c.code LIKE %:keyword% OR c.description LIKE %:keyword%")
    Page<Coupon> searchCoupons(@Param("keyword") String keyword, Pageable pageable);

    List<Coupon> findByIsActiveTrue();

    @Query("SELECT COUNT(cu) FROM CouponUsage cu WHERE cu.coupon.id = :couponId AND cu.user.id = :userId")
    long countUsageByUser(@Param("couponId") Long couponId, @Param("userId") Long userId);
}
