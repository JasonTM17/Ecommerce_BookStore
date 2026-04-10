package com.bookstore.repository;

import com.bookstore.entity.BookDiscussion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookDiscussionRepository extends JpaRepository<BookDiscussion, Long> {

    Page<BookDiscussion> findByClubIdOrderByCreatedAtDesc(Long clubId, Pageable pageable);

    List<BookDiscussion> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByClubId(Long clubId);
}
