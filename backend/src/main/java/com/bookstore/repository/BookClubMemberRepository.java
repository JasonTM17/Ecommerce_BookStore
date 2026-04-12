package com.bookstore.repository;

import com.bookstore.entity.BookClubMember;
import com.bookstore.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookClubMemberRepository extends JpaRepository<BookClubMember, Long> {

    List<BookClubMember> findByClubId(Long clubId);

    Optional<BookClubMember> findByClubIdAndUser(Long clubId, User user);

    boolean existsByClubIdAndUser(Long clubId, User user);

    long countByClubId(Long clubId);

    Page<BookClubMember> findByUserOrderByJoinedAtDesc(User user, Pageable pageable);
}
