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
  helperText = "Nhấn Enter để gửi, Shift + Enter để xuống dòng",
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
      className="border-t border-black/[0.05] bg-white p-3"
    >
      <div className="flex items-end gap-2">
        <div className="relative flex-1">
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
              "w-full resize-none rounded-[24px] border border-transparent bg-[#f5f5f5] px-4 py-3 pr-12 text-sm tracking-[0.14px] text-black shadow-[rgba(0,0,0,0.075)_0px_0px_0px_0.5px_inset] transition-all duration-200",
              "focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-300/50",
              "placeholder:text-[#777169]",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
            style={{
              minHeight: "48px",
              maxHeight: "120px",
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
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
            "h-12 w-12 shrink-0 rounded-full bg-black text-white shadow-[rgba(0,0,0,0.4)_0px_0px_1px,rgba(0,0,0,0.04)_0px_4px_4px] transition-all duration-200",
            "hover:bg-black/85",
            (!message.trim() || isTyping || disabled) &&
              "cursor-not-allowed opacity-50",
          )}
        >
          {isTyping ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>

      <p className="mt-2 text-center text-[10px] leading-4 text-[#777169]">
        {helperText}
      </p>
    </form>
  );
}
