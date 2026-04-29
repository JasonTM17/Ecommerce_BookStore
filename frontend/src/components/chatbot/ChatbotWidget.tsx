"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Compass,
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

type HealthKind = "checking" | "ready" | "degraded" | "demo";
type WidgetLocale = "vi" | "en";

interface WidgetCopy {
  checkingBadge: string;
  checkingHeadline: string;
  checkingMessage: string;
  checkingPlaceholder: string;
  checkingError: string;
  demoBadge: string;
  demoHeadline: string;
  demoMessage: string;
  demoPlaceholder: string;
  demoHelperText: string;
  demoNotice: string;
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
  guestLoginCta: string;
  startConversationTitle: string;
  startConversationDescription: string;
  serviceLabel: string;
  demoServiceLabel: string;
  retryHealth: string;
  sendError: string;
  sendErrorDescription: string;
  fallbackReply: string;
  openAriaLabel: string;
  closeAriaLabel: string;
  messagesAriaLabel: string;
  signInHint: string;
  guestActions: Array<{
    label: string;
    icon: typeof BookOpen;
    path: string;
  }>;
  authenticatedSuggestions: string[];
  demoSuggestions: string[];
  demoQuickActions: Array<{
    action: string;
    label: string;
    icon: string;
  }>;
  demoReplies: {
    default: string;
    promotion: string;
    order: string;
    cart: string;
    book: string;
  };
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
    checkingHeadline: "Đang kiểm tra trợ lý",
    checkingMessage:
      "BookStore đang xác nhận trạng thái chatbot để chọn trải nghiệm phù hợp nhất.",
    checkingPlaceholder: "Đang kiểm tra trạng thái chatbot...",
    checkingError: "Không thể kiểm tra trạng thái chatbot.",
    demoBadge: "Demo portfolio",
    demoHeadline: "Trợ lý demo sẵn sàng",
    demoMessage:
      "Bạn có thể thử hỏi về sách, coupon, flash sale hoặc giỏ hàng. Chế độ demo không gửi dữ liệu cá nhân.",
    demoPlaceholder: "Hỏi về sách, coupon hoặc giỏ hàng...",
    demoHelperText:
      "Demo chỉ trả lời hướng dẫn chung, không truy vấn đơn hàng thật.",
    demoNotice: "Chế độ demo portfolio.",
    degradedBadge: "Dự phòng",
    degradedHeadline: "Grok chưa ổn định",
    degradedMessage:
      "Một số câu trả lời có thể dùng trợ lý cơ bản cho tới khi kết nối Grok ổn định hơn.",
    degradedPlaceholder:
      "Nhập tin nhắn, chatbot sẽ dùng chế độ dự phòng nếu cần...",
    readyBadge: (model) => `Grok sẵn sàng · ${model}`,
    readyHeadline: "Chatbot sẵn sàng hỗ trợ",
    readyMessage:
      "Hỏi về sách, đơn hàng, khuyến mãi hoặc gợi ý sản phẩm phù hợp.",
    readyPlaceholder: "Hỏi về sách, đơn hàng hoặc ưu đãi...",
    readySuccess: "Grok đã phản hồi thành công.",
    helperText: "Enter để gửi, Shift + Enter để xuống dòng",
    disabledHelperText:
      "Chatbot đang tạm tắt. Bạn vẫn có thể duyệt sách và khuyến mãi trực tiếp.",
    subtitle: "Gợi ý sách, ưu đãi và hỗ trợ mua hàng.",
    guestLoginCta: "Đăng nhập để chat cá nhân hóa",
    startConversationTitle: "Bạn cần tìm gì hôm nay?",
    startConversationDescription:
      "Thử hỏi về coupon, flash sale, gợi ý sách hoặc mở nhanh các trang mua sắm.",
    serviceLabel: "BookStore Assistant",
    demoServiceLabel: "BookStore Demo Assistant",
    retryHealth: "Kiểm tra lại",
    sendError: "Không thể gửi tin nhắn. Vui lòng thử lại.",
    sendErrorDescription: "Lỗi",
    fallbackReply:
      "Xin lỗi, chatbot đang gặp sự cố tạm thời. Bạn có thể thử lại sau hoặc tiếp tục duyệt sách trong cửa hàng.",
    openAriaLabel: "Mở chatbot",
    closeAriaLabel: "Đóng chatbot",
    messagesAriaLabel: "Tin nhắn chatbot",
    signInHint: "Đăng nhập để xem lịch sử trò chuyện và đơn hàng thật.",
    guestActions: [
      { label: "Khám phá sách", icon: BookOpen, path: "/products" },
      { label: "Xem khuyến mãi", icon: TicketPercent, path: "/promotions" },
      { label: "Danh mục", icon: Compass, path: "/categories" },
    ],
    authenticatedSuggestions: [
      "Tìm sách về Python",
      "Gợi ý sách kỹ năng sống",
      "Đơn hàng của tôi ở đâu?",
      "Có mã giảm giá nào dùng được không?",
    ],
    demoSuggestions: [
      "Có mã giảm giá nào?",
      "Gợi ý sách kỹ năng sống",
      "Flash sale hôm nay có gì?",
      "Tôi muốn xem giỏ hàng",
    ],
    demoQuickActions: [
      { action: "search", label: "Duyệt sách", icon: "search" },
      { action: "view_promotions", label: "Xem khuyến mãi", icon: "tag" },
      { action: "view_cart", label: "Mở giỏ hàng", icon: "cart" },
    ],
    demoReplies: {
      default:
        "Bạn có thể hỏi về sách, coupon, flash sale hoặc mở nhanh các trang mua sắm bên dưới.",
      promotion:
        "Mở trang Khuyến mãi để xem coupon công khai, sao chép mã phù hợp rồi áp dụng ở giỏ hàng.",
      order:
        "Mình không đọc đơn hàng thật trong demo. Hãy đăng nhập rồi mở trang Đơn hàng để kiểm tra.",
      cart: "Bạn có thể mở giỏ hàng để xem sách đã chọn, nhập coupon và tiếp tục checkout.",
      book: "Bạn có thể bắt đầu ở trang Sản phẩm hoặc Danh mục để lọc sách theo chủ đề. Mình sẽ ưu tiên hướng dẫn nhanh trong bản demo.",
    },
  },
  en: {
    checkingBadge: "Checking",
    checkingHeadline: "Checking assistant status",
    checkingMessage:
      "BookStore is checking the chatbot status to choose the right experience.",
    checkingPlaceholder: "Checking chatbot status...",
    checkingError: "Unable to check chatbot status.",
    demoBadge: "Portfolio demo",
    demoHeadline: "Demo assistant is ready",
    demoMessage:
      "You can ask about books, coupons, flash sales, or the cart. Demo mode does not send personal data.",
    demoPlaceholder: "Ask about books, coupons, or cart...",
    demoHelperText:
      "Demo mode gives general guidance and does not query real orders.",
    demoNotice: "Portfolio demo mode.",
    degradedBadge: "Fallback",
    degradedHeadline: "Grok is not fully stable",
    degradedMessage:
      "Some replies may use the basic assistant until the Grok connection settles.",
    degradedPlaceholder:
      "Type a message and the chatbot will fall back if needed...",
    readyBadge: (model) => `Grok ready · ${model}`,
    readyHeadline: "Chatbot is ready to help",
    readyMessage:
      "Ask about books, orders, promotions, or product recommendations.",
    readyPlaceholder: "Ask about books, orders, or deals...",
    readySuccess: "Grok replied successfully.",
    helperText: "Enter to send, Shift + Enter for a new line",
    disabledHelperText:
      "The chatbot is temporarily off. You can still browse the store directly.",
    subtitle: "Book suggestions, deals, and shopping help.",
    guestLoginCta: "Sign in for personalized chat",
    startConversationTitle: "What can I help you find?",
    startConversationDescription:
      "Try coupons, flash sale, book recommendations, or quick shopping links.",
    serviceLabel: "BookStore Assistant",
    demoServiceLabel: "BookStore Demo Assistant",
    retryHealth: "Check again",
    sendError: "Unable to send the message. Please try again.",
    sendErrorDescription: "Error",
    fallbackReply:
      "Sorry, the chatbot is having a temporary issue. You can try again later or keep browsing books in the store.",
    openAriaLabel: "Open chatbot",
    closeAriaLabel: "Close chatbot",
    messagesAriaLabel: "Chatbot messages",
    signInHint: "Sign in to access chat history and real order help.",
    guestActions: [
      { label: "Browse books", icon: BookOpen, path: "/products" },
      { label: "View promotions", icon: TicketPercent, path: "/promotions" },
      { label: "Categories", icon: Compass, path: "/categories" },
    ],
    authenticatedSuggestions: [
      "Find books about Python",
      "Recommend self-help books",
      "Where is my order?",
      "Any coupon codes I can use?",
    ],
    demoSuggestions: [
      "Any active coupon codes?",
      "Recommend self-help books",
      "What is in flash sale today?",
      "I want to view my cart",
    ],
    demoQuickActions: [
      { action: "search", label: "Browse books", icon: "search" },
      { action: "view_promotions", label: "View promotions", icon: "tag" },
      { action: "view_cart", label: "Open cart", icon: "cart" },
    ],
    demoReplies: {
      default:
        "Ask about books, coupons, flash sales, or use the quick actions below to start shopping.",
      promotion:
        "Open Promotions to view public coupons, copy a matching code, then apply it in cart.",
      order:
        "I do not access real orders in demo mode. Sign in and open Orders to check an actual order.",
      cart: "Open the cart to review selected books, enter a coupon, and continue checkout.",
      book: "Start from Products or Categories to filter books by topic. In demo mode I focus on quick shopping guidance.",
    },
  },
};

