"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clock3, Flame, TimerReset } from "lucide-react";

type Locale = "vi" | "en";

type FlashSaleCountdownCardProps = {
  locale: Locale;
  endTime: string;
  remainingStock?: number;
  maxPerUser?: number;
  onExpire?: () => void;
};

const COPY = {
  vi: {
    headline: "Flash sale còn lại",
    note: "Sau khi hết thời gian này, giá sẽ trở về mức thông thường.",
    remainingStock: (count: number) => `Còn ${count} suất giá tốt trong đợt sale này`,
    limit: (count: number) => `Giới hạn ${count} cuốn mỗi khách`,
    expired: "Đang cập nhật lại giá sau khi flash sale kết thúc...",
    hours: "giờ",
  },
  en: {
    headline: "Flash sale ends in",
    note: "When this timer ends, the price will return to the standard amount.",
    remainingStock: (count: number) => `${count} discounted copies remain in this sale`,
    limit: (count: number) => `Limit ${count} copies per customer`,
    expired: "Refreshing pricing after the flash sale ended...",
    hours: "hrs",
  },
} as const;

function getRemainingMs(endTime: string) {
  const target = new Date(endTime).getTime();
  if (Number.isNaN(target)) {
    return 0;
  }
  return Math.max(target - Date.now(), 0);
}

function formatRemainingTime(remainingMs: number) {
  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

export function FlashSaleCountdownCard({
  locale,
  endTime,
  remainingStock,
  maxPerUser,
  onExpire,
}: FlashSaleCountdownCardProps) {
  const copy = COPY[locale];
  const [remainingMs, setRemainingMs] = useState(() => getRemainingMs(endTime));
  const expireNotifiedRef = useRef(false);

  useEffect(() => {
    expireNotifiedRef.current = false;
    setRemainingMs(getRemainingMs(endTime));

    const interval = window.setInterval(() => {
      const nextRemaining = getRemainingMs(endTime);
      setRemainingMs(nextRemaining);

      if (nextRemaining === 0 && !expireNotifiedRef.current) {
        expireNotifiedRef.current = true;
        onExpire?.();
        window.clearInterval(interval);
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [endTime, onExpire]);

  const timer = useMemo(() => formatRemainingTime(remainingMs), [remainingMs]);

  return (
    <div
      data-testid="flash-sale-countdown-card"
      className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-red-600">
            <Flame className="h-4 w-4" />
            <span>{copy.headline}</span>
          </div>
          <p className="text-sm text-gray-600">{copy.note}</p>
        </div>
        <div className="rounded-xl bg-white/80 px-4 py-3 text-center shadow-inner">
          <div className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
            <Clock3 className="h-4 w-4" />
            <span>{copy.hours}</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-gray-900" data-testid="flash-sale-countdown-value">
            {timer.hours}:{timer.minutes}:{timer.seconds}
          </p>
        </div>
      </div>

      {(remainingStock !== undefined || maxPerUser !== undefined) && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-gray-700">
          {remainingStock !== undefined ? (
            <span className="rounded-full bg-white/80 px-3 py-1">{copy.remainingStock(remainingStock)}</span>
          ) : null}
          {maxPerUser !== undefined ? (
            <span className="rounded-full bg-white/80 px-3 py-1">{copy.limit(maxPerUser)}</span>
          ) : null}
        </div>
      )}

      {remainingMs === 0 ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-amber-700">
          <TimerReset className="h-4 w-4" />
          <span>{copy.expired}</span>
        </p>
      ) : null}
    </div>
  );
}
