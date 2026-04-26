package com.bookstore.service;

import com.bookstore.dto.request.ChatFeedbackRequest;
import com.bookstore.dto.request.ChatMessageRequest;
import com.bookstore.dto.response.ChatbotResponse;
import com.bookstore.dto.response.ChatbotResponse.BookSuggestion;
import com.bookstore.dto.response.ChatbotResponse.QuickAction;
import com.bookstore.dto.response.ConversationResponse;
import com.bookstore.entity.ChatConversation;
import com.bookstore.entity.ChatFeedback;
import com.bookstore.entity.ChatMessage;
import com.bookstore.entity.MessageRole;
import com.bookstore.entity.Product;
import com.bookstore.entity.User;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.ChatConversationRepository;
import com.bookstore.repository.ChatFeedbackRepository;
import com.bookstore.repository.ChatMessageRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.ProductRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
public abstract class AbstractChatbotService implements ChatbotService {

    protected static final String SYSTEM_PROMPT = """
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
        - Nếu không biết thì gợi ý hotline: 1900-xxxx hoặc email: support@bookstore.com

        CÁC TÍNH NĂNG CỦA CỬA HÀNG:
        - Giao hàng toàn quốc, miễn phí vận chuyển cho đơn từ 200.000đ
        - Đổi trả trong 7 ngày nếu sách lỗi
        - Thường xuyên có flash sale và mã giảm giá
        - Hỗ trợ thanh toán qua VNPay, COD

        QUY TẮC QUAN TRỌNG:
        - Không bịa đặt thông tin sách
        - Không đề cập là mình là AI/chatbot
        - Luôn hỏi thêm để đưa ra gợi ý chính xác hơn
        - Không spam quảng cáo, chỉ suggest khi phù hợp
        """;

    protected final ChatConversationRepository conversationRepository;
    protected final ChatMessageRepository messageRepository;
    protected final ChatFeedbackRepository feedbackRepository;
    protected final ProductRepository productRepository;
    protected final OrderRepository orderRepository;

    protected AbstractChatbotService(
            ChatConversationRepository conversationRepository,
            ChatMessageRepository messageRepository,
            ChatFeedbackRepository feedbackRepository,
            ProductRepository productRepository,
            OrderRepository orderRepository) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.feedbackRepository = feedbackRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    @Transactional
    public ChatbotResponse chat(User user, ChatMessageRequest request) {
        long startTime = System.currentTimeMillis();

        ChatConversation conversation = getOrCreateConversation(
                user,
                request.getConversationId(),
                request.getConversationTitle()
        );

        List<ChatMessage> history = getConversationHistory(conversation);
        List<Map<String, String>> messages = buildMessages(history, request.getMessage(), user);
        GeneratedReply generatedReply = generateReply(messages, user);
        String reply = generatedReply.content();
        long latency = System.currentTimeMillis() - startTime;

        messageRepository.save(ChatMessage.builder()
                .conversation(conversation)
                .role(MessageRole.USER)
                .content(request.getMessage())
                .isFromGrok(false)
                .build());

        ChatMessage aiMessage = messageRepository.save(ChatMessage.builder()
                .conversation(conversation)
                .role(MessageRole.ASSISTANT)
                .content(reply)
                .isFromGrok(generatedReply.providerResponse())
                .modelUsed(getModelName())
                .latencyMs(latency)
                .build());

        conversation.setUpdatedAt(LocalDateTime.now());
        conversation.setMessageCount((conversation.getMessageCount() != null ? conversation.getMessageCount() : 0) + 2);
        conversationRepository.save(conversation);

        return buildResponse(conversation, aiMessage);
    }

    protected record GeneratedReply(String content, boolean providerResponse) {
    }

    protected abstract GeneratedReply generateReply(List<Map<String, String>> messages, User user);

    protected abstract String getServiceName();

    protected abstract String getStatus();

    protected abstract String getModelName();

    protected boolean isProviderEnabled() {
        return true;
    }

    protected int getMaxContextMessages() {
        return 10;
    }

    @Override
    public Map<String, String> getHealthStatus() {
        Map<String, String> health = new LinkedHashMap<>();
        health.put("status", getStatus());
        health.put("service", getServiceName());
        health.put("model", getModelName());
        health.put("message", getStatusMessage());
        health.put("providerEnabled", Boolean.toString(isProviderEnabled()));
        return health;
    }

