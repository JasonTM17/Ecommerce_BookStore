package com.bookstore.service;

import com.bookstore.dto.request.ChatFeedbackRequest;
import com.bookstore.dto.request.ChatMessageRequest;
import com.bookstore.dto.response.ChatbotResponse;
import com.bookstore.dto.response.ConversationResponse;
import com.bookstore.entity.User;

import java.util.List;
import java.util.Map;

public interface ChatbotService {

    ChatbotResponse chat(User user, ChatMessageRequest request);

    List<ConversationResponse> getUserConversations(User user);

    ConversationResponse getConversationDetail(User user, Long conversationId);

    void deleteConversation(User user, Long conversationId);

    void submitFeedback(User user, ChatFeedbackRequest request);

    Map<String, Object> getChatbotStats();

    Map<String, String> getHealthStatus();
}
