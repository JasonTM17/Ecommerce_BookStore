"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Compass,
  Hand,
  LogIn,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  TicketPercent,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ChatHeader } from "./ChatHeader";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ChatConversations } from "./ChatConversations";
import { useAuth } from "@/components/providers/auth-provider";
import {
  chatbotApi,
  ChatMessage as ChatMessageType,
  ChatbotHealth,
  ChatbotResponse,
} from "@/lib/chatbot";
import { cn, buildLoginRedirect } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { notifyToast } from "@/lib/toast";
import { Button } from "@/components/ui/button";

interface ChatbotWidgetProps {
  defaultOpen?: boolean;
}

type HealthKind = "checking" | "ready" | "degraded" | "disabled";

interface HealthMeta {
  kind: HealthKind;
  badgeLabel: string;
  badgeClassName: string;
  headline: string;
  message: string;
  inputPlaceholder: string;
}

const authenticatedSuggestions = [
  "Tìm sách về Python",
  "Gợi ý sách kỹ năng sống",
  "Đơn hàng của tôi đang ở đâu?",
  "Có mã giảm giá nào đang dùng được?",
];

const guestActions = [
  { label: "Khám phá sách", icon: BookOpen, path: "/products" },
  { label: "Xem khuyến mãi", icon: TicketPercent, path: "/promotions" },
  { label: "Tìm theo danh mục", icon: Compass, path: "/categories" },
];

function resolveHealthMeta(
  health: ChatbotHealth | null,
  isCheckingHealth: boolean,
  healthError: string | null
): HealthMeta {
  if (isCheckingHealth && !health) {
    return {
      kind: "checking",
      badgeLabel: "Đang kiểm tra",
      badgeClassName: "border-amber-400/30 bg-amber-400/10 text-amber-100",
      headline: "Đang xác nhận kết nối Grok",
      message: "BookStore đang kiểm tra trạng thái tư vấn AI để hiển thị trải nghiệm phù hợp nhất.",
      inputPlaceholder: "Đang kiểm tra trạng thái chatbot...",
    };
  }

  if (healthError) {
    return {
      kind: "degraded",
      badgeLabel: "Kiểm tra thất bại",
      badgeClassName: "border-amber-400/30 bg-amber-400/10 text-amber-100",
      headline: "Không kiểm tra được trạng thái Grok",
      message:
        "Backend vẫn đang chạy, nhưng chưa xác nhận được kết nối Grok. Chatbot có thể phản hồi ở chế độ dự phòng.",
      inputPlaceholder: "Nhập tin nhắn để thử chế độ dự phòng...",
    };
  }

  switch (health?.status) {
    case "DISABLED":
      return {
        kind: "disabled",
        badgeLabel: "Đang tắt",
        badgeClassName: "border-slate-300/30 bg-slate-500/10 text-slate-100",
        headline: "Chatbot đang tạm tắt ở môi trường này",
        message:
          health.message ||
          "Bạn vẫn có thể khám phá sách, flash sale và coupon trực tiếp trên giao diện cửa hàng.",
        inputPlaceholder: "Chatbot đang tạm tắt",
      };
    case "DEGRADED":
      return {
        kind: "degraded",
        badgeLabel: "Chế độ dự phòng",
        badgeClassName: "border-orange-400/30 bg-orange-400/10 text-orange-100",
        headline: "Grok đã được cấu hình nhưng chưa ổn định",
        message:
          health.message ||
          "Một số phản hồi có thể quay về chế độ hỗ trợ cơ bản cho tới khi kết nối Grok ổn định hơn.",
        inputPlaceholder: "Nhập tin nhắn, chatbot sẽ trả lời ở chế độ dự phòng nếu cần...",
      };
    default:
      return {
        kind: "ready",
        badgeLabel: `Grok sẵn sàng · ${health?.model || "grok-3"}`,
        badgeClassName: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
        headline: "Chatbot đã sẵn sàng hỗ trợ",
        message:
          health?.message ||
          "Bạn có thể hỏi về sách, tình trạng đơn hàng, khuyến mãi hoặc nhờ gợi ý sản phẩm phù hợp.",
        inputPlaceholder: "Nhập câu hỏi về sách, đơn hàng hoặc khuyến mãi...",
      };
  }
}

