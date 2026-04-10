package com.bookstore.repository;

import com.bookstore.entity.BookClub;
import com.bookstore.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookClubRepository extends JpaRepository<BookClub, Long> {

    Page<BookClub> findByIsActiveTrueAndIsPublicTrueOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT bc FROM BookClub bc WHERE bc.isActive = true AND bc.isPublic = true AND bc.name LIKE %:keyword%")
    Page<BookClub> searchPublicClubs(@Param("keyword") String keyword, Pageable pageable);

    List<BookClub> findByOwner(User owner);

    Optional<BookClub> findByIdAndIsActiveTrue(Long id);
}
