package com.bookstore.repository;

import com.bookstore.entity.InventoryLog;
import com.bookstore.entity.InventoryAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryLogRepository extends JpaRepository<InventoryLog, Long> {

    List<InventoryLog> findByProductIdOrderByCreatedAtDesc(Long productId);

    Page<InventoryLog> findByProductIdOrderByCreatedAtDesc(Long productId, Pageable pageable);

    Page<InventoryLog> findByActionOrderByCreatedAtDesc(InventoryAction action, Pageable pageable);

    @Query("SELECT il FROM InventoryLog il WHERE il.createdAt >= :startDate AND il.createdAt <= :endDate ORDER BY il.createdAt DESC")
    List<InventoryLog> findByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(il.quantityChange) FROM InventoryLog il WHERE il.product.id = :productId AND il.action = :action")
    Long sumQuantityByProductAndAction(@Param("productId") Long productId, @Param("action") InventoryAction action);

    List<InventoryLog> findByReferenceIdAndReferenceType(Long referenceId, String referenceType);
}
