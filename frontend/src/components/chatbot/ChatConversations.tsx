"use client";

import { useEffect, useState } from "react";
import { X, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { chatbotApi, Conversation, ChatMessage } from "@/lib/chatbot";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { notifyToast } from "@/lib/toast";

interface ChatConversationsProps {
  currentConversationId: number | null;
  onSelectConversation: (
    conversationId: number,
    messages: ChatMessage[],
  ) => void;
  onClose: () => void;
}

export function ChatConversations({
  currentConversationId,
  onSelectConversation,
  onClose,
}: ChatConversationsProps) {
  const { toast } = useToast();
  const { locale } = useLanguage();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const copy =
    locale === "vi"
      ? {
          history: "Lịch sử",
          loadError: "Không thể tải lịch sử hội thoại",
          loadDetailError: "Không thể tải chi tiết hội thoại",
          deleteSuccess: "Hội thoại đã được xóa",
          deleteError: "Không thể xóa hội thoại",
          justNow: "Vừa xong",
          minutesAgo: "phút trước",
          hoursAgo: "giờ trước",
          daysAgo: "ngày trước",
          empty: "Chưa có hội thoại nào",
          newConversation: "Cuộc trò chuyện mới",
          delete: "Xóa",
          error: "Lỗi",
          success: "Thành công",
        }
      : {
          history: "History",
          loadError: "Unable to load conversation history",
          loadDetailError: "Unable to load conversation details",
          deleteSuccess: "Conversation deleted",
          deleteError: "Unable to delete conversation",
          justNow: "Just now",
          minutesAgo: "minutes ago",
          hoursAgo: "hours ago",
          daysAgo: "days ago",
          empty: "No conversations yet",
          newConversation: "New conversation",
          delete: "Delete",
          error: "Error",
          success: "Success",
        };

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
        notifyToast(toast, "error", copy.loadError, {
          description: copy.error,
        });
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
  }, [copy.error, copy.loadError, toast]);

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
      notifyToast(toast, "error", copy.loadDetailError, {
        description: copy.error,
      });
    }
  };

  const handleDeleteConversation = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();

    try {
      await chatbotApi.deleteConversation(id);
      setConversations((prev) =>
        prev.filter((conversation) => conversation.id !== id),
      );
      notifyToast(toast, "success", copy.deleteSuccess, {
        description: copy.success,
      });
    } catch {
      notifyToast(toast, "error", copy.deleteError, {
        description: copy.error,
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return copy.justNow;
    if (diffMins < 60) return `${diffMins} ${copy.minutesAgo}`;
    if (diffHours < 24) return `${diffHours} ${copy.hoursAgo}`;
    if (diffDays < 7) return `${diffDays} ${copy.daysAgo}`;
    return date.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US");
  };

  return (
    <div className="flex w-64 shrink-0 flex-col border-r border-gray-100 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 p-3">
        <h3 className="text-sm font-semibold text-gray-900">{copy.history}</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-7 w-7"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            <MessageCircle className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            <p>{copy.empty}</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  "group w-full rounded-xl transition-all",
                  currentConversationId === conversation.id && "bg-red-50",
                )}
              >
                <button
                  type="button"
                  onClick={() => handleSelectConversation(conversation)}
                  className="w-full rounded-xl p-3 text-left transition-all hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate text-sm font-medium",
                          currentConversationId === conversation.id ||
                            selectedId === conversation.id
                            ? "text-red-700"
                            : "text-gray-900",
                        )}
                      >
                        {conversation.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {conversation.lastMessage || copy.newConversation}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] text-gray-400">
                      {formatDate(conversation.updatedAt)}
                    </span>
                  </div>
                </button>

                <div className="px-3 pb-2">
                  <button
                    type="button"
                    onClick={(e) =>
                      handleDeleteConversation(e, conversation.id)
                    }
                    className="text-[10px] text-gray-400 opacity-0 transition-colors hover:text-red-500 group-hover:opacity-100"
                  >
                    {copy.delete}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
