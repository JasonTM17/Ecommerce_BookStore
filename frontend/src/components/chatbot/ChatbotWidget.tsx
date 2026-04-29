"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
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

type HealthKind = "checking" | "ready" | "degraded" | "demo";
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
  guestTitle: string;
  guestDescription: string;
  guestLoginCta: string;
  startConversationTitle: string;
  startConversationDescription: string;
  serviceLabel: string;
  demoServiceLabel: string;
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
    demoBadge: "Demo portfolio",
    demoHeadline: "Trợ lý demo đang sẵn sàng",
    demoMessage:
      "Grok đang tắt ở môi trường này, nên BookStore dùng chế độ demo an toàn để bạn vẫn thử được luồng tư vấn.",
    demoPlaceholder: "Hỏi thử về sách, coupon, flash sale hoặc giỏ hàng...",
    demoHelperText:
      "Chế độ demo không gửi dữ liệu cá nhân và không truy vấn đơn hàng thật.",
    demoNotice:
      "Mình đang ở chế độ demo portfolio, nên chỉ đưa gợi ý chung và điều hướng nhanh trong cửa hàng.",
    degradedBadge: "Chế độ dự phòng",
    degradedHeadline: "Grok đã được cấu hình nhưng chưa ổn định",
    degradedMessage:
      "Một số phản hồi có thể quay về chế độ hỗ trợ cơ bản cho tới khi kết nối Grok ổn định hơn.",
    degradedPlaceholder:
      "Nhập tin nhắn, chatbot sẽ trả lời ở chế độ dự phòng nếu cần...",
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
    demoServiceLabel: "BookStore Demo Assistant",
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
        "Mình đang chạy chế độ demo portfolio. Bạn có thể thử hỏi về sách, coupon, flash sale hoặc mở nhanh các trang mua sắm bằng các nút bên dưới.",
      promotion:
        "BookStore đang có trang Khuyến mãi để xem coupon công khai. Hãy mở mục khuyến mãi, sao chép mã phù hợp rồi áp dụng ở giỏ hàng hoặc checkout.",
      order:
        "Trong chế độ demo, mình không đọc dữ liệu đơn hàng thật. Để kiểm tra đơn, hãy đăng nhập rồi mở trang Đơn hàng.",
      cart: "Bạn có thể mở giỏ hàng để xem sản phẩm đã chọn, nhập coupon và tiếp tục checkout theo luồng mua sắm hiện tại.",
      book: "Bạn có thể bắt đầu ở trang Sản phẩm hoặc Danh mục để lọc sách theo chủ đề. Với portfolio demo, mình ưu tiên gợi ý hướng duyệt thay vì gọi AI provider.",
    },
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
    demoBadge: "Portfolio demo",
    demoHeadline: "Demo assistant is ready",
    demoMessage:
      "Grok is disabled in this environment, so BookStore is using a safe demo mode that still lets you test the assistant flow.",
    demoPlaceholder: "Ask about books, coupons, flash sales, or the cart...",
    demoHelperText:
      "Demo mode does not send personal data or query real order records.",
    demoNotice:
      "I am running in portfolio demo mode, so I can give general guidance and quick store navigation.",
    degradedBadge: "Fallback mode",
    degradedHeadline: "Grok is configured, but not fully stable",
    degradedMessage:
      "Some replies may fall back to the basic assistant experience until the Grok connection settles.",
    degradedPlaceholder:
      "Type a message and the chatbot will fall back if needed...",
    readyBadge: (model) => `Grok ready · ${model}`,
    readyHeadline: "Chatbot is ready to help",
    readyMessage:
      "Ask about books, order status, promotions, or get recommendations tailored to you.",
    readyPlaceholder: "Ask about books, orders, or promotions...",
    readySuccess: "Grok replied successfully.",
    helperText: "Press Enter to send, Shift + Enter for a new line",
    disabledHelperText:
      "The chatbot is temporarily off. You can still browse the store directly.",
    subtitle: "Book suggestions, orders, and deals right inside the store.",
    guestTitle: "Hello there!",
    guestDescription:
      "Sign in to chat one-on-one with the BookStore assistant, track your orders, and get personalized book recommendations.",
    guestLoginCta: "Sign in to start chatting",
    startConversationTitle: "Start a new conversation",
    startConversationDescription:
      "Ask about books on sale, order history, coupon codes, or get recommendations for a shelf that fits your taste.",
    serviceLabel: "BookStore Assistant",
    demoServiceLabel: "BookStore Demo Assistant",
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
        "I am running in portfolio demo mode. You can ask about books, coupons, flash sales, or jump to the shopping pages with the quick actions below.",
      promotion:
        "BookStore has a Promotions page for public coupons. Open promotions, copy a matching code, then apply it in cart or checkout.",
      order:
        "In demo mode I do not access real order data. Sign in and open Orders to check an actual order.",
      cart: "Open the cart to review selected books, enter a coupon, and continue through checkout.",
      book: "Start from Products or Categories to filter books by topic. In portfolio demo mode I provide browsing guidance instead of calling the AI provider.",
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

  if (healthError) {
    return {
      kind: "demo",
      badgeLabel: copy.demoBadge,
      badgeClassName: "border-sky-200 bg-sky-50 text-sky-700",
      headline: copy.demoHeadline,
      message: copy.demoMessage,
      inputPlaceholder: copy.demoPlaceholder,
    };
  }

  switch (health?.status) {
    case "DISABLED":
      return {
        kind: "demo",
        badgeLabel: copy.demoBadge,
        badgeClassName: "border-sky-200 bg-sky-50 text-sky-700",
        headline: copy.demoHeadline,
        message: copy.demoMessage,
        inputPlaceholder: copy.demoPlaceholder,
      };
    case "DEGRADED":
      return {
        kind: "degraded",
        badgeLabel: copy.degradedBadge,
        badgeClassName: "border-orange-200 bg-orange-50 text-orange-700",
        headline: copy.degradedHeadline,
        message: copy.degradedMessage,
        inputPlaceholder: copy.degradedPlaceholder,
      };
    default:
      return {
        kind: "ready",
        badgeLabel: copy.readyBadge(health?.model || "grok-3"),
        badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
        headline: copy.readyHeadline,
        message: copy.readyMessage,
        inputPlaceholder: copy.readyPlaceholder,
      };
  }
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
    content: `${copy.demoNotice}\n\n${content}`,
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

  const copy = widgetCopy[locale as WidgetLocale] ?? widgetCopy.vi;
  const healthMeta = useMemo(
    () => resolveHealthMeta(health, isCheckingHealth, healthError, copy),
    [copy, health, healthError, isCheckingHealth],
  );
  const displayHealthMeta = useMemo<HealthMeta>(() => {
    if (!isAuthenticated && !isAuthLoading && healthMeta.kind !== "checking") {
      return {
        kind: "demo",
        badgeLabel: copy.demoBadge,
        badgeClassName: "border-sky-200 bg-sky-50 text-sky-700",
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
          "fixed bottom-5 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-black shadow-[rgba(0,0,0,0.4)_0px_0px_1px,rgba(0,0,0,0.04)_0px_4px_4px] transition-all duration-300 active:scale-95 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14",
          "hover:scale-105 hover:bg-black/85",
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
                displayHealthMeta.kind === "ready"
                  ? "bg-emerald-400"
                  : displayHealthMeta.kind === "demo"
                    ? "bg-sky-400"
                    : "bg-amber-400",
              )}
            />
          </>
        )}
      </button>

      <div
        data-testid="chatbot-panel"
        className={cn(
          "fixed bottom-20 left-3 right-3 z-50 flex max-h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-[22px] bg-white shadow-[rgba(0,0,0,0.06)_0px_0px_0px_1px,rgba(0,0,0,0.08)_0px_18px_42px] transition-all duration-300 ease-out sm:bottom-24 sm:left-auto sm:right-6 sm:max-h-[560px] sm:w-[360px]",
          isOpen && !isMinimized
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-95 opacity-0",
        )}
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
          <div className="flex flex-1 overflow-hidden">
            {isAuthenticated && showConversations ? (
              <ChatConversations
                currentConversationId={currentConversationId}
                onSelectConversation={handleSelectConversation}
                onClose={() => setShowConversations(false)}
              />
            ) : null}

            <div className="flex flex-1 flex-col bg-[#f5f5f5]">
              <div className="border-b border-black/[0.05] bg-white px-3 py-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {displayHealthMeta.kind === "ready" ? (
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      ) : displayHealthMeta.kind === "demo" ? (
                        <Sparkles className="h-4 w-4 text-sky-500" />
                      ) : (
                        <Sparkles className="h-4 w-4 text-amber-500" />
                      )}
                      <p className="text-xs font-semibold text-black sm:text-sm">
                        {displayHealthMeta.headline}
                      </p>
                    </div>
                    <p className="mt-1 max-h-10 overflow-hidden text-xs leading-5 tracking-[0.14px] text-[#777169]">
                      {displayHealthMeta.message}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => void loadHealth()}
                    className="h-8 shrink-0 rounded-full bg-[rgba(245,242,239,0.8)] px-3 text-[11px] text-black shadow-[rgba(78,50,23,0.04)_0px_6px_16px] hover:bg-[#eee8e2]"
                  >
                    {locale === "vi" ? "Kiểm tra lại" : "Check again"}
                  </Button>
                </div>
              </div>

              <div
                className="flex-1 space-y-3 overflow-y-auto p-3"
                role="log"
                aria-live="polite"
                aria-label={
                  locale === "vi" ? "Tin nhắn chatbot" : "Chatbot messages"
                }
              >
                {!isAuthenticated && !isDemoMode ? (
                  <div className="flex min-h-[360px] flex-col justify-between gap-4 rounded-[20px] bg-white p-4 text-center shadow-[rgba(0,0,0,0.06)_0px_0px_0px_1px,rgba(0,0,0,0.04)_0px_1px_2px]">
                    <div>
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(245,242,239,0.8)] shadow-[rgba(78,50,23,0.04)_0px_6px_16px]">
                        <MessageCircle className="h-6 w-6 text-black" />
                      </div>
                      <h3 className="mb-1.5 flex items-center justify-center gap-2 text-base font-semibold text-slate-900">
                        {copy.guestTitle}{" "}
                        <Hand className="h-4 w-4 text-red-500" />
                      </h3>
                      <p className="text-xs leading-5 tracking-[0.14px] text-[#4e4e4e]">
                        {copy.guestDescription}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap justify-center gap-2">
                        {copy.guestActions.map((action) => (
                          <button
                            key={action.path}
                            type="button"
                            onClick={() => handleGuestAction(action.path)}
                            className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f5] px-3 py-2 text-xs font-medium text-slate-800 shadow-[rgba(0,0,0,0.075)_0px_0px_0px_0.5px_inset] transition-colors hover:bg-[#f5f2ef]"
                          >
                            <action.icon className="h-3.5 w-3.5 text-black" />
                            <span>{action.label}</span>
                          </button>
                        ))}
                      </div>

                      <Button
                        type="button"
                        data-testid="chatbot-login-cta"
                        onClick={goToLogin}
                        className="h-11 w-full rounded-full bg-black text-sm text-white shadow-[rgba(0,0,0,0.4)_0px_0px_1px,rgba(0,0,0,0.04)_0px_4px_4px] hover:bg-black/85"
                      >
                        <LogIn className="mr-2 h-4 w-4" />
                        {copy.guestLoginCta}
                      </Button>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex min-h-[360px] flex-col justify-between gap-4 rounded-[20px] bg-white p-4 text-center shadow-[rgba(0,0,0,0.06)_0px_0px_0px_1px,rgba(0,0,0,0.04)_0px_1px_2px]">
                    <div>
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-black shadow-[rgba(0,0,0,0.4)_0px_0px_1px,rgba(0,0,0,0.04)_0px_4px_4px]">
                        <MessageCircle className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="mb-1.5 text-base font-semibold text-slate-900">
                        {copy.startConversationTitle}
                      </h3>
                      <p className="text-xs leading-5 tracking-[0.14px] text-[#4e4e4e]">
                        {copy.startConversationDescription}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap justify-center gap-2">
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
                            className="rounded-full bg-[rgba(245,242,239,0.8)] px-3 py-1.5 text-xs text-black shadow-[rgba(78,50,23,0.04)_0px_6px_16px] transition-colors hover:bg-[#eee8e2]"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center justify-center gap-2 text-xs text-[#777169]">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>
                          {isDemoMode
                            ? copy.demoServiceLabel
                            : health?.service || copy.serviceLabel}
                        </span>
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
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black shadow-[rgba(0,0,0,0.4)_0px_0px_1px,rgba(0,0,0,0.04)_0px_4px_4px]">
                          <MessageCircle className="h-4 w-4 text-white" />
                        </div>
                        <div className="rounded-2xl rounded-tl-md bg-white px-4 py-3 shadow-[rgba(0,0,0,0.06)_0px_0px_0px_1px,rgba(0,0,0,0.04)_0px_1px_2px]">
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
    </>
  );
}
