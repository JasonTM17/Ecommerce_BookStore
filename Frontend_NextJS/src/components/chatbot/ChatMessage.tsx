"use client";

import { MessageCircle, ThumbsUp, ThumbsDown, BookOpen, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ChatMessage as ChatMessageType, BookSuggestion } from "@/lib/chatbot";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { chatbotApi } from "@/lib/chatbot";

interface ChatMessageProps {
  message: ChatMessageType;
  showFeedback?: boolean;
}

export function ChatMessage({ message, showFeedback = true }: ChatMessageProps) {
  const [feedbackGiven, setFeedbackGiven] = useState<"up" | "down" | null>(null);
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleFeedback = async (isHelpful: boolean) => {
    if (feedbackGiven) return;
    
    try {
      // Get the message ID from the conversation
      // For now, we'll skip actual feedback submission as we don't have messageId
      setFeedbackGiven(isHelpful ? "up" : "down");
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  // Extract book suggestions from message content (simple parsing)
  const extractBookSuggestions = (content: string): BookSuggestion[] => {
    // This is a placeholder - in real implementation, 
    // we'd get this from the API response
    return [];
  };

  const bookSuggestions = isAssistant ? extractBookSuggestions(message.content) : [];

  return (
    <div
      className={cn(
        "flex items-start gap-3",
        isUser && "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      {isUser ? (
        <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center shadow-md shrink-0">
          <span className="text-white text-xs font-medium">B</span>
        </div>
      ) : (
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md shrink-0">
          <MessageCircle className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Message Content */}
      <div
        className={cn(
          "max-w-[75%] flex flex-col gap-1",
          isUser && "items-end"
        )}
      >
        {/* Message Bubble */}
        <div
          className={cn(
            "px-4 py-3 rounded-2xl shadow-sm",
            isUser
              ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-md"
              : "bg-white text-gray-800 rounded-tl-md border border-gray-100"
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        {/* Book Suggestions (if assistant) */}
        {isAssistant && bookSuggestions.length > 0 && (
          <div className="mt-2 space-y-2">
            <p className="text-xs text-gray-500 font-medium">📚 Gợi ý sách:</p>
            {bookSuggestions.map((book) => (
              <Link
                key={book.productId}
                href={`/products/${book.productId}`}
                className="flex items-center gap-3 p-2 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all"
              >
                {book.imageUrl && (
                  <div className="w-12 h-16 bg-gray-100 rounded-lg overflow-hidden relative">
                    <Image
                      src={book.imageUrl}
                      alt={book.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {book.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{book.author}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-semibold text-blue-600">
                      {book.price.toLocaleString("vi-VN")}đ
                    </span>
                    {book.averageRating > 0 && (
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs text-gray-500">
                          {book.averageRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Time and Feedback */}
        <div
          className={cn(
            "flex items-center gap-2 mt-1",
            isUser ? "flex-row-reverse" : "flex-row"
          )}
        >
          <span className="text-[10px] text-gray-400">
            {formatTime(message.createdAt)}
          </span>

          {isAssistant && showFeedback && (
            <div className="flex items-center gap-1">
              {feedbackGiven === "up" ? (
                <button
                  disabled
                  className="p-1 text-green-500 cursor-default"
                >
                  <ThumbsUp className="h-3 w-3" />
                </button>
              ) : feedbackGiven === "down" ? (
                <button
                  disabled
                  className="p-1 text-red-500 cursor-default"
                >
                  <ThumbsDown className="h-3 w-3" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleFeedback(true)}
                    className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                    title="Hữu ích"
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleFeedback(false)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Không hữu ích"
                  >
                    <ThumbsDown className="h-3 w-3" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
