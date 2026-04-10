package com.bookstore.service;

import com.bookstore.dto.request.ChatFeedbackRequest;
import com.bookstore.dto.request.ChatMessageRequest;
import com.bookstore.dto.response.ChatbotResponse;
import com.bookstore.dto.response.ChatbotResponse.BookSuggestion;
import com.bookstore.dto.response.ChatbotResponse.QuickAction;
import com.bookstore.dto.response.ConversationResponse;
import com.bookstore.entity.*;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GrokChatbotService {

    private final ChatConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final ChatFeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${grok.api.key}")
    private String grokApiKey;

    @Value("${grok.api.url:https://api.x.ai/v1/chat/completions}")
    private String grokApiUrl;

    @Value("${grok.model:grok-3}")
    private String grokModel;

    @Value("${grok.max.context.messages:10}")
    private int maxContextMessages;

    private static final String SYSTEM_PROMPT = """
        Bạn là trợ lý bán sách thân thiện của BookStore - một cửa hàng sách trực tuyến hàng đầu tại Việt Nam.

        NHIỆM VỤ CỦA BẠN:
        - Tư vấn sách theo sở thích, độ tuổi, thể loại yêu thích của khách hàng
        - Trả lời câu hỏi về sản phẩm, đơn hàng, đổi trả, vận chuyển
        - So sánh các cuốn sách khi được yêu cầu
        - Hỗ trợ tìm kiếm sách theo tác giả, thể loại, chủ đề
        - Luôn khuyến khích mua sách một cách tự nhiên

        PHONG CÁCH TRẢ LỜI:
        - Thân thiện, gần gũi như đang trò chuyện với người bạn
        - Sử dụng tiếng Việt, có thể xen lẫn tiếng Anh cho tên sách/tác giả
        - Trả lời NGẮN GỌN (dưới 200 từ) trừ khi cần chi tiết
        - Dùng emoji phù hợp để tăng tính tương tác
        - Nếu không biết → gợi ý hotline: 1900-xxxx hoặc email: support@bookstore.com

        CÁC TÍNH NĂNG CỦA CỬA HÀNG:
        - Giao hàng toàn quốc, miễn phí vận chuyển cho đơn từ 200.000đ
        - Đổi trả trong 7 ngày nếu sách lỗi
        - Thường xuyên có flash sale và mã giảm giá
        - Hỗ trợ thanh toán qua VNPay, COD

        QUY TẮC QUAN TRỌNG:
        - Không bịa đặt thông tin sách (nếu không chắc → nói rõ không biết)
        - Không đề cập là mình là AI/chatbot
        - Luôn hỏi thêm để đưa ra gợi ý chính xác hơn
        - Không spam quảng cáo, chỉ suggest khi phù hợp
        """;

    @Transactional
    public ChatbotResponse chat(User user, ChatMessageRequest request) {
        long startTime = System.currentTimeMillis();

        // Get or create conversation
        ChatConversation conversation = getOrCreateConversation(user, request.getConversationId(), request.getConversationTitle());

        // Get conversation history for context
        List<ChatMessage> history = getConversationHistory(conversation);

        // Build messages for Grok API
        List<Map<String, String>> messages = buildMessages(history, request.getMessage(), user);

        // Call Grok API
        String reply = callGrokApi(messages);
        long latency = System.currentTimeMillis() - startTime;

        // Save user message
        ChatMessage userMessage = ChatMessage.builder()
                .conversation(conversation)
                .role(MessageRole.USER)
                .content(request.getMessage())
                .isFromGrok(false)
                .build();
        messageRepository.save(userMessage);

        // Save AI response
        ChatMessage aiMessage = ChatMessage.builder()
                .conversation(conversation)
                .role(MessageRole.ASSISTANT)
                .content(reply)
                .isFromGrok(true)
                .modelUsed(grokModel)
                .latencyMs(latency)
                .build();
        aiMessage = messageRepository.save(aiMessage);

        // Update conversation
        conversation.setUpdatedAt(LocalDateTime.now());
        conversation.setMessageCount(conversation.getMessageCount() + 2);
        conversationRepository.save(conversation);

        // Build response with suggestions
        return buildResponse(conversation, aiMessage, user);
    }

    private ChatConversation getOrCreateConversation(User user, Long conversationId, String title) {
        if (conversationId != null) {
            return conversationRepository.findByIdAndUser(conversationId, user)
                    .orElseThrow(() -> new ResourceNotFoundException("Conversation", "id", conversationId));
        }

        // Create new conversation
        String conversationTitle = title != null && !title.isBlank() ? title : "Cuộc trò chuyện mới";
        return conversationRepository.save(ChatConversation.builder()
                .user(user)
                .title(conversationTitle)
                .isActive(true)
                .messageCount(0)
                .build());
    }

    private List<ChatMessage> getConversationHistory(ChatConversation conversation) {
        List<ChatMessage> messages = messageRepository.findRecentByConversation(
                conversation, PageRequest.of(0, maxContextMessages * 2));
        Collections.reverse(messages);
        return messages;
    }

    private List<Map<String, String>> buildMessages(List<ChatMessage> history, String newMessage, User user) {
        List<Map<String, String>> messages = new ArrayList<>();

        // System message
        String systemWithContext = SYSTEM_PROMPT;
        try {
            systemWithContext += buildUserContext(user);
        } catch (Exception e) {
            log.warn("Could not build user context: {}", e.getMessage());
        }
        messages.add(Map.of("role", "system", "content", systemWithContext));

        // History messages
        for (ChatMessage msg : history) {
            messages.add(Map.of(
                    "role", msg.getRole() == MessageRole.USER ? "user" : "assistant",
                    "content", msg.getContent()
            ));
        }

        // New message
        messages.add(Map.of("role", "user", "content", newMessage));

        return messages;
    }

    private String buildUserContext(User user) {
        StringBuilder context = new StringBuilder("\n\nTHÔNG TIN KHÁCH HÀNG:");
        context.append("\n- Tên: ").append(user.getFullName());
        context.append("\n- Email: ").append(user.getEmail());

        // Get order count
        try {
            var orders = orderRepository.findByUserId(user.getId(), org.springframework.data.domain.PageRequest.of(0, 1));
            context.append("\n- Số đơn hàng đã mua: ").append(orders.getTotalElements());
        } catch (Exception e) {
            context.append("\n- Số đơn hàng đã mua: 0");
        }

        context.append("\n\nTrả lời khách hàng một cách tự nhiên, có thể đề cập đến lịch sử mua hàng nếu phù hợp.");

        return context.toString();
    }

    private String callGrokApi(List<Map<String, String>> messages) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(grokApiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("model", grokModel);
            body.put("messages", messages);
            body.put("temperature", 0.7);
            body.put("max_tokens", 500);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    grokApiUrl,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode choices = root.path("choices");
                if (choices.isArray() && !choices.isEmpty()) {
                    return choices.get(0).path("message").path("content").asText();
                }
            }

            log.error("Grok API returned unexpected response: {}", response.getStatusCode());
            return getFallbackResponse();

        } catch (Exception e) {
            log.error("Error calling Grok API: {}", e.getMessage());
            return getFallbackResponse();
        }
    }

    private String getFallbackResponse() {
        return """
            Xin lỗi bạn, hiện tại mình đang gặp chút trục trặc kỹ thuật. 😔

            Bạn có thể:
            - Thử hỏi lại câu hỏi của mình
            - Liên hệ hotline: 1900-xxxx để được hỗ trợ nhanh hơn
            - Email: support@bookstore.com

            Cảm ơn bạn đã thông cảm! 🙏
            """;
    }

    private ChatbotResponse buildResponse(ChatConversation conversation, ChatMessage aiMessage, User user) {
        String reply = aiMessage.getContent();
        List<BookSuggestion> bookSuggestions = extractBookSuggestions(reply);
        List<QuickAction> quickActions = buildQuickActions(reply);

        return ChatbotResponse.builder()
                .conversationId(conversation.getId())
                .conversationTitle(conversation.getTitle())
                .reply(reply)
                .role(MessageRole.ASSISTANT)
                .modelUsed(grokModel)
                .latencyMs(aiMessage.getLatencyMs())
                .createdAt(aiMessage.getCreatedAt())
                .bookSuggestions(bookSuggestions)
                .quickActions(quickActions)
                .build();
    }

    private List<BookSuggestion> extractBookSuggestions(String reply) {
        // Simple keyword detection for book recommendations
        List<BookSuggestion> suggestions = new ArrayList<>();

        String lowerReply = reply.toLowerCase();
        if (lowerReply.contains("gợi ý") || lowerReply.contains("recommend") ||
            lowerReply.contains("cuốn sách") || lowerReply.contains("đọc")) {
            try {
                List<Product> topProducts = productRepository.findTopProductsByOrderCount(
                        org.springframework.data.domain.PageRequest.of(0, 3));
                for (Product product : topProducts) {
                    suggestions.add(BookSuggestion.builder()
                            .productId(product.getId())
                            .title(product.getName())
                            .author(product.getAuthor())
                            .price(product.getCurrentPrice() != null ? product.getCurrentPrice().doubleValue() : 0.0)
                            .imageUrl(product.getImageUrl())
                            .averageRating(product.getAvgRating())
                            .reason("Gợi ý từ AI")
                            .build());
                }
            } catch (Exception e) {
                log.warn("Could not extract book suggestions: {}", e.getMessage());
            }
        }

        return suggestions;
    }

    private List<QuickAction> buildQuickActions(String reply) {
        List<QuickAction> actions = new ArrayList<>();

        String lowerReply = reply.toLowerCase();
        if (lowerReply.contains("tìm") || lowerReply.contains("search")) {
            actions.add(QuickAction.builder()
                    .action("search")
                    .label("Tìm kiếm sách")
                    .icon("search")
                    .build());
        }
        if (lowerReply.contains("đơn hàng") || lowerReply.contains("order")) {
            actions.add(QuickAction.builder()
                    .action("track_order")
                    .label("Theo dõi đơn hàng")
                    .icon("package")
                    .build());
        }
        if (lowerReply.contains("giỏ hàng") || lowerReply.contains("cart")) {
            actions.add(QuickAction.builder()
                    .action("view_cart")
                    .label("Xem giỏ hàng")
                    .icon("shopping-cart")
                    .build());
        }
        if (lowerReply.contains("khuyến mãi") || lowerReply.contains("sale")) {
            actions.add(QuickAction.builder()
                    .action("view_promotions")
                    .label("Xem khuyến mãi")
                    .icon("tag")
                    .build());
        }

        return actions;
    }

    @Transactional(readOnly = true)
    public List<ConversationResponse> getUserConversations(User user) {
        List<ChatConversation> conversations = conversationRepository.findActiveByUser(user);
        return conversations.stream()
                .map(this::mapToConversationResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ConversationResponse getConversationDetail(User user, Long conversationId) {
        ChatConversation conversation = conversationRepository.findByIdAndUser(conversationId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", "id", conversationId));

        List<ChatMessage> messages = messageRepository.findByConversationOrderByCreatedAtAsc(conversation);
        List<ConversationResponse.MessageResponse> messageResponses = messages.stream()
                .map(m -> ConversationResponse.MessageResponse.builder()
                        .id(m.getId())
                        .role(m.getRole().name().toLowerCase())
                        .content(m.getContent())
                        .createdAt(m.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ConversationResponse.builder()
                .id(conversation.getId())
                .title(conversation.getTitle())
                .isActive(conversation.getIsActive())
                .messageCount(conversation.getMessageCount())
                .lastMessage(messages.isEmpty() ? "" : messages.get(messages.size() - 1).getContent())
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
                .recentMessages(messageResponses)
                .build();
    }

    private ConversationResponse mapToConversationResponse(ChatConversation conversation) {
        List<ChatMessage> messages = messageRepository.findRecentByConversation(
                conversation, PageRequest.of(0, 1));
        String lastMessage = messages.isEmpty() ? "" : messages.get(0).getContent();

        return ConversationResponse.builder()
                .id(conversation.getId())
                .title(conversation.getTitle())
                .isActive(conversation.getIsActive())
                .messageCount(conversation.getMessageCount())
                .lastMessage(lastMessage)
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
                .build();
    }

    @Transactional
    public void deleteConversation(User user, Long conversationId) {
        ChatConversation conversation = conversationRepository.findByIdAndUser(conversationId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", "id", conversationId));

        conversation.setIsActive(false);
        conversationRepository.save(conversation);
        log.info("Conversation {} deleted for user {}", conversationId, user.getEmail());
    }

    @Transactional
    public void submitFeedback(User user, ChatFeedbackRequest request) {
        if (request.getMessageId() == null) {
            throw new BadRequestException("Message ID không được để trống");
        }

        ChatMessage message = messageRepository.findById(request.getMessageId())
                .orElseThrow(() -> new ResourceNotFoundException("ChatMessage", "id", request.getMessageId()));

        if (!message.getConversation().getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền đánh giá tin nhắn này");
        }

        if (feedbackRepository.existsByMessageId(request.getMessageId())) {
            throw new BadRequestException("Bạn đã đánh giá tin nhắn này rồi");
        }

        ChatFeedback feedback = ChatFeedback.builder()
                .message(message)
                .rating(request.getRating() != null ? request.getRating() : 5)
                .comment(request.getComment())
                .isHelpful(request.getIsHelpful())
                .improvementSuggestion(request.getImprovementSuggestion())
                .build();

        feedbackRepository.save(feedback);
        log.info("Feedback submitted for message {} by user {}", request.getMessageId(), user.getEmail());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getChatbotStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalConversations = conversationRepository.count();
        long totalMessages = messageRepository.count();
        long grokMessages = messageRepository.findByIsFromGrokTrue().size();
        long totalFeedback = feedbackRepository.count();

        stats.put("totalConversations", totalConversations);
        stats.put("totalMessages", totalMessages);
        stats.put("grokResponses", grokMessages);
        stats.put("totalFeedback", totalFeedback);
        stats.put("averageResponseTime", grokMessages > 0 ?
                messageRepository.findByIsFromGrokTrue().stream()
                        .mapToLong(m -> m.getLatencyMs() != null ? m.getLatencyMs() : 0)
                        .average().orElse(0) : 0);

        return stats;
    }
}
