package com.bookstore.repository;

import com.bookstore.entity.ChatFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatFeedbackRepository extends JpaRepository<ChatFeedback, Long> {

    Optional<ChatFeedback> findByMessageId(Long messageId);

    boolean existsByMessageId(Long messageId);
}
