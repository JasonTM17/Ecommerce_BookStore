package com.bookstore.repository;

import com.bookstore.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Optional<Product> findByIsbn(String isbn);

    boolean existsByIsbn(String isbn);

    /** Eager-load associations needed for {@link com.bookstore.service.ProductService#mapToProductResponse}. */
    @Query(
            "SELECT DISTINCT p FROM Product p "
                    + "LEFT JOIN FETCH p.category c "
                    + "LEFT JOIN FETCH c.parent "
                    + "LEFT JOIN FETCH p.brand "
                    + "WHERE p.id = :id")
    Optional<Product> findDetailById(@Param("id") Long id);

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.brand WHERE p.isActive = true ORDER BY p.createdAt DESC")
    Page<Product> findAllActiveProducts(Pageable pageable);

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.brand WHERE p.isActive = true AND p.isFeatured = true")
    List<Product> findFeaturedProducts();

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.brand WHERE p.isActive = true AND p.isBestseller = true")
    List<Product> findBestsellerProducts();

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.brand WHERE p.isActive = true AND p.isNew = true")
    List<Product> findNewProducts();

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.brand WHERE p.isActive = true AND p.category.id = :categoryId")
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.brand WHERE p.isActive = true AND p.category.id IN :categoryIds")
    Page<Product> findByCategoryIdIn(@Param("categoryIds") List<Long> categoryIds, Pageable pageable);

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.brand WHERE p.isActive = true AND p.brand.id = :brandId")
    Page<Product> findByBrandId(Long brandId, Pageable pageable);

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.brand WHERE p.isActive = true AND p.stockQuantity <= :threshold")
    List<Product> findLowStockProducts(int threshold);

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.brand WHERE p.isActive = true AND (p.name LIKE %:keyword% OR p.author LIKE %:keyword% OR p.description LIKE %:keyword%)")
    Page<Product> searchProducts(String keyword, Pageable pageable);

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.brand WHERE p.isActive = true AND p.category.id = :categoryId ORDER BY p.soldCount DESC")
    List<Product> findTopSellingByCategory(Long categoryId, Pageable pageable);

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.brand WHERE p.isActive = true AND p.id != :productId AND p.category.id = :categoryId")
    List<Product> findRelatedProducts(Long productId, Long categoryId, Pageable pageable);

    @Modifying
    @Query("UPDATE Product p SET p.viewCount = COALESCE(p.viewCount, 0) + 1 WHERE p.id = :productId")
    void incrementViewCount(@Param("productId") Long productId);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.isActive = true")
    long countActiveProducts();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.isActive = true AND p.category.id IN :categoryIds")
    long countActiveProductsByCategoryIds(@Param("categoryIds") List<Long> categoryIds);

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.brand WHERE p.isActive = true ORDER BY p.viewCount DESC")
    Page<Product> findMostViewedProducts(Pageable pageable);

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.brand WHERE p.isActive = true ORDER BY p.soldCount DESC")
    Page<Product> findMostSoldProducts(Pageable pageable);

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.brand WHERE p.isActive = true ORDER BY p.viewCount DESC")
    List<Product> findTop8ByOrderByViewCountDesc();

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.brand WHERE p.isActive = true ORDER BY p.createdAt DESC")
    List<Product> findTop8ByOrderByCreatedAtDesc();

    @Query("SELECT p FROM Product p WHERE p.isActive = true ORDER BY COALESCE(p.soldCount, 0) DESC")
    List<Product> findTopProductsByOrderCount(org.springframework.data.domain.Pageable pageable);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.isActive = true AND p.brand.id = :brandId")
    long countActiveProductsByBrandId(@Param("brandId") Long brandId);
}
