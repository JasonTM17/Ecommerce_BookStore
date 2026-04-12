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
    protected String generateReply(List<Map<String, String>> messages, User user) {
        if (grokApiKey == null || grokApiKey.isBlank()) {
            log.warn("Grok is enabled but GROK_API_KEY is blank, using fallback response");
            return getFallbackResponse();
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
                    return choices.get(0).path("message").path("content").asText(getFallbackResponse());
                }
            }

            log.error("Grok API returned unexpected response: {}", response.getStatusCode());
            return getFallbackResponse();
        } catch (Exception e) {
            log.error("Error calling Grok API: {}", e.getMessage());
            return getFallbackResponse();
        }
    }

    @Override
    protected String getServiceName() {
        return "Grok AI Chatbot";
    }

    @Override
    protected String getStatus() {
        return (grokApiKey == null || grokApiKey.isBlank()) ? "DEGRADED" : "UP";
    }

    @Override
    protected String getModelName() {
        return grokModel;
    }

    @Override
    protected int getMaxContextMessages() {
        return maxContextMessages;
    }
}
