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
    <div className="border-b border-black/[0.05] bg-white px-4 py-3 shadow-[rgba(0,0,0,0.04)_0px_1px_2px]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(245,242,239,0.8)] shadow-[rgba(78,50,23,0.04)_0px_6px_16px]">
            <MessageCircle className="h-5 w-5 text-black" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-black">
              {copy.assistant}
            </h2>
            <p className="mt-0.5 text-xs leading-5 text-[#777169]">
              {subtitle}
            </p>
            <div
              className={cn(
                "mt-2 inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-[rgba(245,242,239,0.8)] px-2.5 py-1 text-[11px] font-medium text-black",
                statusClassName,
              )}
              data-testid="chatbot-status-badge"
            >
              <span className="h-2 w-2 rounded-full bg-current/80" />
              <span>{statusLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {canManageConversations && onNewChat ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onNewChat}
              className="h-8 w-8 rounded-full text-[#777169] transition-colors hover:bg-[#f5f2ef] hover:text-black"
              title={copy.newChat}
            >
              <Plus className="h-4 w-4" />
            </Button>
          ) : null}

          {canManageConversations && onShowConversations ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onShowConversations}
              className="h-8 w-8 rounded-full text-[#777169] transition-colors hover:bg-[#f5f2ef] hover:text-black"
              title={copy.history}
            >
              <History className="h-4 w-4" />
            </Button>
          ) : null}

          <Button
            variant="ghost"
            size="icon"
            onClick={onMinimize}
            className="h-8 w-8 rounded-full text-[#777169] transition-colors hover:bg-[#f5f2ef] hover:text-black"
            title={isMinimized ? copy.maximize : copy.minimize}
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-[#777169] transition-colors hover:bg-[#f5f2ef] hover:text-black"
            title={copy.close}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
