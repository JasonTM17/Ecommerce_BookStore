package com.bookstore.repository;

import com.bookstore.entity.CouponUsage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {

    List<CouponUsage> findByUserId(Long userId);

    Page<CouponUsage> findByUserIdOrderByUsedAtDesc(Long userId, Pageable pageable);

    List<CouponUsage> findByCouponId(Long couponId);

    long countByCouponId(Long couponId);

    @Query("SELECT COUNT(cu) FROM CouponUsage cu WHERE cu.coupon.id = :couponId AND cu.user.id = :userId")
    long countByUserAndCoupon(@Param("couponId") Long couponId, @Param("userId") Long userId);
}
