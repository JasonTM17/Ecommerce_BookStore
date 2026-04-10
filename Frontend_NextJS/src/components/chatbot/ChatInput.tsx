"use client";

import { useState } from "react";
import { Send, Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { chatbotApi } from "@/lib/chatbot";

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isTyping?: boolean;
  disabled?: boolean;
}

export function ChatInput({
  onSendMessage,
  isTyping = false,
  disabled = false,
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
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn..."
            disabled={disabled || isTyping}
            rows={1}
            className={cn(
              "w-full px-4 py-3 pr-12 rounded-xl",
              "bg-gray-50 border border-gray-200",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
              "resize-none text-sm",
              "placeholder:text-gray-400",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all duration-200"
            )}
            style={{
              minHeight: "48px",
              maxHeight: "120px",
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = Math.min(target.scrollHeight, 120) + "px";
            }}
          />
        </div>

        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || isTyping || disabled}
          className={cn(
            "h-12 w-12 rounded-xl shrink-0",
            "bg-gradient-to-br from-blue-600 to-blue-700",
            "hover:from-blue-700 hover:to-blue-800",
            "shadow-lg shadow-blue-500/30",
            "transition-all duration-200",
            (message === "" || isTyping || disabled) && "opacity-50 cursor-not-allowed"
          )}
        >
          {isTyping ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>

      <p className="text-[10px] text-gray-400 mt-2 text-center">
        Nhấn Enter để gửi, Shift + Enter để xuống dòng
      </p>
    </form>
  );
}
