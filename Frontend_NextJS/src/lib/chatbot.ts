"use client";

import { api } from "@/lib/api";

export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: number;
  title: string;
  isActive: boolean;
  messageCount: number;
  lastMessage: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookSuggestion {
  productId: number;
  title: string;
  author: string;
  price: number;
  imageUrl: string;
  averageRating: number;
  reason: string;
}

export interface QuickAction {
  action: string;
  label: string;
  icon: string;
}

export interface ChatbotResponse {
  conversationId: number;
  conversationTitle: string;
  reply: string;
  modelUsed: string;
  latencyMs: number;
  createdAt: string;
  bookSuggestions: BookSuggestion[];
  quickActions: QuickAction[];
}

export interface ChatMessageRequest {
  message: string;
  conversationId?: number | null;
  conversationTitle?: string;
}

export const chatbotApi = {
  sendMessage: async (request: ChatMessageRequest) => {
    const response = await api.post<{ data: ChatbotResponse }>(
      "/chatbot/message",
      request
    );
    return response.data.data;
  },

  getConversations: async () => {
    const response = await api.get<{ data: Conversation[] }>(
      "/chatbot/conversations"
    );
    return response.data.data;
  },

  getConversationDetail: async (id: number) => {
    const response = await api.get<{ data: ConversationDetailResponse }>(
      `/chatbot/conversations/${id}`
    );
    return response.data.data;
  },

  deleteConversation: async (id: number) => {
    await api.delete(`/chatbot/conversations/${id}`);
  },

  submitFeedback: async (
    messageId: number,
    rating?: number,
    comment?: string,
    isHelpful?: boolean
  ) => {
    await api.post("/chatbot/feedback", {
      messageId,
      rating,
      comment,
      isHelpful,
    });
  },

  checkHealth: async () => {
    const response = await api.get<{ data: { status: string } }>(
      "/chatbot/health"
    );
    return response.data.data;
  },
};

export interface ConversationDetailResponse {
  id: number;
  title: string;
  isActive: boolean;
  messageCount: number;
  lastMessage: string;
  createdAt: string;
  updatedAt: string;
  recentMessages: ChatMessage[];
}
