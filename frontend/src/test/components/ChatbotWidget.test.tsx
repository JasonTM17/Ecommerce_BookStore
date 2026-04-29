import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import { chatbotApi } from "@/lib/chatbot";

const pushMock = vi.fn();
const authState = { isAuthenticated: false, isLoading: false };
let currentLocale: "vi" | "en" = "vi";
const mojibakePattern =
  /\u00C3|\u00C4|\u00C6|\u00C2|\u00E2\u20AC\u2122|\u00E1\u00BB|\u00E1\u00BA|Nguy\u00E1|S\u00C6|Tr\u00E1\u00BA|\uFFFD/u;

function expectNoMojibake() {
  expect(document.body.textContent || "").not.toMatch(mojibakePattern);
}

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/components/providers/language-provider", () => ({
  useLanguage: () => ({
    locale: currentLocale,
    setLocale: vi.fn(),
    t: (key: string) => key,
    isLoading: false,
  }),
}));

vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => ({
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
  }),
}));

vi.mock("@/components/chatbot/ChatHeader", () => ({
  ChatHeader: ({
    subtitle,
    statusLabel,
    onClose,
    onMinimize,
    isMinimized,
    canManageConversations,
  }: {
    subtitle: string;
    statusLabel: string;
    onClose: () => void;
    onMinimize: () => void;
    isMinimized: boolean;
    canManageConversations: boolean;
  }) => (
    <div
      data-testid="chat-header"
      data-minimized={String(isMinimized)}
      data-manage={String(canManageConversations)}
    >
      <span data-testid="chat-header-subtitle">{subtitle}</span>
      <span data-testid="chatbot-status-badge">{statusLabel}</span>
      <button type="button" onClick={onClose}>
        close
      </button>
      <button type="button" onClick={onMinimize}>
        minimize
      </button>
    </div>
  ),
}));

vi.mock("@/components/chatbot/ChatInput", () => ({
  ChatInput: ({
    onSendMessage,
    placeholder,
    helperText,
    disabled,
  }: {
    onSendMessage: (message: string) => Promise<void>;
    placeholder?: string;
    helperText?: string;
    disabled?: boolean;
  }) => (
    <div data-testid="chat-input" data-disabled={String(Boolean(disabled))}>
      <span data-testid="chat-input-placeholder">{placeholder}</span>
      <span data-testid="chat-input-helper">{helperText}</span>
      <button
        type="button"
        data-testid="chat-input-demo-send"
        disabled={disabled}
        onClick={() => void onSendMessage("Any active coupon codes?")}
      >
        send
      </button>
    </div>
  ),
}));

vi.mock("@/components/chatbot/ChatConversations", () => ({
  ChatConversations: () => <div data-testid="chat-conversations" />,
}));

vi.mock("@/components/chatbot/ChatMessage", () => ({
  ChatMessage: ({
    message,
  }: {
    message: {
      content: string;
      quickActions?: Array<{ label: string }>;
    };
  }) => (
    <div data-testid="chat-message">
      {message.content}
      {message.quickActions?.map((action) => (
        <span key={action.label}>{action.label}</span>
      ))}
    </div>
  ),
}));

vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("@/lib/toast", () => ({
  notifyToast: vi.fn(),
}));

vi.mock("@/lib/chatbot", () => ({
  chatbotApi: {
    checkHealth: vi.fn(),
    sendMessage: vi.fn(),
    getConversations: vi.fn(),
    getConversationDetail: vi.fn(),
    deleteConversation: vi.fn(),
    submitFeedback: vi.fn(),
  },
}));

