package com.bookstore.repository;

import com.bookstore.entity.ChatConversation;
import com.bookstore.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByConversationOrderByCreatedAtAsc(ChatConversation conversation);

    Page<ChatMessage> findByConversationOrderByCreatedAtDesc(ChatConversation conversation, Pageable pageable);

    @Query("SELECT m FROM ChatMessage m WHERE m.conversation = :conversation ORDER BY m.createdAt DESC")
    List<ChatMessage> findRecentByConversation(ChatConversation conversation, Pageable pageable);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.conversation = :conversation")
    long countByConversation(ChatConversation conversation);

    void deleteByConversation(ChatConversation conversation);

    List<ChatMessage> findByIsFromGrokTrue();
}
