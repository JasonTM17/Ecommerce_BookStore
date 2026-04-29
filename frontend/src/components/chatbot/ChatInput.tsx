"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isTyping?: boolean;
  disabled?: boolean;
  placeholder?: string;
  helperText?: string;
}

export function ChatInput({
  onSendMessage,
  isTyping = false,
  disabled = false,
  placeholder = "Nhập tin nhắn...",
  helperText = "Enter để gửi, Shift + Enter để xuống dòng",
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isTyping || disabled) return;

    const messageToSend = message.trim();
    setMessage("");
    await onSendMessage(messageToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-black/[0.06] bg-white p-3"
    >
      <div className="flex items-end gap-2">
        <div className="relative min-w-0 flex-1">
          <textarea
            data-testid="chatbot-message-input"
            aria-label={placeholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isTyping}
            rows={1}
            className={cn(
              "w-full resize-none rounded-[22px] border border-transparent bg-[#f4f4f4] px-3.5 py-2.5 pr-4 text-sm text-black shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] transition-all duration-200",
              "placeholder:text-[#777169] focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-300/50",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
            style={{
              minHeight: "42px",
              maxHeight: "96px",
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${Math.min(target.scrollHeight, 96)}px`;
            }}
          />
        </div>

        <Button
          type="submit"
          data-testid="chatbot-send-message"
          aria-label="Send message"
          size="icon"
          disabled={!message.trim() || isTyping || disabled}
          className={cn(
            "h-[42px] w-[42px] shrink-0 rounded-full bg-black text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition-all duration-200 hover:bg-black/85",
            (!message.trim() || isTyping || disabled) &&
              "cursor-not-allowed opacity-50",
          )}
        >
          {isTyping ? (
            <Loader2 className="h-[18px] w-[18px] animate-spin" />
          ) : (
            <Send className="h-[18px] w-[18px]" />
          )}
        </Button>
      </div>

      <p className="mt-2 text-center text-[10px] leading-4 text-[#777169]">
        {helperText}
      </p>
    </form>
  );
}
