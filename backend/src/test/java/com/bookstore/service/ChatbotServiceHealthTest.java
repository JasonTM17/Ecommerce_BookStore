package com.bookstore.service;

import com.bookstore.entity.User;
import com.bookstore.repository.ChatConversationRepository;
import com.bookstore.repository.ChatFeedbackRepository;
import com.bookstore.repository.ChatMessageRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.ProductRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ChatbotServiceHealthTest {

    private final ChatConversationRepository conversationRepository = mock(ChatConversationRepository.class);
    private final ChatMessageRepository messageRepository = mock(ChatMessageRepository.class);
    private final ChatFeedbackRepository feedbackRepository = mock(ChatFeedbackRepository.class);
    private final ProductRepository productRepository = mock(ProductRepository.class);
    private final OrderRepository orderRepository = mock(OrderRepository.class);
    private final RestTemplate restTemplate = mock(RestTemplate.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void disabledServiceReportsDisabledHealthState() {
        DisabledChatbotService service = new DisabledChatbotService(
                conversationRepository,
                messageRepository,
                feedbackRepository,
                productRepository,
                orderRepository
        );

        Map<String, String> health = service.getHealthStatus();

        assertThat(health)
                .containsEntry("status", "DISABLED")
                .containsEntry("service", "BookStore Chatbot")
                .containsEntry("model", "disabled")
                .containsEntry("providerEnabled", "false");
        assertThat(health.get("message")).contains("tắt");
    }

    @Test
    void grokServiceReportsDegradedHealthWithoutApiKey() {
        GrokChatbotService service = newGrokService();
        ReflectionTestUtils.setField(service, "grokApiKey", "");
        ReflectionTestUtils.setField(service, "grokModel", "grok-3");

        Map<String, String> health = service.getHealthStatus();

        assertThat(health)
                .containsEntry("status", "DEGRADED")
                .containsEntry("service", "Grok AI Chatbot")
                .containsEntry("model", "grok-3")
                .containsEntry("providerEnabled", "true");
        assertThat(health.get("message")).contains("API key");
    }

    @Test
    void grokServiceKeepsStartupHealthyButMarksRecentFailures() {
        GrokChatbotService service = newGrokService();
        ReflectionTestUtils.setField(service, "grokApiKey", "test-key");
        ReflectionTestUtils.setField(service, "grokApiUrl", "https://api.x.ai/v1/chat/completions");
        ReflectionTestUtils.setField(service, "grokModel", "grok-3");

        when(restTemplate.exchange(
                eq("https://api.x.ai/v1/chat/completions"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(String.class)
        )).thenThrow(new RuntimeException("network down"));

        User user = new User();
        user.setEmail("customer@example.com");
        user.setFirstName("Nguyễn Khách");

        String reply = ReflectionTestUtils.invokeMethod(
                service,
                "generateReply",
                List.of(Map.of("role", "user", "content", "Tư vấn giúp tôi một cuốn sách kinh doanh")),
                user
        );

        Map<String, String> health = service.getHealthStatus();

        assertThat(reply).contains("Xin loi");
        assertThat(health)
                .containsEntry("status", "DEGRADED")
                .containsEntry("providerEnabled", "true");
        assertThat(health.get("message")).contains("network down");
    }

    private GrokChatbotService newGrokService() {
        return new GrokChatbotService(
                conversationRepository,
                messageRepository,
                feedbackRepository,
                productRepository,
                orderRepository,
                restTemplate,
                objectMapper
        );
    }
}
