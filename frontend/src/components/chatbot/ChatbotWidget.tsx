"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { useLanguage } from "@/components/providers/language-provider";
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
type WidgetLocale = "vi" | "en";

interface WidgetCopy {
  checkingBadge: string;
  checkingHeadline: string;
  checkingMessage: string;
  checkingPlaceholder: string;
  checkingError: string;
  disabledBadge: string;
  disabledHeadline: string;
  disabledMessage: string;
  disabledPlaceholder: string;
  degradedBadge: string;
  degradedHeadline: string;
  degradedMessage: string;
  degradedPlaceholder: string;
  readyBadge: (model: string) => string;
  readyHeadline: string;
  readyMessage: string;
  readyPlaceholder: string;
  readySuccess: string;
  helperText: string;
  disabledHelperText: string;
  subtitle: string;
  guestTitle: string;
  guestDescription: string;
  guestLoginCta: string;
  startConversationTitle: string;
  startConversationDescription: string;
  serviceLabel: string;
  sendError: string;
  sendErrorDescription: string;
  fallbackReply: string;
  openAriaLabel: string;
  closeAriaLabel: string;
  guestActions: Array<{
    label: string;
    icon: typeof BookOpen;
    path: string;
  }>;
  authenticatedSuggestions: string[];
}

interface HealthMeta {
  kind: HealthKind;
  badgeLabel: string;
  badgeClassName: string;
  headline: string;
  message: string;
  inputPlaceholder: string;
}

