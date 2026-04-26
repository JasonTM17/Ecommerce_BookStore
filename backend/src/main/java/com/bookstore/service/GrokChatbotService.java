package com.bookstore.service;

import com.bookstore.entity.User;
import com.bookstore.repository.ChatConversationRepository;
import com.bookstore.repository.ChatFeedbackRepository;
import com.bookstore.repository.ChatMessageRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.ProductRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@ConditionalOnProperty(name = "grok.enabled", havingValue = "true")
public class GrokChatbotService extends AbstractChatbotService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${grok.api.key:}")
    private String grokApiKey;

    @Value("${grok.api.url:https://api.x.ai/v1/chat/completions}")
    private String grokApiUrl;

    @Value("${grok.model:grok-3}")
    private String grokModel;

    @Value("${grok.max.context.messages:10}")
    private int maxContextMessages;

    private volatile LocalDateTime lastSuccessAt;
    private volatile LocalDateTime lastFailureAt;
    private volatile String lastFailureMessage;

    public GrokChatbotService(
            ChatConversationRepository conversationRepository,
            ChatMessageRepository messageRepository,
            ChatFeedbackRepository feedbackRepository,
            ProductRepository productRepository,
            OrderRepository orderRepository,
            RestTemplate restTemplate,
            ObjectMapper objectMapper) {
        super(conversationRepository, messageRepository, feedbackRepository, productRepository, orderRepository);
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    protected GeneratedReply generateReply(List<Map<String, String>> messages, User user) {
        if (grokApiKey == null || grokApiKey.isBlank()) {
            log.warn("Grok is enabled but GROK_API_KEY is blank, using fallback response");
            return new GeneratedReply(getFallbackResponse(), false);
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(grokApiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("model", grokModel);
            body.put("messages", messages);
            body.put("temperature", 0.7);
            body.put("max_tokens", 500);

            ResponseEntity<String> response = restTemplate.exchange(
                    grokApiUrl,
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode choices = root.path("choices");
                if (choices.isArray() && !choices.isEmpty()) {
                    String content = choices.get(0).path("message").path("content").asText("");
                    if (content.isBlank()) {
                        log.error("Grok API returned an empty message content");
                        markFailure("Grok API returned empty message content");
                        return new GeneratedReply(getFallbackResponse(), false);
                    }
                    markSuccess();
                    return new GeneratedReply(content, true);
                }
            }

            log.error("Grok API returned unexpected response: {}", response.getStatusCode());
            markFailure("Grok API returned " + response.getStatusCode());
            return new GeneratedReply(getFallbackResponse(), false);
        } catch (Exception e) {
            log.error("Error calling Grok API: {}", e.getMessage());
            markFailure(e.getMessage());
            return new GeneratedReply(getFallbackResponse(), false);
        }
    }

    @Override
    protected String getServiceName() {
        return "Grok AI Chatbot";
    }

    @Override
    protected String getStatus() {
        if (grokApiKey == null || grokApiKey.isBlank()) {
            return "DEGRADED";
        }

        if (lastFailureAt != null && (lastSuccessAt == null || lastFailureAt.isAfter(lastSuccessAt))) {
            return "DEGRADED";
        }

        return "UP";
    }

    @Override
    protected String getModelName() {
        return grokModel;
    }

    @Override
    protected int getMaxContextMessages() {
        return maxContextMessages;
    }

    @Override
    protected String getStatusMessage() {
        if (grokApiKey == null || grokApiKey.isBlank()) {
            return "Grok đang bật nhưng chưa có API key trong environment.";
        }

        if (lastFailureAt != null && (lastSuccessAt == null || lastFailureAt.isAfter(lastSuccessAt))) {
            return "Grok đã được cấu hình nhưng lần gọi gần nhất thất bại: "
                    + (lastFailureMessage != null ? lastFailureMessage : "không rõ nguyên nhân");
        }

        return "Grok đã được cấu hình và sẵn sàng trả lời.";
    }

    private void markSuccess() {
        lastSuccessAt = LocalDateTime.now();
        lastFailureAt = null;
        lastFailureMessage = null;
    }

    private void markFailure(String failureMessage) {
        lastFailureAt = LocalDateTime.now();
        lastFailureMessage = failureMessage;
    }
}
