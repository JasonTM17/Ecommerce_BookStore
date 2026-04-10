package com.bookstore.repository;

import com.bookstore.entity.WishlistNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WishlistNotificationRepository extends JpaRepository<WishlistNotification, Long> {

    List<WishlistNotification> findByWishlistIdOrderByCreatedAtDesc(Long wishlistId);

    List<WishlistNotification> findByIsSentFalse();

    List<WishlistNotification> findByIsReadFalseOrderByCreatedAtDesc(Long userId);
}
