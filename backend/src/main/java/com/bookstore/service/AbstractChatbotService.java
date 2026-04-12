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
        Ban la tro ly ban sach than thien cua BookStore - mot cua hang sach truc tuyen hang dau tai Viet Nam.

        NHIEM VU CUA BAN:
        - Tu van sach theo so thich, do tuoi, the loai yeu thich cua khach hang
        - Tra loi cau hoi ve san pham, don hang, doi tra, van chuyen
        - So sanh cac cuon sach khi duoc yeu cau
        - Ho tro tim kiem sach theo tac gia, the loai, chu de
        - Luon khuyen khich mua sach mot cach tu nhien

        PHONG CACH TRA LOI:
        - Than thien, gan gui nhu dang tro chuyen voi nguoi ban
        - Su dung tieng Viet, co the xen lan tieng Anh cho ten sach/tac gia
        - Tra loi NGAN GON (duoi 200 tu) tru khi can chi tiet
        - Neu khong biet thi goi y hotline: 1900-xxxx hoac email: support@bookstore.com

        CAC TINH NANG CUA CUA HANG:
        - Giao hang toan quoc, mien phi van chuyen cho don tu 200.000d
        - Doi tra trong 7 ngay neu sach loi
        - Thuong xuyen co flash sale va ma giam gia
        - Ho tro thanh toan qua VNPay, COD

        QUY TAC QUAN TRONG:
        - Khong bia dat thong tin sach
        - Khong de cap la minh la AI/chatbot
        - Luon hoi them de dua ra goi y chinh xac hon
        - Khong spam quang cao, chi suggest khi phu hop
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
        String reply = generateReply(messages, user);
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
                .isFromGrok(isProviderEnabled())
                .modelUsed(getModelName())
                .latencyMs(latency)
                .build());

        conversation.setUpdatedAt(LocalDateTime.now());
        conversation.setMessageCount((conversation.getMessageCount() != null ? conversation.getMessageCount() : 0) + 2);
        conversationRepository.save(conversation);

        return buildResponse(conversation, aiMessage);
    }

    protected abstract String generateReply(List<Map<String, String>> messages, User user);

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
            Xin loi ban, hien tai minh dang gap chut truc trac ky thuat.

            Ban co the:
            - Thu hoi lai cau hoi cua minh
            - Lien he hotline: 1900-xxxx de duoc ho tro nhanh hon
            - Email: support@bookstore.com

            Cam on ban da thong cam!
            """;
    }

    protected String getDisabledResponse() {
        return """
            Tinh nang tu van AI hien dang tam tat trong moi truong nay.

            Ban van co the:
            - Duyet danh muc sach va tim kiem truc tiep tren cua hang
            - Lien he hotline: 1900-xxxx
            - Email: support@bookstore.com

            Khi Grok duoc bat lai, minh se ho tro tu van chi tiet hon.
            """;
    }

    protected ChatConversation getOrCreateConversation(User user, Long conversationId, String title) {
        if (conversationId != null) {
            return conversationRepository.findByIdAndUser(conversationId, user)
                    .orElseThrow(() -> new ResourceNotFoundException("Conversation", "id", conversationId));
        }

        String conversationTitle = title != null && !title.isBlank() ? title : "Cuoc tro chuyen moi";
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
        StringBuilder context = new StringBuilder("\n\nTHONG TIN KHACH HANG:");
        context.append("\n- Ten: ").append(user.getFullName());
        context.append("\n- Email: ").append(user.getEmail());

        try {
            var orders = orderRepository.findByUserId(user.getId(), PageRequest.of(0, 1));
            context.append("\n- So don hang da mua: ").append(orders.getTotalElements());
        } catch (Exception e) {
            context.append("\n- So don hang da mua: 0");
        }

        context.append("\n\nTra loi khach hang mot cach tu nhien, co the de cap den lich su mua hang neu phu hop.");
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
                            .reason("Goi y tu AI")
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
                    .label("Tim kiem sach")
                    .icon("search")
                    .build());
        }
        if (lowerReply.contains("don hang") || lowerReply.contains("order")) {
            actions.add(QuickAction.builder()
                    .action("track_order")
                    .label("Theo doi don hang")
                    .icon("package")
                    .build());
        }
        if (lowerReply.contains("gio hang") || lowerReply.contains("cart")) {
            actions.add(QuickAction.builder()
                    .action("view_cart")
                    .label("Xem gio hang")
                    .icon("shopping-cart")
                    .build());
        }
        if (lowerReply.contains("khuyen mai") || lowerReply.contains("sale")) {
            actions.add(QuickAction.builder()
                    .action("view_promotions")
                    .label("Xem khuyen mai")
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
