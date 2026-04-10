"use client";

import { useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface OfflineIndicatorProps {
  isOffline?: boolean;
}

export function OfflineIndicator({ isOffline: externalIsOffline }: OfflineIndicatorProps) {
  const [internalOffline, setInternalOffline] = useState(false);

  const isOffline = externalIsOffline !== undefined ? externalIsOffline : internalOffline;

  if (!isOffline) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full shadow-lg"
    >
      <WifiOff className="w-4 h-4" />
      <span className="text-sm font-medium">Không có kết nối mạng</span>
      <button
        onClick={() => setInternalOffline(!internalOffline)}
        className="ml-1 p-1 hover:bg-red-700 rounded-full transition-colors"
        aria-label="Thử kết nối lại"
      >
        <RefreshCw className="w-3 h-3" />
      </button>
    </div>
  );
}

interface ErrorToastProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorToast({ message, onDismiss }: ErrorToastProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "fixed top-4 right-4 z-[9999] flex items-center gap-3",
        "px-4 py-3 bg-red-600 text-white rounded-xl shadow-xl",
        "animate-in slide-in-from-top-2 fade-in"
      )}
    >
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onDismiss}
        className="p-1 hover:bg-red-700 rounded-lg transition-colors text-white/80"
        aria-label="Đóng thông báo lỗi"
      >
        ✕
      </button>
    </div>
  );
}
