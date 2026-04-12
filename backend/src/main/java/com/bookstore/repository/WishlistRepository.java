package com.bookstore.repository;

import com.bookstore.entity.Product;
import com.bookstore.entity.User;
import com.bookstore.entity.Wishlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    List<Wishlist> findByUserOrderByCreatedAtDesc(User user);

    Page<Wishlist> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    Optional<Wishlist> findByUserAndProduct(User user, Product product);

    boolean existsByUserAndProduct(User user, Product product);

    @Query("SELECT w FROM Wishlist w JOIN FETCH w.product WHERE w.user = :user ORDER BY w.createdAt DESC")
    List<Wishlist> findByUserWithProduct(User user);

    @Query("SELECT COUNT(w) FROM Wishlist w WHERE w.user = :user")
    long countByUser(User user);

    @Query("SELECT w FROM Wishlist w WHERE w.user = :user AND w.product.stockQuantity > 0")
    List<Wishlist> findByUserWithAvailableProducts(User user);

    void deleteByUserAndProduct(User user, Product product);

    @Query("SELECT w FROM Wishlist w WHERE w.product.id = :productId")
    List<Wishlist> findByProductId(@Param("productId") Long productId);
}
