package com.bookstore.controller;

import com.bookstore.dto.request.ChatFeedbackRequest;
import com.bookstore.dto.request.ChatMessageRequest;
import com.bookstore.dto.response.ApiResponse;
import com.bookstore.dto.response.ChatbotResponse;
import com.bookstore.dto.response.ConversationResponse;
import com.bookstore.entity.User;
import com.bookstore.service.GrokChatbotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
@Tag(name = "AI Chatbot", description = "API chatbot AI hỗ trợ khách hàng bằng Grok")
@SecurityRequirement(name = "bearerAuth")
public class ChatbotController {

    private final GrokChatbotService chatbotService;

    @PostMapping("/message")
    @Operation(summary = "Gửi tin nhắn cho chatbot AI")
    public ResponseEntity<ApiResponse<ChatbotResponse>> sendMessage(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChatMessageRequest request) {
        ChatbotResponse response = chatbotService.chat(user, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Tin nhắn đã được xử lý"));
    }

    @GetMapping("/conversations")
    @Operation(summary = "Lấy danh sách hội thoại của user")
    public ResponseEntity<ApiResponse<List<ConversationResponse>>> getConversations(
            @AuthenticationPrincipal User user) {
        List<ConversationResponse> conversations = chatbotService.getUserConversations(user);
        return ResponseEntity.ok(ApiResponse.success(conversations));
    }

    @GetMapping("/conversations/{id}")
    @Operation(summary = "Lấy chi tiết một hội thoại")
    public ResponseEntity<ApiResponse<ConversationResponse>> getConversationDetail(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        ConversationResponse conversation = chatbotService.getConversationDetail(user, id);
        return ResponseEntity.ok(ApiResponse.success(conversation));
    }

    @DeleteMapping("/conversations/{id}")
    @Operation(summary = "Xóa một hội thoại")
    public ResponseEntity<ApiResponse<Void>> deleteConversation(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        chatbotService.deleteConversation(user, id);
        return ResponseEntity.ok(ApiResponse.success(null, "Hội thoại đã được xóa"));
    }

    @PostMapping("/feedback")
    @Operation(summary = "Gửi feedback cho tin nhắn chatbot")
    public ResponseEntity<ApiResponse<Void>> submitFeedback(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChatFeedbackRequest request) {
        chatbotService.submitFeedback(user, request);
        return ResponseEntity.ok(ApiResponse.success(null, "Cảm ơn bạn đã gửi feedback!"));
    }

    @GetMapping("/stats")
    @Operation(summary = "Lấy thống kê chatbot (Admin)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getChatbotStats() {
        Map<String, Object> stats = chatbotService.getChatbotStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/health")
    @Operation(summary = "Kiểm tra trạng thái Grok API")
    public ResponseEntity<ApiResponse<Map<String, String>>> checkHealth() {
        Map<String, String> health = Map.of(
                "status", "UP",
                "service", "Grok AI Chatbot",
                "model", "grok-3"
        );
        return ResponseEntity.ok(ApiResponse.success(health));
    }
}
