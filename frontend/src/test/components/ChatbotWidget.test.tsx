import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import { chatbotApi } from "@/lib/chatbot";

const pushMock = vi.fn();
const authState = { isAuthenticated: false, isLoading: false };
let currentLocale: "vi" | "en" = "vi";

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
    placeholder,
    helperText,
    disabled,
  }: {
    placeholder?: string;
    helperText?: string;
    disabled?: boolean;
  }) => (
    <div data-testid="chat-input" data-disabled={String(Boolean(disabled))}>
      <span data-testid="chat-input-placeholder">{placeholder}</span>
      <span data-testid="chat-input-helper">{helperText}</span>
    </div>
  ),
}));

vi.mock("@/components/chatbot/ChatConversations", () => ({
  ChatConversations: () => <div data-testid="chat-conversations" />,
}));

vi.mock("@/components/chatbot/ChatMessage", () => ({
  ChatMessage: ({ message }: { message: { content: string } }) => (
    <div data-testid="chat-message">{message.content}</div>
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

  it("renders Vietnamese guest copy and preserves redirect targets", async () => {
    vi.mocked(chatbotApi.checkHealth).mockResolvedValue({
      status: "UP",
      service: "Grok AI Chatbot",
      model: "grok-3",
      message: "Grok đã được cấu hình và sẵn sàng trả lời.",
    });

    render(<ChatbotWidget />);

    fireEvent.click(screen.getByTestId("chatbot-launcher"));

    expect(await screen.findByText("Chào bạn!")).toBeInTheDocument();
    expect(screen.getByText("Đăng nhập để bắt đầu chat")).toBeInTheDocument();
    expect(screen.getByTestId("chat-header-subtitle")).toHaveTextContent(
      "Gợi ý sách, đơn hàng và ưu đãi ngay trong cửa hàng."
    );
    expect(screen.getByTestId("chatbot-status-badge")).toHaveTextContent("Grok sẵn sàng · grok-3");

    fireEvent.click(screen.getByTestId("chatbot-login-cta"));

    expect(pushMock).toHaveBeenCalledWith("/login?redirect=%2Fproducts%3Fsource%3Dhome");
  });

  it("renders English guest copy and action labels when locale changes", async () => {
    currentLocale = "en";
    vi.mocked(chatbotApi.checkHealth).mockResolvedValue({
      status: "UP",
      service: "Grok AI Chatbot",
      model: "grok-3",
      message: "Grok is configured and ready to answer.",
    });

    render(<ChatbotWidget />);

    fireEvent.click(screen.getByTestId("chatbot-launcher"));

    expect(await screen.findByText("Hello there!")).toBeInTheDocument();
    expect(screen.getByText("Sign in to start chatting")).toBeInTheDocument();
    expect(screen.getByText("Browse books")).toBeInTheDocument();
    expect(screen.getByText("View promotions")).toBeInTheDocument();
    expect(screen.getByText("Browse categories")).toBeInTheDocument();
    expect(screen.getByTestId("chat-header-subtitle")).toHaveTextContent(
      "Book suggestions, orders, and deals right inside the store."
    );
    expect(screen.getByTestId("chatbot-status-badge")).toHaveTextContent("Grok ready · grok-3");
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

    expect(await screen.findByText("Chatbot is ready to help")).toBeInTheDocument();
    expect(screen.getByTestId("chatbot-status-badge")).toHaveTextContent("Grok ready · grok-3");
    expect(screen.getByTestId("chat-input-placeholder")).toHaveTextContent(
      "Ask about books, orders, or promotions..."
    );
    expect(screen.getByTestId("chat-input-helper")).toHaveTextContent(
      "Press Enter to send, Shift + Enter for a new line"
    );
    expect(screen.getByText("Find books about Python")).toBeInTheDocument();
  });

  it("renders the disabled state copy and keeps the input locked", async () => {
    authState.isAuthenticated = true;
    vi.mocked(chatbotApi.checkHealth).mockResolvedValue({
      status: "DISABLED",
      service: "BookStore Chatbot",
      model: "disabled",
      message: "Chatbot is turned off for this environment.",
      providerEnabled: "false",
    });

    render(<ChatbotWidget />);
    fireEvent.click(screen.getByTestId("chatbot-launcher"));

    expect(await screen.findByText("Chatbot đang tạm tắt ở môi trường này")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId("chat-input")).toHaveAttribute("data-disabled", "true");
    });
    expect(screen.getByTestId("chat-input-placeholder")).toHaveTextContent("Chatbot đang tạm tắt");
    expect(screen.getByTestId("chat-input-helper")).toHaveTextContent(
      "Chatbot đang tạm tắt. Bạn vẫn có thể duyệt sách và khuyến mãi trực tiếp."
    );
  });
});
