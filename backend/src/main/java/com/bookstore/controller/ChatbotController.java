package com.bookstore.controller;

import com.bookstore.dto.request.ChatFeedbackRequest;
import com.bookstore.dto.request.ChatMessageRequest;
import com.bookstore.dto.response.ApiResponse;
import com.bookstore.dto.response.ChatbotResponse;
import com.bookstore.dto.response.ConversationResponse;
import com.bookstore.entity.User;
import com.bookstore.service.ChatbotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/chatbot")
@RequiredArgsConstructor
@Tag(name = "AI Chatbot", description = "API chatbot AI ho tro khach hang bang Grok")
@SecurityRequirement(name = "bearerAuth")
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping("/message")
    @Operation(summary = "Gui tin nhan cho chatbot AI")
    public ResponseEntity<ApiResponse<ChatbotResponse>> sendMessage(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChatMessageRequest request) {
        ChatbotResponse response = chatbotService.chat(user, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Tin nhan da duoc xu ly"));
    }

    @GetMapping("/conversations")
    @Operation(summary = "Lay danh sach hoi thoai cua user")
    public ResponseEntity<ApiResponse<List<ConversationResponse>>> getConversations(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(chatbotService.getUserConversations(user)));
    }

    @GetMapping("/conversations/{id}")
    @Operation(summary = "Lay chi tiet mot hoi thoai")
    public ResponseEntity<ApiResponse<ConversationResponse>> getConversationDetail(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(chatbotService.getConversationDetail(user, id)));
    }

    @DeleteMapping("/conversations/{id}")
    @Operation(summary = "Xoa mot hoi thoai")
    public ResponseEntity<ApiResponse<Void>> deleteConversation(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        chatbotService.deleteConversation(user, id);
        return ResponseEntity.ok(ApiResponse.success(null, "Hoi thoai da duoc xoa"));
    }

    @PostMapping("/feedback")
    @Operation(summary = "Gui feedback cho tin nhan chatbot")
    public ResponseEntity<ApiResponse<Void>> submitFeedback(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChatFeedbackRequest request) {
        chatbotService.submitFeedback(user, request);
        return ResponseEntity.ok(ApiResponse.success(null, "Cam on ban da gui feedback!"));
    }

    @GetMapping("/stats")
    @Operation(summary = "Lay thong ke chatbot (Admin)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getChatbotStats() {
        return ResponseEntity.ok(ApiResponse.success(chatbotService.getChatbotStats()));
    }

    @GetMapping("/health")
    @Operation(summary = "Kiem tra trang thai Grok API")
    public ResponseEntity<ApiResponse<Map<String, String>>> checkHealth() {
        return ResponseEntity.ok(ApiResponse.success(chatbotService.getHealthStatus()));
    }
}
