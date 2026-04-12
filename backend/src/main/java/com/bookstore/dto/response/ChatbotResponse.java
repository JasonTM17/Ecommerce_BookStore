package com.bookstore.dto.response;

import com.bookstore.entity.MessageRole;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChatbotResponse {

    private Long conversationId;
    private String conversationTitle;
    private String reply;
    private MessageRole role;
    private String modelUsed;
    private Long latencyMs;
    private Integer tokenCount;
    private LocalDateTime createdAt;
    private Map<String, Object> metadata;
    private List<BookSuggestion> bookSuggestions;
    private List<QuickAction> quickActions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookSuggestion {
        private Long productId;
        private String title;
        private String author;
        private Double price;
        private String imageUrl;
        private Double averageRating;
        private String reason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuickAction {
        private String action;
        private String label;
        private String icon;
        private Map<String, Object> params;
    }
}