function resolveHealthMeta(
  health: ChatbotHealth | null,
  isCheckingHealth: boolean,
  healthError: string | null,
  copy: WidgetCopy,
): HealthMeta {
  if (isCheckingHealth && !health) {
    return {
      kind: "checking",
      badgeLabel: copy.checkingBadge,
      badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
      headline: copy.checkingHeadline,
      message: copy.checkingMessage,
      inputPlaceholder: copy.checkingPlaceholder,
    };
  }

  if (healthError || health?.status === "DISABLED") {
    return {
      kind: "demo",
      badgeLabel: copy.demoBadge,
      badgeClassName: "border-red-100 bg-red-50 text-red-700",
      headline: copy.demoHeadline,
      message: copy.demoMessage,
      inputPlaceholder: copy.demoPlaceholder,
    };
  }

  if (health?.status === "DEGRADED") {
    return {
      kind: "degraded",
      badgeLabel: copy.degradedBadge,
      badgeClassName: "border-orange-200 bg-orange-50 text-orange-700",
      headline: copy.degradedHeadline,
      message: copy.degradedMessage,
      inputPlaceholder: copy.degradedPlaceholder,
    };
  }

  return {
    kind: "ready",
    badgeLabel: copy.readyBadge(health?.model || "grok-3"),
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
    headline: copy.readyHeadline,
    message: copy.readyMessage,
    inputPlaceholder: copy.readyPlaceholder,
  };
}

