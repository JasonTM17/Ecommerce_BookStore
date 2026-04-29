"use client";

import {
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  Star,
  Loader2,
  Package,
  Search,
  ShoppingCart,
  Tag,
} from "lucide-react";
import Link from "next/link";
import {
  ChatMessage as ChatMessageType,
  BookSuggestion,
  QuickAction,
  chatbotApi,
} from "@/lib/chatbot";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductImage } from "@/components/ui/ProductImage";
import { getCategoryPlaceholderImage } from "@/lib/product-images";

interface ChatMessageProps {
  message: ChatMessageType;
  showFeedback?: boolean;
  onQuickAction?: (action: string, params?: Record<string, any>) => void;
}

function BookSuggestionCard({ book }: { book: BookSuggestion }) {
  const { locale } = useLanguage();

  return (
    <Link
      href={`/products/${book.productId}`}
      className="flex items-center gap-3 rounded-2xl bg-white p-2 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:bg-[#f8f3ef]"
    >
      {book.imageUrl ? (
        <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
          <ProductImage
            src={book.imageUrl}
            fallbackSrc={getCategoryPlaceholderImage()}
            alt={book.title}
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-16 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100">
          <BookOpen className="h-6 w-6 text-gray-400" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">
          {book.title}
        </p>
        <p className="truncate text-xs text-gray-500">{book.author}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-semibold text-black">
            {new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
              currency: "VND",
              maximumFractionDigits: 0,
              style: "currency",
            }).format(book.price || 0)}
          </span>
          {book.averageRating && book.averageRating > 0 ? (
            <div className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-500">
                {book.averageRating.toFixed(1)}
              </span>
            </div>
          ) : null}
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
    search: <Search className="h-3.5 w-3.5" />,
    track_order: <Package className="h-3.5 w-3.5" />,
    view_cart: <ShoppingCart className="h-3.5 w-3.5" />,
    view_promotions: <Tag className="h-3.5 w-3.5" />,
  };

  return (
    <button
      type="button"
      onClick={() => onClick(action)}
      className="inline-flex items-center gap-1.5 rounded-full bg-[#f4f1ee] px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-[#ebe3dc]"
    >
      {iconMap[action.action] || <MessageCircle className="h-3.5 w-3.5" />}
      {action.label}
    </button>
  );
}

export function ChatMessage({
  message,
  showFeedback = true,
  onQuickAction,
}: ChatMessageProps) {
  const router = useRouter();
  const { locale } = useLanguage();
  const [feedbackGiven, setFeedbackGiven] = useState<"up" | "down" | null>(
    null,
  );
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
        await chatbotApi.submitFeedback(
          message.messageId,
          undefined,
          undefined,
          isHelpful,
        );
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
    <div
      data-testid={
        isUser ? "chatbot-user-message" : "chatbot-assistant-message"
      }
      className={cn("flex items-start gap-2.5", isUser && "flex-row-reverse")}
    >
      {isUser ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
          <span className="text-xs font-medium text-white">B</span>
        </div>
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f4f1ee]">
          <MessageCircle className="h-4 w-4 text-black" />
        </div>
      )}

      <div
        className={cn(
          "flex max-w-[82%] flex-col gap-1",
          isUser && "items-end",
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5",
            isUser
              ? "rounded-tr-md bg-black text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
              : "rounded-tl-md bg-white text-[#4e4e4e] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]",
          )}
        >
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message.content}
          </p>
        </div>

        {isAssistant &&
        message.bookSuggestions &&
        message.bookSuggestions.length > 0 ? (
          <div className="mt-2 space-y-2">
            <p className="flex items-center gap-1 text-xs font-medium text-gray-500">
              <BookOpen className="h-3 w-3" />
              {copy.suggestions}
            </p>
            <div className="space-y-1">
              {message.bookSuggestions.map((book) => (
                <BookSuggestionCard key={book.productId} book={book} />
              ))}
            </div>
          </div>
        ) : null}

        {isAssistant &&
        message.quickActions &&
        message.quickActions.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.quickActions.map((action, index) => (
              <QuickActionButton
                key={`${action.action}-${index}`}
                action={action}
                onClick={handleQuickAction}
              />
            ))}
          </div>
        ) : null}

        <div
          className={cn(
            "mt-1 flex items-center gap-2",
            isUser ? "flex-row-reverse" : "flex-row",
          )}
        >
          <span className="text-[10px] text-gray-400">
            {formatTime(message.createdAt)}
          </span>

          {isAssistant && showFeedback ? (
            <div className="flex items-center gap-1">
              {isSubmittingFeedback ? (
                <div className="p-1">
                  <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                </div>
              ) : feedbackGiven === "up" ? (
                <button
                  type="button"
                  disabled
                  aria-label={copy.helpfulDone}
                  className="cursor-default p-1 text-green-500"
                >
                  <ThumbsUp className="h-3 w-3 fill-green-500" />
                </button>
              ) : feedbackGiven === "down" ? (
                <button
                  type="button"
                  disabled
                  aria-label={copy.unhelpfulDone}
                  className="cursor-default p-1 text-red-500"
                >
                  <ThumbsDown className="h-3 w-3 fill-red-500" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleFeedback(true)}
                    className="p-1 text-gray-400 transition-colors hover:text-green-500"
                    title={copy.helpful}
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFeedback(false)}
                    className="p-1 text-gray-400 transition-colors hover:text-red-500"
                    title={copy.unhelpful}
                  >
                    <ThumbsDown className="h-3 w-3" />
                  </button>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
