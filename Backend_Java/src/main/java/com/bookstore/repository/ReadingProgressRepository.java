package com.bookstore.repository;

import com.bookstore.entity.ReadingProgress;
import com.bookstore.entity.ReadingStatus;
import com.bookstore.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReadingProgressRepository extends JpaRepository<ReadingProgress, Long> {

    List<ReadingProgress> findByUserOrderByUpdatedAtDesc(User user);

    Page<ReadingProgress> findByUserOrderByUpdatedAtDesc(User user, Pageable pageable);

    Optional<ReadingProgress> findByUserAndProductId(User user, Long productId);

    boolean existsByUserAndProductId(User user, Long productId);

    List<ReadingProgress> findByUserAndStatus(User user, ReadingStatus status);

    @Query("SELECT rp FROM ReadingProgress rp WHERE rp.user = :user AND rp.status = 'FINISHED' ORDER BY rp.finishedAt DESC")
    List<ReadingProgress> findFinishedByUser(User user);

    long countByUserAndStatus(User user, ReadingStatus status);
}