function buildDemoAssistantMessage(
  message: string,
  copy: WidgetCopy,
): Pick<ChatMessageType, "content" | "quickActions"> {
  const normalizedMessage = message
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();

  const content = normalizedMessage.match(/coupon|promo|khuyen|ma giam|sale/)
    ? copy.demoReplies.promotion
    : normalizedMessage.match(/order|don hang|tracking|van chuyen/)
      ? copy.demoReplies.order
      : normalizedMessage.match(/cart|gio hang|checkout|thanh toan/)
        ? copy.demoReplies.cart
        : normalizedMessage.match(/book|sach|category|danh muc|goi y|recommend/)
          ? copy.demoReplies.book
          : copy.demoReplies.default;

  return {
    content: `${copy.demoNotice} ${content}`,
    quickActions: copy.demoQuickActions,
  };
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
  const [currentConversationId, setCurrentConversationId] = useState<
    number | null
  >(null);
  const [showConversations, setShowConversations] = useState(false);
  const [health, setHealth] = useState<ChatbotHealth | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const latestAssistantMessageRef = useRef<HTMLDivElement>(null);

  const copy = widgetCopy[locale as WidgetLocale] ?? widgetCopy.vi;
  const healthMeta = useMemo(
    () => resolveHealthMeta(health, isCheckingHealth, healthError, copy),
    [copy, health, healthError, isCheckingHealth],
  );
  const displayHealthMeta = useMemo<HealthMeta>(() => {
    if (!isAuthenticated && !isAuthLoading) {
      return {
        kind: "demo",
        badgeLabel: copy.demoBadge,
        badgeClassName: "border-red-100 bg-red-50 text-red-700",
        headline: copy.demoHeadline,
        message: copy.demoMessage,
        inputPlaceholder: copy.demoPlaceholder,
      };
    }

    return healthMeta;
  }, [copy, healthMeta, isAuthLoading, isAuthenticated]);
  const isDemoMode = displayHealthMeta.kind === "demo";
  const canSendMessages = isDemoMode || isAuthenticated;

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
    if (!isOpen) {
      return;
    }
    if (messages.length === 0) {
      return;
    }

    const latestMessage = messages[messages.length - 1];
    if (latestMessage?.role === "assistant") {
      latestAssistantMessageRef.current?.scrollIntoView?.({
        behavior: "smooth",
        block: "start",
      });
    } else {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  useEffect(() => {
    if (isOpen) {
      void loadHealth();
    }
  }, [isOpen, loadHealth]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    if (!isAuthenticated && !isDemoMode) {
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

    if (isDemoMode) {
      const demoReply = buildDemoAssistantMessage(message, copy);
      const demoMsg: ChatMessageType = {
        id: Date.now() + 1,
        role: "assistant",
        content: demoReply.content,
        createdAt: new Date().toISOString(),
        quickActions: demoReply.quickActions,
      };

      setMessages((prev) => [...prev, demoMsg]);
      setIsTyping(false);
      return;
    }

    try {
      const response: ChatbotResponse = await chatbotApi.sendMessage({
        message,
        conversationId: currentConversationId,
      });

      setCurrentConversationId(response.conversationId);
      setHealth(
        (prev) =>
          prev ?? {
            status: "UP",
            service: "Grok AI Chatbot",
            model: response.modelUsed || "grok-3",
            message: copy.readySuccess,
            providerEnabled: "true",
          },
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
        },
      );

      setHealth((prev) =>
        prev
          ? {
              ...prev,
              status: "DEGRADED",
              message: copy.degradedMessage,
            }
          : prev,
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
    conversationMessages: ChatMessageType[],
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
          "fixed bottom-4 right-3 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-black shadow-[0_14px_34px_rgba(0,0,0,0.22)] transition-all duration-200 active:scale-95 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14",
          "hover:scale-105 hover:bg-black/85",
          isOpen &&
            !isMinimized &&
            "pointer-events-none translate-y-4 scale-90 opacity-0",
        )}
        aria-label={isOpen ? copy.closeAriaLabel : copy.openAriaLabel}
      >
        {isOpen ? (
          <X className="h-5 w-5 text-white" />
        ) : (
          <>
            <MessageCircle className="h-5 w-5 text-white" />
            <span
              className={cn(
                "absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white",
                displayHealthMeta.kind === "ready"
                  ? "bg-emerald-400"
                  : displayHealthMeta.kind === "demo"
                    ? "bg-red-500"
                    : "bg-amber-400",
              )}
            />
          </>
        )}
      </button>

      {isOpen && !isMinimized ? (
      <div
        data-testid="chatbot-panel"
        className="fixed bottom-3 left-3 right-3 z-50 flex max-h-[calc(100dvh-7rem)] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white opacity-100 shadow-[0_24px_70px_rgba(15,23,42,0.20)] transition-all duration-200 ease-out sm:bottom-6 sm:left-auto sm:right-6 sm:max-h-[min(620px,calc(100dvh-3rem))] sm:w-[24rem]"
      >
        <ChatHeader
          onClose={() => setIsOpen(false)}
          onMinimize={() => setIsMinimized((prev) => !prev)}
          onShowConversations={
            isAuthenticated && !isDemoMode
              ? () => setShowConversations((prev) => !prev)
              : undefined
          }
          onNewChat={isAuthenticated && !isDemoMode ? handleNewChat : undefined}
          isMinimized={isMinimized}
          statusLabel={displayHealthMeta.badgeLabel}
          statusClassName={displayHealthMeta.badgeClassName}
          subtitle={copy.subtitle}
          canManageConversations={isAuthenticated && !isDemoMode}
        />

        {!isMinimized ? (
          <div className="flex min-h-0 flex-1 overflow-hidden">
            {isAuthenticated && showConversations ? (
              <ChatConversations
                currentConversationId={currentConversationId}
                onSelectConversation={handleSelectConversation}
                onClose={() => setShowConversations(false)}
              />
            ) : null}

            <div className="flex min-w-0 flex-1 flex-col bg-[#f7f7f7]">
              <div className="border-b border-black/[0.06] bg-white px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      {displayHealthMeta.kind === "ready" ? (
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5 shrink-0 text-red-500" />
                      )}
                      <p className="truncate text-xs font-semibold text-black">
                        {displayHealthMeta.headline}
                      </p>
                    </div>
                    <p className="mt-1 hidden text-[11px] leading-4 text-[#6f6a64] sm:line-clamp-2">
                      {displayHealthMeta.message}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => void loadHealth()}
                    className="h-7 shrink-0 rounded-full bg-[#f4f1ee] px-2.5 text-[11px] text-black hover:bg-[#ece5df]"
                  >
                    {copy.retryHealth}
                  </Button>
                </div>
              </div>

              <div
                className="min-h-[160px] flex-1 space-y-3 overflow-y-auto p-3"
                role="log"
                aria-live="polite"
                aria-label={copy.messagesAriaLabel}
              >
                {messages.length === 0 ? (
                  <div className="rounded-2xl bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
                    <div className="mb-3 flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black">
                        <MessageCircle className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-slate-950">
                          {copy.startConversationTitle}
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-[#55504a]">
                          {copy.startConversationDescription}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(isDemoMode
                        ? copy.demoSuggestions
                        : copy.authenticatedSuggestions
                      ).map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            void handleSendMessage(suggestion);
                          }}
                          className="rounded-full bg-[#f4f1ee] px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-[#ebe3dc]"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {copy.guestActions.map((action) => (
                        <button
                          key={action.path}
                          type="button"
                          onClick={() => handleGuestAction(action.path)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 transition-colors hover:bg-[#f8f3ef]"
                        >
                          <action.icon className="h-3.5 w-3.5 text-black" />
                          <span>{action.label}</span>
                        </button>
                      ))}
                    </div>

                    {!isAuthenticated ? (
                      <div className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs leading-5 text-red-800">
                        <p className="hidden sm:block">{copy.signInHint}</p>
                        <Button
                          type="button"
                          data-testid="chatbot-login-cta"
                          onClick={goToLogin}
                          variant="ghost"
                          className="h-7 rounded-full px-0 text-xs font-semibold text-red-700 hover:bg-transparent hover:text-red-800 sm:mt-1"
                        >
                          <LogIn className="mr-1.5 h-3.5 w-3.5" />
                          {copy.guestLoginCta}
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-4 flex items-center gap-2 text-xs text-[#777169]">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>
                          {isDemoMode
                            ? copy.demoServiceLabel
                            : health?.service || copy.serviceLabel}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => (
                      <div
                        key={msg.id || index}
                        ref={
                          index === messages.length - 1 &&
                          msg.role === "assistant"
                            ? latestAssistantMessageRef
                            : undefined
                        }
                      >
                        <ChatMessage message={msg} />
                      </div>
                    ))}

                    {isTyping ? (
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black">
                          <MessageCircle className="h-4 w-4 text-white" />
                        </div>
                        <div className="rounded-2xl rounded-tl-md bg-white px-4 py-3 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
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

              {canSendMessages ? (
                <ChatInput
                  onSendMessage={handleSendMessage}
                  isTyping={isTyping}
                  disabled={!canSendMessages || isAuthLoading}
                  placeholder={displayHealthMeta.inputPlaceholder}
                  helperText={
                    isDemoMode
                      ? copy.demoHelperText
                      : canSendMessages
                        ? copy.helperText
                        : copy.disabledHelperText
                  }
                />
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
      ) : null}
    </>
  );
}
