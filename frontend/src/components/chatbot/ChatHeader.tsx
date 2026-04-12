"use client";

import { MessageCircle, X, Minimize2, Maximize2, Plus, History, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  onClose: () => void;
  onMinimize: () => void;
  onShowConversations: () => void;
  onNewChat: () => void;
  isMinimized: boolean;
}

export function ChatHeader({
  onClose,
  onMinimize,
  onShowConversations,
  onNewChat,
  isMinimized,
}: ChatHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <MessageCircle className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-white font-semibold text-sm">BookStore Assistant</h2>
          <p className="text-blue-100 text-xs flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Đang trực tuyến
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewChat}
          className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
          title="Tạo cuộc trò chuyện mới"
        >
          <Plus className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onShowConversations}
          className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
          title="Lịch sử hội thoại"
        >
          <History className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onMinimize}
          className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
          title={isMinimized ? "Phóng to" : "Thu nhỏ"}
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
          className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
          title="Đóng"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
