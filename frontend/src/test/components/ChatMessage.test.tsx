import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChatMessage } from "@/components/chatbot/ChatMessage";
import type { ChatMessage as ChatMessageType } from "@/lib/chatbot";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe("ChatMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function buildAssistantMessage(actions: ChatMessageType["quickActions"]) {
    return {
      id: 1,
      role: "assistant",
      content: "Choose an action",
      createdAt: "2026-04-12T10:00:00.000Z",
      quickActions: actions,
    } as ChatMessageType;
  }

  it("routes search quick action to the canonical products search path", () => {
    render(
      <ChatMessage
        message={buildAssistantMessage([
          { action: "search", label: "Search books", icon: "search" },
        ])}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /search books/i }));

    expect(pushMock).toHaveBeenCalledWith("/products?focus=search");
  });

  it("routes order and promotion quick actions to canonical public routes", () => {
    render(
      <ChatMessage
        message={buildAssistantMessage([
          { action: "track_order", label: "Track order", icon: "order" },
          { action: "view_promotions", label: "View promotions", icon: "tag" },
        ])}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /track order/i }));
    fireEvent.click(screen.getByRole("button", { name: /view promotions/i }));

    expect(pushMock).toHaveBeenNthCalledWith(1, "/orders");
    expect(pushMock).toHaveBeenNthCalledWith(2, "/promotions");
  });
});