export function ChatbotWidget({ defaultOpen = false }: ChatbotWidgetProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [showConversations, setShowConversations] = useState(false);
  const [health, setHealth] = useState<ChatbotHealth | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const healthMeta = useMemo(
    () => resolveHealthMeta(health, isCheckingHealth, healthError),
    [health, isCheckingHealth, healthError]
  );

  const canSendMessages = isAuthenticated && healthMeta.kind !== "disabled";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: "smooth" });
  };

  const getCurrentPath = () => {
    if (typeof window === "undefined") {
      return "/";
    }

    return `${window.location.pathname}${window.location.search}`;
  };

  const goToLogin = () => {
    router.push(buildLoginRedirect(getCurrentPath()));
  };

  const loadHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const response = await chatbotApi.checkHealth();
      setHealth(response);
      setHealthError(null);
    } catch {
      setHealthError("Không thể kiểm tra trạng thái chatbot.");
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (isOpen) {
      void loadHealth();
    }
  }, [isOpen]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    if (!isAuthenticated) {
      goToLogin();
      return;
    }

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
      setHealth((prev) =>
        prev ?? {
          status: "UP",
          service: "Grok AI Chatbot",
          model: response.modelUsed || "grok-3",
          message: "Grok đã phản hồi thành công.",
          providerEnabled: "true",
        }
      );
      setHealthError(null);

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

      setHealth((prev) =>
        prev
          ? {
              ...prev,
              status: "DEGRADED",
              message: "BookStore đã chuyển chatbot sang chế độ dự phòng sau lần gọi vừa rồi.",
            }
          : prev
      );

      const fallbackMsg: ChatMessageType = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          "Xin lỗi bạn, hiện tại mình đang gặp chút trục trặc kỹ thuật. Bạn có thể thử lại sau hoặc tiếp tục duyệt sách trực tiếp trong cửa hàng.",
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

  const handleGuestAction = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  return (
    <>
      <button
        type="button"
        data-testid="chatbot-launcher"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setIsMinimized(false);
        }}
        className={cn(
          "fixed bottom-5 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-300 active:scale-95 sm:bottom-6 sm:right-6",
          "bg-gradient-to-br from-slate-950 via-blue-800 to-blue-600 hover:scale-105 hover:shadow-blue-500/30"
        )}
        aria-label={isOpen ? "Đóng chatbot" : "Mở chatbot"}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6 text-white" />
            <span
              className={cn(
                "absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white",
                healthMeta.kind === "ready"
                  ? "bg-emerald-400"
                  : healthMeta.kind === "disabled"
                    ? "bg-slate-300"
                    : "bg-amber-400"
              )}
            />
          </>
        )}
      </button>

      <div
        data-testid="chatbot-panel"
        className={cn(
          "fixed bottom-24 left-2 right-2 z-50 flex max-h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-2xl shadow-slate-900/20 transition-all duration-300 ease-out sm:left-auto sm:right-6 sm:w-[420px]",
          isOpen && !isMinimized
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-95 opacity-0"
        )}
      >
        <ChatHeader
          onClose={() => setIsOpen(false)}
          onMinimize={() => setIsMinimized((prev) => !prev)}
          onShowConversations={isAuthenticated ? () => setShowConversations((prev) => !prev) : undefined}
          onNewChat={isAuthenticated ? handleNewChat : undefined}
          isMinimized={isMinimized}
          statusLabel={healthMeta.badgeLabel}
          statusClassName={healthMeta.badgeClassName}
          subtitle="Gợi ý sách, đơn hàng và ưu đãi ngay trong cửa hàng."
          canManageConversations={isAuthenticated}
        />

        {!isMinimized ? (
          <div className="flex flex-1 overflow-hidden">
            {isAuthenticated && showConversations ? (
              <ChatConversations
                currentConversationId={currentConversationId}
                onSelectConversation={handleSelectConversation}
                onClose={() => setShowConversations(false)}
              />
            ) : null}

            <div className="flex flex-1 flex-col bg-slate-50/80">
              <div className="border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {healthMeta.kind === "ready" ? (
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      ) : healthMeta.kind === "disabled" ? (
                        <AlertTriangle className="h-4 w-4 text-slate-500" />
                      ) : (
                        <Sparkles className="h-4 w-4 text-amber-500" />
                      )}
                      <p className="text-sm font-semibold text-slate-900">{healthMeta.headline}</p>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{healthMeta.message}</p>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => void loadHealth()}
                    className="shrink-0 text-xs text-slate-500 hover:text-slate-900"
                  >
                    Kiểm tra lại
                  </Button>
                </div>
              </div>

              <div
                className="flex-1 space-y-4 overflow-y-auto p-4"
                role="log"
                aria-live="polite"
                aria-label="Tin nhắn chatbot"
              >
                {!isAuthenticated ? (
                  <div className="flex h-full flex-col justify-between gap-6 rounded-[24px] border border-dashed border-slate-200 bg-white p-6 text-center shadow-sm">
                    <div>
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                        <MessageCircle className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="mb-2 flex items-center justify-center gap-2 text-lg font-semibold text-slate-900">
                        Chào bạn! <Hand className="h-4 w-4 text-blue-500" />
                      </h3>
                      <p className="text-sm leading-6 text-slate-500">
                        Đăng nhập để trò chuyện 1:1 với trợ lý BookStore, theo dõi đơn hàng của bạn và nhận gợi ý sách cá nhân hóa.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="grid gap-2 sm:grid-cols-3">
                        {guestActions.map((action) => (
                          <button
                            key={action.path}
                            type="button"
                            onClick={() => handleGuestAction(action.path)}
                            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-left transition-colors hover:border-blue-200 hover:bg-blue-50"
                          >
                            <action.icon className="mb-2 h-4 w-4 text-blue-600" />
                            <span className="block text-sm font-medium text-slate-800">{action.label}</span>
                          </button>
                        ))}
                      </div>

                      <Button
                        type="button"
                        data-testid="chatbot-login-cta"
                        onClick={goToLogin}
                        className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 py-6 text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-blue-800"
                      >
                        <LogIn className="mr-2 h-4 w-4" />
                        Đăng nhập để bắt đầu chat
                      </Button>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col justify-between gap-6 rounded-[24px] border border-slate-200 bg-white p-6 text-center shadow-sm">
                    <div>
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-950 via-blue-800 to-blue-600 shadow-lg shadow-blue-500/25">
                        <MessageCircle className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-slate-900">Bắt đầu một cuộc trò chuyện mới</h3>
                      <p className="text-sm leading-6 text-slate-500">
                        Hỏi về sách đang bán, lịch sử đơn hàng, mã giảm giá hoặc nhờ gợi ý một tủ sách phù hợp với bạn.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap justify-center gap-2">
                        {(healthMeta.kind === "disabled" ? guestActions.map((item) => item.label) : authenticatedSuggestions).map(
                          (suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => {
                                if (healthMeta.kind === "disabled") {
                                  const matchingAction = guestActions.find((item) => item.label === suggestion);
                                  if (matchingAction) {
                                    handleGuestAction(matchingAction.path);
                                  }
                                  return;
                                }

                                void handleSendMessage(suggestion);
                              }}
                              className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs text-blue-600 transition-colors hover:bg-blue-50"
                            >
                              {suggestion}
                            </button>
                          )
                        )}
                      </div>

                      <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{health?.service || "BookStore Assistant"}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => (
                      <ChatMessage key={msg.id || index} message={msg} />
                    ))}

                    {isTyping ? (
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                          <MessageCircle className="h-4 w-4 text-white" />
                        </div>
                        <div className="rounded-2xl rounded-tl-md bg-white px-4 py-3 shadow-sm">
                          <div className="flex gap-1">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </>
                )}

                <div ref={messagesEndRef} />
              </div>

              {isAuthenticated ? (
                <ChatInput
                  onSendMessage={handleSendMessage}
                  isTyping={isTyping}
                  disabled={!canSendMessages || isAuthLoading}
                  placeholder={healthMeta.inputPlaceholder}
                  helperText={
                    canSendMessages
                      ? "Nhấn Enter để gửi, Shift + Enter để xuống dòng"
                      : "Chatbot đang tạm tắt. Bạn có thể duyệt sách và khuyến mãi trực tiếp."
                  }
                />
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