    protected String getStatusMessage() {
        return switch (getStatus()) {
            case "DISABLED" -> "Chatbot đang được tắt cho môi trường này.";
            case "DEGRADED" -> "Chatbot đang chạy ở chế độ dự phòng.";
            default -> "Chatbot sẵn sàng hỗ trợ.";
        };
    }

    protected String getFallbackResponse() {
        return """
            Xin lỗi bạn, hiện tại mình đang gặp chút trục trặc kỹ thuật.

            Bạn có thể:
            - Thử hỏi lại câu hỏi của mình
            - Liên hệ hotline: 1900-xxxx để được hỗ trợ nhanh hơn
            - Email: support@bookstore.com

            Cảm ơn bạn đã thông cảm!
            """;
    }

    protected String getDisabledResponse() {
        return """
            Tính năng tư vấn AI hiện đang tạm tắt trong môi trường này.

            Bạn vẫn có thể:
            - Duyệt danh mục sách và tìm kiếm trực tiếp trên cửa hàng
            - Liên hệ hotline: 1900-xxxx
            - Email: support@bookstore.com

            Khi trợ lý được bật lại, mình sẽ hỗ trợ tư vấn chi tiết hơn.
            """;
    }

    protected ChatConversation getOrCreateConversation(User user, Long conversationId, String title) {
        if (conversationId != null) {
            return conversationRepository.findByIdAndUser(conversationId, user)
                    .orElseThrow(() -> new ResourceNotFoundException("Conversation", "id", conversationId));
        }

        String conversationTitle = title != null && !title.isBlank() ? title : "Cuộc trò chuyện mới";
        return conversationRepository.save(ChatConversation.builder()
                .user(user)
                .title(conversationTitle)
                .isActive(true)
                .messageCount(0)
                .build());
    }

    protected List<ChatMessage> getConversationHistory(ChatConversation conversation) {
        List<ChatMessage> messages = messageRepository.findRecentByConversation(
                conversation,
                PageRequest.of(0, getMaxContextMessages() * 2)
        );
        Collections.reverse(messages);
        return messages;
    }

    protected List<Map<String, String>> buildMessages(List<ChatMessage> history, String newMessage, User user) {
        List<Map<String, String>> messages = new ArrayList<>();

        String systemWithContext = SYSTEM_PROMPT;
        try {
            systemWithContext += buildUserContext(user);
        } catch (Exception e) {
            log.warn("Could not build user context: {}", e.getMessage());
        }
        messages.add(Map.of("role", "system", "content", systemWithContext));

        for (ChatMessage message : history) {
            messages.add(Map.of(
                    "role", message.getRole() == MessageRole.USER ? "user" : "assistant",
                    "content", message.getContent()
            ));
        }

        messages.add(Map.of("role", "user", "content", newMessage));
        return messages;
    }

    protected String buildUserContext(User user) {
        StringBuilder context = new StringBuilder("\n\nTHÔNG TIN KHÁCH HÀNG:");
        context.append("\n- Tên: ").append(user.getFullName());
        context.append("\n- Email: ").append(user.getEmail());

        try {
            var orders = orderRepository.findByUserId(user.getId(), PageRequest.of(0, 1));
            context.append("\n- Số đơn hàng đã mua: ").append(orders.getTotalElements());
        } catch (Exception e) {
            context.append("\n- Số đơn hàng đã mua: 0");
        }

        context.append("\n\nTrả lời khách hàng một cách tự nhiên, có thể đề cập đến lịch sử mua hàng nếu phù hợp.");
        return context.toString();
    }

    protected ChatbotResponse buildResponse(ChatConversation conversation, ChatMessage aiMessage) {
        String reply = aiMessage.getContent();

        return ChatbotResponse.builder()
                .conversationId(conversation.getId())
                .conversationTitle(conversation.getTitle())
                .reply(reply)
                .role(MessageRole.ASSISTANT)
                .modelUsed(aiMessage.getModelUsed())
                .latencyMs(aiMessage.getLatencyMs())
                .createdAt(aiMessage.getCreatedAt())
                .bookSuggestions(extractBookSuggestions(reply))
                .quickActions(buildQuickActions(reply))
                .build();
    }

