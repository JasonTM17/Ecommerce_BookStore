package com.bookstore.controller;

import com.bookstore.dto.request.ChatMessageRequest;
import com.bookstore.dto.response.ApiResponse;
import com.bookstore.dto.response.ChatbotResponse;
import com.bookstore.dto.response.ConversationResponse;
import com.bookstore.entity.User;
import com.bookstore.repository.UserRepository;
import com.bookstore.service.GrokChatbotService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("ChatbotController")
class ChatbotControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private GrokChatbotService chatbotService;

    @Autowired
    private UserRepository userRepository;

    private ChatbotResponse chatbotResponse;
    private ConversationResponse conversationResponse;

    @BeforeEach
    void setUp() {
        chatbotResponse = ChatbotResponse.builder()
                .reply("Xin chào! Tôi có thể giúp gì cho bạn hôm nay?")
                .conversationId(1L)
                .createdAt(LocalDateTime.now().toString())
                .build();

        conversationResponse = ConversationResponse.builder()
                .id(1L)
                .userId(1L)
                .title("Hội thoại 1")
                .messageCount(5)
                .lastMessageAt(LocalDateTime.now())
                .build();
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("POST /api/chatbot/message - sends message and returns AI response")
    void sendMessage_success() throws Exception {
        when(chatbotService.chat(any(User.class), any(ChatMessageRequest.class)))
                .thenReturn(chatbotResponse);

        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("Tìm sách về Python")
                .build();

        mockMvc.perform(post("/api/chatbot/message")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.reply").exists())
                .andExpect(jsonPath("$.data.conversationId").value(1));
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("GET /api/chatbot/conversations - returns user conversations")
    void getConversations_success() throws Exception {
        when(chatbotService.getUserConversations(any(User.class)))
                .thenReturn(List.of(conversationResponse));

        mockMvc.perform(get("/api/chatbot/conversations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].title").value("Hội thoại 1"));
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("GET /api/chatbot/conversations/{id} - returns conversation detail")
    void getConversationDetail_success() throws Exception {
        when(chatbotService.getConversationDetail(any(User.class), eq(1L)))
                .thenReturn(conversationResponse);

        mockMvc.perform(get("/api/chatbot/conversations/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    @DisplayName("DELETE /api/chatbot/conversations/{id} - deletes conversation")
    void deleteConversation_success() throws Exception {
        mockMvc.perform(delete("/api/chatbot/conversations/1")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Hội thoại đã được xóa"));
    }

    @Test
    @WithMockUser(username = "admin@bookstore.com", roles = {"ADMIN"})
    @DisplayName("GET /api/chatbot/stats - returns chatbot statistics for admin")
    void getChatbotStats_asAdmin() throws Exception {
        when(chatbotService.getChatbotStats())
                .thenReturn(Map.of(
                        "totalConversations", 100,
                        "totalMessages", 500,
                        "averageResponseTime", "1.2s"
                ));

        mockMvc.perform(get("/api/chatbot/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalConversations").value(100));
    }

    @Test
    @DisplayName("POST /api/chatbot/message - returns 401 when not authenticated")
    void sendMessage_unauthenticated() throws Exception {
        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("Hello")
                .build();

        mockMvc.perform(post("/api/chatbot/message")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/chatbot/health - returns service health status")
    void checkHealth_success() throws Exception {
        mockMvc.perform(get("/api/chatbot/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("UP"))
                .andExpect(jsonPath("$.data.service").value("Grok AI Chatbot"));
    }
}