const widgetCopy: Record<WidgetLocale, WidgetCopy> = {
  vi: {
    checkingBadge: "Đang kiểm tra",
    checkingHeadline: "Đang xác nhận kết nối Grok",
    checkingMessage:
      "BookStore đang kiểm tra trạng thái tư vấn AI để hiển thị trải nghiệm phù hợp nhất.",
    checkingPlaceholder: "Đang kiểm tra trạng thái chatbot...",
    checkingError: "Không thể kiểm tra trạng thái chatbot.",
    disabledBadge: "Đang tắt",
    disabledHeadline: "Chatbot đang tạm tắt ở môi trường này",
    disabledMessage:
      "Bạn vẫn có thể khám phá sách, flash sale và coupon trực tiếp trên giao diện cửa hàng.",
    disabledPlaceholder: "Chatbot đang tạm tắt",
    degradedBadge: "Chế độ dự phòng",
    degradedHeadline: "Grok đã được cấu hình nhưng chưa ổn định",
    degradedMessage:
      "Một số phản hồi có thể quay về chế độ hỗ trợ cơ bản cho tới khi kết nối Grok ổn định hơn.",
    degradedPlaceholder: "Nhập tin nhắn, chatbot sẽ trả lời ở chế độ dự phòng nếu cần...",
    readyBadge: (model) => `Grok sẵn sàng · ${model}`,
    readyHeadline: "Chatbot đã sẵn sàng hỗ trợ",
    readyMessage:
      "Bạn có thể hỏi về sách, tình trạng đơn hàng, khuyến mãi hoặc nhờ gợi ý sản phẩm phù hợp.",
    readyPlaceholder: "Nhập câu hỏi về sách, đơn hàng hoặc khuyến mãi...",
    readySuccess: "Grok đã phản hồi thành công.",
    helperText: "Nhấn Enter để gửi, Shift + Enter để xuống dòng",
    disabledHelperText:
      "Chatbot đang tạm tắt. Bạn vẫn có thể duyệt sách và khuyến mãi trực tiếp.",
    subtitle: "Gợi ý sách, đơn hàng và ưu đãi ngay trong cửa hàng.",
    guestTitle: "Chào bạn!",
    guestDescription:
      "Đăng nhập để trò chuyện 1:1 với trợ lý BookStore, theo dõi đơn hàng của bạn và nhận gợi ý sách cá nhân hóa.",
    guestLoginCta: "Đăng nhập để bắt đầu chat",
    startConversationTitle: "Bắt đầu một cuộc trò chuyện mới",
    startConversationDescription:
      "Hỏi về sách đang bán, lịch sử đơn hàng, mã giảm giá hoặc nhờ gợi ý một tủ sách phù hợp với bạn.",
    serviceLabel: "BookStore Assistant",
    sendError: "Không thể gửi tin nhắn. Vui lòng thử lại.",
    sendErrorDescription: "Lỗi",
    fallbackReply:
      "Xin lỗi bạn, hiện tại mình đang gặp chút trục trặc kỹ thuật. Bạn có thể thử lại sau hoặc tiếp tục duyệt sách trực tiếp trong cửa hàng.",
    openAriaLabel: "Mở chatbot",
    closeAriaLabel: "Đóng chatbot",
    guestActions: [
      { label: "Khám phá sách", icon: BookOpen, path: "/products" },
      { label: "Xem khuyến mãi", icon: TicketPercent, path: "/promotions" },
      { label: "Tìm theo danh mục", icon: Compass, path: "/categories" },
    ],
    authenticatedSuggestions: [
      "Tìm sách về Python",
      "Gợi ý sách kỹ năng sống",
      "Đơn hàng của tôi đang ở đâu?",
      "Có mã giảm giá nào đang dùng được?",
    ],
  },
  en: {
    checkingBadge: "Checking",
    checkingHeadline: "Confirming the Grok connection",
    checkingMessage:
      "BookStore is checking the AI assistant status so it can show the most relevant experience.",
    checkingPlaceholder: "Checking chatbot status...",
    checkingError: "Unable to check chatbot status.",
    disabledBadge: "Disabled",
    disabledHeadline: "Chatbot is temporarily off in this environment",
    disabledMessage:
      "You can still explore books, flash sales, and coupons directly in the store.",
    disabledPlaceholder: "Chatbot is temporarily off",
    degradedBadge: "Fallback mode",
    degradedHeadline: "Grok is configured, but not fully stable",
    degradedMessage:
      "Some replies may fall back to the basic assistant experience until the Grok connection settles.",
    degradedPlaceholder: "Type a message and the chatbot will fall back if needed...",
    readyBadge: (model) => `Grok ready · ${model}`,
    readyHeadline: "Chatbot is ready to help",
    readyMessage:
      "Ask about books, order status, promotions, or get recommendations tailored to you.",
    readyPlaceholder: "Ask about books, orders, or promotions...",
    readySuccess: "Grok replied successfully.",
    helperText: "Press Enter to send, Shift + Enter for a new line",
    disabledHelperText: "The chatbot is temporarily off. You can still browse the store directly.",
    subtitle: "Book suggestions, orders, and deals right inside the store.",
    guestTitle: "Hello there!",
    guestDescription:
      "Sign in to chat one-on-one with the BookStore assistant, track your orders, and get personalized book recommendations.",
    guestLoginCta: "Sign in to start chatting",
    startConversationTitle: "Start a new conversation",
    startConversationDescription:
      "Ask about books on sale, order history, coupon codes, or get recommendations for a shelf that fits your taste.",
    serviceLabel: "BookStore Assistant",
    sendError: "Unable to send the message. Please try again.",
    sendErrorDescription: "Error",
    fallbackReply:
      "Sorry, I’m having a small technical hiccup right now. You can try again later or keep browsing books directly in the store.",
    openAriaLabel: "Open chatbot",
    closeAriaLabel: "Close chatbot",
    guestActions: [
      { label: "Browse books", icon: BookOpen, path: "/products" },
      { label: "View promotions", icon: TicketPercent, path: "/promotions" },
      { label: "Browse categories", icon: Compass, path: "/categories" },
    ],
    authenticatedSuggestions: [
      "Find books about Python",
      "Recommend self-help books",
      "Where is my order?",
      "Any coupon codes I can use right now?",
    ],
  },
};

