package com.bookstore.repository;

import com.bookstore.entity.BookRental;
import com.bookstore.entity.RentalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRentalRepository extends JpaRepository<BookRental, Long> {

    Page<BookRental> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<BookRental> findByUserIdAndStatus(Long userId, RentalStatus status);

    Optional<BookRental> findByIdAndUserId(Long id, Long userId);

    Page<BookRental> findByStatusOrderByCreatedAtDesc(RentalStatus status, Pageable pageable);

    List<BookRental> findByStatusAndDueDateBefore(RentalStatus status, java.time.LocalDateTime date);

    long countByStatus(RentalStatus status);
}
