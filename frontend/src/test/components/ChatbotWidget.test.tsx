import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import { chatbotApi } from "@/lib/chatbot";

const pushMock = vi.fn();
const authState = { isAuthenticated: false, isLoading: false };

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => ({
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
  }),
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
    window.history.replaceState({}, "", "/products?source=home");
  });

  it("shows a login prompt for guests and preserves redirect targets", async () => {
    vi.mocked(chatbotApi.checkHealth).mockResolvedValue({
      status: "UP",
      service: "Grok AI Chatbot",
      model: "grok-3",
      message: "Grok đã được cấu hình và sẵn sàng trả lời.",
    });

    render(<ChatbotWidget />);

    fireEvent.click(screen.getByTestId("chatbot-launcher"));

    expect(await screen.findByText(/đăng nhập để trò chuyện 1:1/i)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("chatbot-login-cta"));

    expect(pushMock).toHaveBeenCalledWith("/login?redirect=%2Fproducts%3Fsource%3Dhome");
  });

  it("renders the ready state when Grok health is up", async () => {
    authState.isAuthenticated = true;
    vi.mocked(chatbotApi.checkHealth).mockResolvedValue({
      status: "UP",
      service: "Grok AI Chatbot",
      model: "grok-3",
      message: "Grok đã được cấu hình và sẵn sàng trả lời.",
    });

    render(<ChatbotWidget />);
    fireEvent.click(screen.getByTestId("chatbot-launcher"));

    expect(await screen.findByText(/chatbot đã sẵn sàng hỗ trợ/i)).toBeInTheDocument();
    expect(screen.getByTestId("chatbot-status-badge")).toHaveTextContent(/grok sẵn sàng/i);
    expect(screen.getByPlaceholderText(/nhập câu hỏi về sách/i)).toBeInTheDocument();
  });

  it("disables message entry when the chatbot is turned off", async () => {
    authState.isAuthenticated = true;
    vi.mocked(chatbotApi.checkHealth).mockResolvedValue({
      status: "DISABLED",
      service: "BookStore Chatbot",
      model: "disabled",
      message: "Chatbot đang được tắt cho môi trường này.",
      providerEnabled: "false",
    });

    render(<ChatbotWidget />);
    fireEvent.click(screen.getByTestId("chatbot-launcher"));

    expect(await screen.findByText(/chatbot đang tạm tắt ở môi trường này/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/chatbot đang tạm tắt/i)).toBeDisabled();
    });
  });
});