function resolveHealthMeta(
  health: ChatbotHealth | null,
  isCheckingHealth: boolean,
  healthError: string | null,
  copy: WidgetCopy
): HealthMeta {
  if (isCheckingHealth && !health) {
    return {
      kind: "checking",
      badgeLabel: copy.checkingBadge,
      badgeClassName: "border-amber-400/30 bg-amber-400/10 text-amber-100",
      headline: copy.checkingHeadline,
      message: copy.checkingMessage,
      inputPlaceholder: copy.checkingPlaceholder,
    };
  }

  if (healthError) {
    return {
      kind: "degraded",
      badgeLabel: copy.degradedBadge,
      badgeClassName: "border-amber-400/30 bg-amber-400/10 text-amber-100",
      headline: copy.degradedHeadline,
      message: copy.degradedMessage,
      inputPlaceholder: copy.degradedPlaceholder,
    };
  }

  switch (health?.status) {
    case "DISABLED":
      return {
        kind: "disabled",
        badgeLabel: copy.disabledBadge,
        badgeClassName: "border-slate-300/30 bg-slate-500/10 text-slate-100",
        headline: copy.disabledHeadline,
        message: copy.disabledMessage,
        inputPlaceholder: copy.disabledPlaceholder,
      };
    case "DEGRADED":
      return {
        kind: "degraded",
        badgeLabel: copy.degradedBadge,
        badgeClassName: "border-orange-400/30 bg-orange-400/10 text-orange-100",
        headline: copy.degradedHeadline,
        message: copy.degradedMessage,
        inputPlaceholder: copy.degradedPlaceholder,
      };
    default:
      return {
        kind: "ready",
        badgeLabel: copy.readyBadge(health?.model || "grok-3"),
        badgeClassName: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
        headline: copy.readyHeadline,
        message: copy.readyMessage,
        inputPlaceholder: copy.readyPlaceholder,
      };
  }
}

export function ChatbotWidget({ defaultOpen = false }: ChatbotWidgetProps) {
  const router = useRouter();
  const { locale } = useLanguage();
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

  const copy = widgetCopy[locale as WidgetLocale] ?? widgetCopy.vi;
  const healthMeta = useMemo(
    () => resolveHealthMeta(health, isCheckingHealth, healthError, copy),
    [copy, health, healthError, isCheckingHealth]
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

  const loadHealth = useCallback(async () => {
    setIsCheckingHealth(true);
    try {
      const response = await chatbotApi.checkHealth();
      setHealth(response);
      setHealthError(null);
    } catch {
      setHealthError(copy.checkingError);
    } finally {
      setIsCheckingHealth(false);
    }
  }, [copy.checkingError]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (isOpen) {
      void loadHealth();
    }
  }, [isOpen, loadHealth]);

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
          message: copy.readySuccess,
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
        error?.response?.data?.message || copy.sendError,
        {
          description: copy.sendErrorDescription,
        }
      );

      setHealth((prev) =>
        prev
          ? {
              ...prev,
              status: "DEGRADED",
              message: copy.degradedMessage,
            }
          : prev
      );

      const fallbackMsg: ChatMessageType = {
        id: Date.now() + 1,
        role: "assistant",
        content: copy.fallbackReply,
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
        aria-label={isOpen ? copy.closeAriaLabel : copy.openAriaLabel}
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
          subtitle={copy.subtitle}
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
                    {locale === "vi" ? "Kiểm tra lại" : "Check again"}
                  </Button>
                </div>
              </div>

              <div
                className="flex-1 space-y-4 overflow-y-auto p-4"
                role="log"
                aria-live="polite"
                aria-label={locale === "vi" ? "Tin nhắn chatbot" : "Chatbot messages"}
              >
                {!isAuthenticated ? (
                  <div className="flex h-full flex-col justify-between gap-6 rounded-[24px] border border-dashed border-slate-200 bg-white p-6 text-center shadow-sm">
                    <div>
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                        <MessageCircle className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="mb-2 flex items-center justify-center gap-2 text-lg font-semibold text-slate-900">
                        {copy.guestTitle} <Hand className="h-4 w-4 text-blue-500" />
                      </h3>
                      <p className="text-sm leading-6 text-slate-500">{copy.guestDescription}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="grid gap-2 sm:grid-cols-3">
                        {copy.guestActions.map((action) => (
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
                        {copy.guestLoginCta}
                      </Button>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col justify-between gap-6 rounded-[24px] border border-slate-200 bg-white p-6 text-center shadow-sm">
                    <div>
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-950 via-blue-800 to-blue-600 shadow-lg shadow-blue-500/25">
                        <MessageCircle className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-slate-900">{copy.startConversationTitle}</h3>
                      <p className="text-sm leading-6 text-slate-500">{copy.startConversationDescription}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap justify-center gap-2">
                        {(healthMeta.kind === "disabled"
                          ? copy.guestActions.map((action) => action.label)
                          : copy.authenticatedSuggestions).map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => {
                                if (healthMeta.kind === "disabled") {
                                  const matchingAction = copy.guestActions.find((item) => item.label === suggestion);
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
                          ))}
                      </div>

                      <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{health?.service || copy.serviceLabel}</span>
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
                  helperText={canSendMessages ? copy.helperText : copy.disabledHelperText}
                />
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
