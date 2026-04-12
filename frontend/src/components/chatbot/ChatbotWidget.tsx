"use client";

import { useState, useRef, useEffect } from "react";
import { X, MessageCircle, Hand } from "lucide-react";
import { ChatHeader } from "./ChatHeader";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ChatConversations } from "./ChatConversations";
import { useAuth } from "@/components/providers/auth-provider";
import {
  chatbotApi,
  ChatMessage as ChatMessageType,
  ChatbotResponse,
} from "@/lib/chatbot";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { notifyToast } from "@/lib/toast";

interface ChatbotWidgetProps {
  defaultOpen?: boolean;
}

export function ChatbotWidget({ defaultOpen = false }: ChatbotWidgetProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [showConversations, setShowConversations] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !isAuthenticated) return;

    const userMsg: ChatMessageType = {
      id: Date.now(),
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response: ChatbotResponse = await chatbotApi.sendMessage({
        message,
        conversationId: currentConversationId,
      });

      setCurrentConversationId(response.conversationId);

      const aiMsg: ChatMessageType = {
        id: response.conversationId * 1000 + Math.random(),
        role: "assistant",
        content: response.reply,
        createdAt: response.createdAt,
        bookSuggestions: response.bookSuggestions,
        quickActions: response.quickActions,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error: any) {
      notifyToast(
        toast,
        "error",
        error?.response?.data?.message || "Không thể gửi tin nhắn. Vui lòng thử lại.",
        {
          description: "Lỗi",
        }
      );

      const fallbackMsg: ChatMessageType = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          "Xin lỗi bạn, hiện tại mình đang gặp chút trục trặc kỹ thuật. Vui lòng thử lại sau nhé!",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSelectConversation = (
    conversationId: number,
    conversationMessages: ChatMessageType[]
  ) => {
    setCurrentConversationId(conversationId);
    setMessages(conversationMessages);
    setShowConversations(false);
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setShowConversations(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full",
          "bg-gradient-to-br from-blue-600 to-blue-700",
          "shadow-lg shadow-blue-500/40 hover:shadow-blue-500/60",
          "flex items-center justify-center",
          "transition-all duration-300 hover:scale-110 active:scale-95",
          "group"
        )}
        aria-label="Mở chatbot"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white group-hover:rotate-90 transition-transform duration-300" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6 text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
          </>
        )}
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-50",
          "w-[380px] h-[550px] max-h-[calc(100vh-120px)]",
          "bg-white rounded-2xl shadow-2xl shadow-gray-900/20",
          "flex flex-col overflow-hidden",
          "transition-all duration-300 ease-out",
          isOpen && !isMinimized
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        )}
      >
        {/* Header */}
        <ChatHeader
          onClose={() => setIsOpen(false)}
          onMinimize={() => setIsMinimized(!isMinimized)}
          onShowConversations={() => setShowConversations(!showConversations)}
          onNewChat={handleNewChat}
          isMinimized={isMinimized}
        />

        {/* Content Area */}
        {!isMinimized && (
          <div className="flex-1 flex overflow-hidden">
            {/* Conversations Sidebar */}
            {showConversations && (
              <ChatConversations
                currentConversationId={currentConversationId}
                onSelectConversation={handleSelectConversation}
                onClose={() => setShowConversations(false)}
              />
            )}

            {/* Messages Area */}
            <div className="flex-1 flex flex-col bg-gray-50/50">
              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-4"
                role="log"
                aria-live="polite"
                aria-label="Tin nhắn chatbot"
              >
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                      <MessageCircle className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      Xin chào! <Hand className="h-4 w-4 text-blue-500" />
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Mình là trợ lý bán sách của BookStore. Bạn cần tìm sách
                      gì hôm nay?
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {[
                        "Tìm sách về Python",
                        "Sách self-help hay",
                        "Đơn hàng của tôi",
                        "Mã giảm giá",
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSendMessage(suggestion)}
                          className="px-3 py-1.5 text-xs bg-white border border-blue-200 text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, index) => (
                  <ChatMessage key={msg.id || index} message={msg} />
                ))}

                {isTyping && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                      <MessageCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <ChatInput
                onSendMessage={handleSendMessage}
                isTyping={isTyping}
                disabled={!isAuthenticated}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
