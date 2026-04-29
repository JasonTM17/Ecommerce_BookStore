"use client";

import {
  History,
  Maximize2,
  MessageCircle,
  Minimize2,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  onClose: () => void;
  onMinimize: () => void;
  onShowConversations?: () => void;
  onNewChat?: () => void;
  isMinimized: boolean;
  statusLabel: string;
  statusClassName?: string;
  subtitle: string;
  canManageConversations?: boolean;
}

export function ChatHeader({
  onClose,
  onMinimize,
  onShowConversations,
  onNewChat,
  isMinimized,
  statusLabel,
  statusClassName,
  subtitle,
  canManageConversations = false,
}: ChatHeaderProps) {
  const { locale } = useLanguage();

  const copy =
    locale === "vi"
      ? {
          assistant: "BookStore Assistant",
          newChat: "Tạo cuộc trò chuyện mới",
          history: "Lịch sử hội thoại",
          maximize: "Phóng to",
          minimize: "Thu nhỏ",
          close: "Đóng",
        }
      : {
          assistant: "BookStore Assistant",
          newChat: "Start a new chat",
          history: "Conversation history",
          maximize: "Expand",
          minimize: "Minimize",
          close: "Close",
        };

  return (
    <div className="border-b border-black/[0.06] bg-white px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex items-start gap-2.5">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f4f1ee]">
            <MessageCircle className="h-4 w-4 text-black" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-black">
              {copy.assistant}
            </h2>
            <p className="mt-0.5 max-w-[190px] truncate text-[11px] leading-4 text-[#777169] sm:max-w-[215px]">
              {subtitle}
            </p>
            <div
              className={cn(
                "mt-1.5 inline-flex max-w-[190px] items-center gap-1.5 rounded-full border border-black/[0.06] bg-[#f4f1ee] px-2 py-0.5 text-[10px] font-medium text-black sm:max-w-[215px]",
                statusClassName,
              )}
              data-testid="chatbot-status-badge"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current/80" />
              <span className="truncate">{statusLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          {canManageConversations && onNewChat ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onNewChat}
              className="h-7 w-7 rounded-full text-[#777169] hover:bg-[#f5f2ef] hover:text-black"
              title={copy.newChat}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          ) : null}

          {canManageConversations && onShowConversations ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onShowConversations}
              className="h-7 w-7 rounded-full text-[#777169] hover:bg-[#f5f2ef] hover:text-black"
              title={copy.history}
            >
              <History className="h-3.5 w-3.5" />
            </Button>
          ) : null}

          <Button
            variant="ghost"
            size="icon"
            onClick={onMinimize}
            className="h-7 w-7 rounded-full text-[#777169] hover:bg-[#f5f2ef] hover:text-black"
            title={isMinimized ? copy.maximize : copy.minimize}
          >
            {isMinimized ? (
              <Maximize2 className="h-3.5 w-3.5" />
            ) : (
              <Minimize2 className="h-3.5 w-3.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 rounded-full text-[#777169] hover:bg-[#f5f2ef] hover:text-black"
            title={copy.close}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
