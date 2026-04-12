"use client";

import { useEffect, useState } from "react";
import { X, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { chatbotApi, Conversation, ChatMessage } from "@/lib/chatbot";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { notifyToast } from "@/lib/toast";

interface ChatConversationsProps {
  currentConversationId: number | null;
  onSelectConversation: (conversationId: number, messages: ChatMessage[]) => void;
  onClose: () => void;
}

export function ChatConversations({ currentConversationId, onSelectConversation, onClose }: ChatConversationsProps) {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadConversations = async () => {
      try {
        setLoading(true);
        const data = await chatbotApi.getConversations();
        if (isMounted) {
          setConversations(data);
        }
      } catch {
        notifyToast(toast, "error", "Không thể tải lịch sử hội thoại", { description: "Lỗi" });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadConversations();

    return () => {
      isMounted = false;
    };
  }, [toast]);

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedId(conversation.id);

    try {
      const detail = await chatbotApi.getConversationDetail(conversation.id);
      const messages: ChatMessage[] = detail.recentMessages.map((msg) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        createdAt: msg.createdAt,
      }));
      onSelectConversation(conversation.id, messages);
    } catch {
      notifyToast(toast, "error", "Không thể tải chi tiết hội thoại", { description: "Lỗi" });
    }
  };

  const handleDeleteConversation = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();

    try {
      await chatbotApi.deleteConversation(id);
      setConversations((prev) => prev.filter((conversation) => conversation.id !== id));
      notifyToast(toast, "success", "Hội thoại đã được xóa", { description: "Thành công" });
    } catch {
      notifyToast(toast, "error", "Không thể xóa hội thoại", { description: "Lỗi" });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div className="w-64 bg-white border-r border-gray-100 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">Lịch sử</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-7 w-7"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>Chưa có hội thoại nào</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation)}
                className={cn(
                  "w-full p-3 rounded-xl text-left transition-all group",
                  "hover:bg-gray-50",
                  currentConversationId === conversation.id && "bg-blue-50"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        currentConversationId === conversation.id
                          ? "text-blue-700"
                          : "text-gray-900"
                      )}
                    >
                      {conversation.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {conversation.lastMessage || "Cuộc trò chuyện mới"}
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {formatDate(conversation.updatedAt)}
                  </span>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => handleDeleteConversation(e, conversation.id)}
                  className="mt-2 text-[10px] text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  Xóa
                </button>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
