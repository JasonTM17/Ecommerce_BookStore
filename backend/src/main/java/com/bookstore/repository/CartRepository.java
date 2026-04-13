package com.bookstore.repository;

import com.bookstore.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUserId(Long userId);

    @Query("""
            SELECT DISTINCT c
            FROM Cart c
            LEFT JOIN FETCH c.cartItems ci
            LEFT JOIN FETCH ci.product
            WHERE c.user.id = :userId
            """)
    Optional<Cart> findByUserIdWithItems(Long userId);

    void deleteByUserId(Long userId);

    @Query("""
            SELECT DISTINCT c
            FROM Cart c
            LEFT JOIN FETCH c.cartItems ci
            LEFT JOIN FETCH ci.product
            WHERE c.updatedAt < :threshold
            AND SIZE(c.cartItems) > 0
            AND (c.reminderSentAt IS NULL OR c.reminderSentAt < c.updatedAt)
            """)
    java.util.List<Cart> findAbandonedCarts(@org.springframework.data.repository.query.Param("threshold") java.time.LocalDateTime threshold);
}
