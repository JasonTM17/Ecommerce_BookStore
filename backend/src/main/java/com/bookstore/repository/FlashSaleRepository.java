package com.bookstore.repository;

import com.bookstore.entity.FlashSale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FlashSaleRepository extends JpaRepository<FlashSale, Long> {

    @Query("SELECT fs FROM FlashSale fs WHERE fs.isActive = true AND fs.startTime <= :now AND fs.endTime >= :now AND fs.soldCount < fs.stockLimit ORDER BY fs.startTime ASC")
    List<FlashSale> findActiveFlashSales(@Param("now") LocalDateTime now);

    @Query("SELECT fs FROM FlashSale fs WHERE fs.isActive = true AND fs.startTime > :now ORDER BY fs.startTime ASC")
    List<FlashSale> findUpcomingFlashSales(@Param("now") LocalDateTime now);

    Page<FlashSale> findByIsActiveTrueOrderByStartTimeDesc(Pageable pageable);

    @Query("SELECT fs FROM FlashSale fs WHERE fs.isActive = true AND fs.endTime < :now")
    List<FlashSale> findExpiredActiveFlashSales(@Param("now") LocalDateTime now);

    @Query("""
            SELECT CASE WHEN COUNT(fs) > 0 THEN true ELSE false END
            FROM FlashSale fs
            WHERE fs.isActive = true
              AND fs.startTime <= :endTime
              AND fs.endTime >= :startTime
            """)
    boolean existsOverlappingActiveFlashSales(@Param("startTime") LocalDateTime startTime,
                                              @Param("endTime") LocalDateTime endTime);

    @Query("""
            SELECT DISTINCT fs.product.id
            FROM FlashSale fs
            WHERE fs.isActive = true
              AND fs.endTime >= :now
            """)
    List<Long> findScheduledProductIdsFrom(@Param("now") LocalDateTime now);

    @Query("SELECT fs FROM FlashSale fs JOIN FETCH fs.product WHERE fs.id = :id")
    FlashSale findByIdWithProduct(@Param("id") Long id);
}
