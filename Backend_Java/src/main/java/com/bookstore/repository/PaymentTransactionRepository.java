package com.bookstore.repository;

import com.bookstore.entity.PaymentStatus;
import com.bookstore.entity.PaymentTransaction;
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
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    Optional<PaymentTransaction> findByTransactionId(String transactionId);

    Optional<PaymentTransaction> findByOrderId(Long orderId);

    Page<PaymentTransaction> findByPaymentStatusOrderByCreatedAtDesc(PaymentStatus status, Pageable pageable);

    Page<PaymentTransaction> findByPaymentMethodOrderByCreatedAtDesc(String method, Pageable pageable);

    @Query("SELECT pt FROM PaymentTransaction pt WHERE pt.createdAt >= :startDate AND pt.createdAt <= :endDate ORDER BY pt.createdAt DESC")
    List<PaymentTransaction> findByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(pt.amount) FROM PaymentTransaction pt WHERE pt.paymentStatus = :status")
    Long sumAmountByStatus(@Param("status") PaymentStatus status);

    @Query("SELECT COUNT(pt) FROM PaymentTransaction pt WHERE pt.paymentStatus = :status")
    long countByStatus(@Param("status") PaymentStatus status);
}