    protected List<BookSuggestion> extractBookSuggestions(String reply) {
        List<BookSuggestion> suggestions = new ArrayList<>();
        String lowerReply = reply.toLowerCase();

        if (lowerReply.contains("goi y")
                || lowerReply.contains("recommend")
                || lowerReply.contains("cuon sach")
                || lowerReply.contains("doc")) {
            try {
                List<Product> topProducts = productRepository.findTopProductsByOrderCount(PageRequest.of(0, 3));
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

    protected List<QuickAction> buildQuickActions(String reply) {
        List<QuickAction> actions = new ArrayList<>();
        String lowerReply = reply.toLowerCase();

        if (lowerReply.contains("tim") || lowerReply.contains("search")) {
            actions.add(QuickAction.builder()
                    .action("search")
                    .label("Tìm kiếm sách")
                    .icon("search")
                    .build());
        }
        if (lowerReply.contains("don hang") || lowerReply.contains("order")) {
            actions.add(QuickAction.builder()
                    .action("track_order")
                    .label("Theo dõi đơn hàng")
                    .icon("package")
                    .build());
        }
        if (lowerReply.contains("gio hang") || lowerReply.contains("cart")) {
            actions.add(QuickAction.builder()
                    .action("view_cart")
                    .label("Xem giỏ hàng")
                    .icon("shopping-cart")
                    .build());
        }
        if (lowerReply.contains("khuyen mai") || lowerReply.contains("sale")) {
            actions.add(QuickAction.builder()
                    .action("view_promotions")
                    .label("Xem khuyến mãi")
                    .icon("tag")
                    .build());
        }

        return actions;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationResponse> getUserConversations(User user) {
        return conversationRepository.findActiveByUser(user).stream()
                .map(this::mapToConversationResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ConversationResponse getConversationDetail(User user, Long conversationId) {
        ChatConversation conversation = conversationRepository.findByIdAndUser(conversationId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", "id", conversationId));

        List<ChatMessage> messages = messageRepository.findByConversationOrderByCreatedAtAsc(conversation);
        List<ConversationResponse.MessageResponse> messageResponses = messages.stream()
                .map(message -> ConversationResponse.MessageResponse.builder()
                        .id(message.getId())
                        .role(message.getRole().name().toLowerCase())
                        .content(message.getContent())
                        .createdAt(message.getCreatedAt())
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

    protected ConversationResponse mapToConversationResponse(ChatConversation conversation) {
        List<ChatMessage> messages = messageRepository.findRecentByConversation(conversation, PageRequest.of(0, 1));
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

    @Override
    @Transactional
    public void deleteConversation(User user, Long conversationId) {
        ChatConversation conversation = conversationRepository.findByIdAndUser(conversationId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", "id", conversationId));

        conversation.setIsActive(false);
        conversationRepository.save(conversation);
        log.info("Conversation {} deleted for user {}", conversationId, user.getEmail());
    }

    @Override
    @Transactional
    public void submitFeedback(User user, ChatFeedbackRequest request) {
        if (request.getMessageId() == null) {
            throw new BadRequestException("Message ID khong duoc de trong");
        }

        ChatMessage message = messageRepository.findById(request.getMessageId())
                .orElseThrow(() -> new ResourceNotFoundException("ChatMessage", "id", request.getMessageId()));

        if (!message.getConversation().getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Ban khong co quyen danh gia tin nhan nay");
        }

        if (feedbackRepository.existsByMessageId(request.getMessageId())) {
            throw new BadRequestException("Ban da danh gia tin nhan nay roi");
        }

        feedbackRepository.save(ChatFeedback.builder()
                .message(message)
                .rating(request.getRating() != null ? request.getRating() : 5)
                .comment(request.getComment())
                .isHelpful(request.getIsHelpful())
                .improvementSuggestion(request.getImprovementSuggestion())
                .build());

        log.info("Feedback submitted for message {} by user {}", request.getMessageId(), user.getEmail());
    }

    @Override
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
        stats.put("averageResponseTime", grokMessages > 0
                ? messageRepository.findByIsFromGrokTrue().stream()
                .mapToLong(message -> message.getLatencyMs() != null ? message.getLatencyMs() : 0)
                .average()
                .orElse(0)
                : 0);

        return stats;
    }
}