describe("ChatbotWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.isAuthenticated = false;
    authState.isLoading = false;
    currentLocale = "vi";
    window.history.replaceState({}, "", "/products?source=home");
  });

  it("renders Vietnamese portfolio demo copy for guest shoppers", async () => {
    vi.mocked(chatbotApi.checkHealth).mockResolvedValue({
      status: "UP",
      service: "Grok AI Chatbot",
      model: "grok-3",
      message: "Grok đã được cấu hình và sẵn sàng trả lời.",
    });

    render(<ChatbotWidget />);

    fireEvent.click(screen.getByTestId("chatbot-launcher"));

    expect(
      await screen.findByText("Trợ lý demo sẵn sàng"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("chat-header-subtitle")).toHaveTextContent(
      "Gợi ý sách, ưu đãi và hỗ trợ mua hàng.",
    );
    expect(screen.getByTestId("chatbot-status-badge")).toHaveTextContent(
      "Demo portfolio",
    );
    expect(screen.getByTestId("chat-input-placeholder")).toHaveTextContent(
      "Hỏi về sách, coupon, flash sale hoặc giỏ hàng...",
    );
    expectNoMojibake();

    fireEvent.click(screen.getByTestId("chat-input-demo-send"));

    expect(
      await screen.findByText(/chế độ demo portfolio/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Xem khuyến mãi")).toBeInTheDocument();
    expect(chatbotApi.sendMessage).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("renders English portfolio demo copy and suggestions when locale changes", async () => {
    currentLocale = "en";
    vi.mocked(chatbotApi.checkHealth).mockResolvedValue({
      status: "UP",
      service: "Grok AI Chatbot",
      model: "grok-3",
      message: "Grok is configured and ready to answer.",
    });

    render(<ChatbotWidget />);

    fireEvent.click(screen.getByTestId("chatbot-launcher"));

    expect(
      await screen.findByText("Demo assistant is ready"),
    ).toBeInTheDocument();
    expect(screen.getByText("Any active coupon codes?")).toBeInTheDocument();
    expect(screen.getByText("Recommend self-help books")).toBeInTheDocument();
    expect(
      screen.getByText("What is in flash sale today?"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("chat-header-subtitle")).toHaveTextContent(
      "Book suggestions, deals, and shopping help.",
    );
    expect(screen.getByTestId("chatbot-status-badge")).toHaveTextContent(
      "Portfolio demo",
    );
    expect(screen.getByTestId("chat-input-placeholder")).toHaveTextContent(
      "Ask about books, coupons, flash sales, or the cart...",
    );
    expectNoMojibake();
  });

  it("renders the ready state copy in English for authenticated users", async () => {
    currentLocale = "en";
    authState.isAuthenticated = true;
    vi.mocked(chatbotApi.checkHealth).mockResolvedValue({
      status: "UP",
      service: "Grok AI Chatbot",
      model: "grok-3",
      message: "Grok is ready.",
    });

    render(<ChatbotWidget />);
    fireEvent.click(screen.getByTestId("chatbot-launcher"));

    expect(
      await screen.findByText("Chatbot is ready to help"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("chatbot-status-badge")).toHaveTextContent(
      "Grok ready · grok-3",
    );
    expect(screen.getByTestId("chat-input-placeholder")).toHaveTextContent(
      "Ask about books, orders, or promotions...",
    );
    expect(screen.getByTestId("chat-input-helper")).toHaveTextContent(
      "Enter to send, Shift + Enter for a new line",
    );
    expect(screen.getByText("Find books about Python")).toBeInTheDocument();
    expectNoMojibake();
  });

  it("uses portfolio demo mode when the provider is disabled", async () => {
    authState.isAuthenticated = false;
    vi.mocked(chatbotApi.checkHealth).mockResolvedValue({
      status: "DISABLED",
      service: "BookStore Chatbot",
      model: "disabled",
      message: "Chatbot is turned off for this environment.",
      providerEnabled: "false",
    });

    render(<ChatbotWidget />);
    fireEvent.click(screen.getByTestId("chatbot-launcher"));

    expect(
      await screen.findByText("Trợ lý demo sẵn sàng"),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId("chat-input")).toHaveAttribute(
        "data-disabled",
        "false",
      );
    });
    expect(screen.getByTestId("chat-input-placeholder")).toHaveTextContent(
      "Hỏi về sách, coupon, flash sale hoặc giỏ hàng...",
    );
    expect(screen.getByTestId("chat-input-helper")).toHaveTextContent(
      "Demo chỉ trả lời hướng dẫn chung, không truy vấn đơn hàng thật.",
    );

    fireEvent.click(screen.getByTestId("chat-input-demo-send"));

    expect(
      await screen.findByText(/chế độ demo portfolio/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Xem khuyến mãi")).toBeInTheDocument();
    expect(chatbotApi.sendMessage).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
    expectNoMojibake();
  });
});
