package com.bookstore.service;

import com.bookstore.entity.User;
import com.bookstore.repository.ChatConversationRepository;
import com.bookstore.repository.ChatFeedbackRepository;
import com.bookstore.repository.ChatMessageRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.ProductRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@ConditionalOnProperty(name = "grok.enabled", havingValue = "false", matchIfMissing = true)
public class DisabledChatbotService extends AbstractChatbotService {

    public DisabledChatbotService(
            ChatConversationRepository conversationRepository,
            ChatMessageRepository messageRepository,
            ChatFeedbackRepository feedbackRepository,
            ProductRepository productRepository,
            OrderRepository orderRepository) {
        super(conversationRepository, messageRepository, feedbackRepository, productRepository, orderRepository);
    }

    @Override
    protected String generateReply(List<Map<String, String>> messages, User user) {
        return getDisabledResponse();
    }

    @Override
    protected String getServiceName() {
        return "BookStore Chatbot";
    }

    @Override
    protected String getStatus() {
        return "DISABLED";
    }

    @Override
    protected String getModelName() {
        return "disabled";
    }

    @Override
    protected boolean isProviderEnabled() {
        return false;
    }
}
