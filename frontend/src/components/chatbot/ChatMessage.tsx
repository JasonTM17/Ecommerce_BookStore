"use client";

import { MessageCircle, ThumbsUp, ThumbsDown, BookOpen, Star, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ChatMessage as ChatMessageType, BookSuggestion, QuickAction, chatbotApi } from "@/lib/chatbot";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ChatMessageProps {
  message: ChatMessageType;
  showFeedback?: boolean;
  onQuickAction?: (action: string, params?: Record<string, any>) => void;
}

function BookSuggestionCard({ book }: { book: BookSuggestion }) {
  return (
    <Link
      href={`/products/${book.productId}`}
      className="flex items-center gap-3 p-2 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all"
    >
      {book.imageUrl ? (
        <div className="w-12 h-16 bg-gray-100 rounded-lg overflow-hidden relative shrink-0">
          <Image src={book.imageUrl} alt={book.title} fill className="object-cover" sizes="48px" />
        </div>
      ) : (
        <div className="w-12 h-16 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
          <BookOpen className="h-6 w-6 text-gray-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{book.title}</p>
        <p className="text-xs text-gray-500 truncate">{book.author}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-semibold text-blue-600">{book.price?.toLocaleString("vi-VN")}đ</span>
          {book.averageRating && book.averageRating > 0 && (
            <div className="flex items-center gap-0.5">
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs text-gray-500">{book.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function QuickActionButton({
  action,
  onClick,
}: {
  action: QuickAction;
  onClick: (action: QuickAction) => void;
}) {
  const iconMap: Record<string, React.ReactNode> = {
    search: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    track_order: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    view_cart: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    view_promotions: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  };

  return (
    <button
      onClick={() => onClick(action)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white border border-blue-200 text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
    >
      {iconMap[action.action] || <MessageCircle className="h-4 w-4" />}
      {action.label}
    </button>
  );
}

export function ChatMessage({ message, showFeedback = true, onQuickAction }: ChatMessageProps) {
  const router = useRouter();
  const { locale } = useLanguage();
  const [feedbackGiven, setFeedbackGiven] = useState<"up" | "down" | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  const copy =
    locale === "vi"
      ? {
          suggestions: "Gợi ý sách:",
          helpful: "Hữu ích",
          unhelpful: "Không hữu ích",
          helpfulDone: "Đã đánh giá hữu ích",
          unhelpfulDone: "Đã đánh giá không hữu ích",
        }
      : {
          suggestions: "Suggested books:",
          helpful: "Helpful",
          unhelpful: "Not helpful",
          helpfulDone: "Marked as helpful",
          unhelpfulDone: "Marked as not helpful",
        };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(locale === "vi" ? "vi-VN" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleFeedback = async (isHelpful: boolean) => {
    if (feedbackGiven || isSubmittingFeedback) return;

    setIsSubmittingFeedback(true);
    try {
      if (message.messageId) {
        await chatbotApi.submitFeedback(message.messageId, undefined, undefined, isHelpful);
      }
      setFeedbackGiven(isHelpful ? "up" : "down");
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      setFeedbackGiven(isHelpful ? "up" : "down");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    if (onQuickAction) {
      onQuickAction(action.action, action.params);
      return;
    }

    switch (action.action) {
      case "search":
        router.push("/products?focus=search");
        break;
      case "track_order":
        router.push("/orders");
        break;
      case "view_cart":
        router.push("/cart");
        break;
      case "view_promotions":
        router.push("/promotions");
        break;
      default:
        break;
    }
  };

  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      {isUser ? (
        <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center shadow-md shrink-0">
          <span className="text-white text-xs font-medium">B</span>
        </div>
      ) : (
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md shrink-0">
          <MessageCircle className="h-4 w-4 text-white" />
        </div>
      )}

      <div className={cn("max-w-[75%] flex flex-col gap-1", isUser && "items-end")}>
        <div
          className={cn(
            "px-4 py-3 rounded-2xl shadow-sm",
            isUser
              ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-md"
              : "bg-white text-gray-800 rounded-tl-md border border-gray-100"
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>

        {isAssistant && message.bookSuggestions && message.bookSuggestions.length > 0 && (
          <div className="mt-2 space-y-2">
            <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {copy.suggestions}
            </p>
            <div className="space-y-1">
              {message.bookSuggestions.map((book) => (
                <BookSuggestionCard key={book.productId} book={book} />
              ))}
            </div>
          </div>
        )}

        {isAssistant && message.quickActions && message.quickActions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.quickActions.map((action, index) => (
              <QuickActionButton key={`${action.action}-${index}`} action={action} onClick={handleQuickAction} />
            ))}
          </div>
        )}

        <div className={cn("flex items-center gap-2 mt-1", isUser ? "flex-row-reverse" : "flex-row")}>
          <span className="text-[10px] text-gray-400">{formatTime(message.createdAt)}</span>

          {isAssistant && showFeedback && (
            <div className="flex items-center gap-1">
              {isSubmittingFeedback ? (
                <div className="p-1">
                  <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                </div>
              ) : feedbackGiven === "up" ? (
                <button disabled aria-label={copy.helpfulDone} className="p-1 text-green-500 cursor-default">
                  <ThumbsUp className="h-3 w-3 fill-green-500" />
                </button>
              ) : feedbackGiven === "down" ? (
                <button disabled aria-label={copy.unhelpfulDone} className="p-1 text-red-500 cursor-default">
                  <ThumbsDown className="h-3 w-3 fill-red-500" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleFeedback(true)}
                    className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                    title={copy.helpful}
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleFeedback(false)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title={copy.unhelpful}
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
