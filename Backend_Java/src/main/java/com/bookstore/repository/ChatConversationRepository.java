package com.bookstore.repository;

import com.bookstore.entity.ChatConversation;
import com.bookstore.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, Long> {

    Page<ChatConversation> findByUserOrderByUpdatedAtDesc(User user, Pageable pageable);

    List<ChatConversation> findByUserAndIsActiveTrueOrderByUpdatedAtDesc(User user);

    Optional<ChatConversation> findByIdAndUser(Long id, User user);

    @Query("SELECT c FROM ChatConversation c WHERE c.user = :user AND c.isActive = true ORDER BY c.updatedAt DESC")
    List<ChatConversation> findActiveByUser(User user);

    @Query("SELECT COUNT(c) FROM ChatConversation c WHERE c.user = :user")
    long countByUser(User user);

    void deleteByUser(User user);
}
