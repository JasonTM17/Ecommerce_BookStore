"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clock3, Flame, TimerReset } from "lucide-react";

type Locale = "vi" | "en";

type FlashSaleCountdownCardProps = {
  locale: Locale;
  endTime: string;
  remainingStock?: number;
  maxPerUser?: number;
  stockLimit?: number;
  soldCount?: number;
  onExpire?: () => void;
};

const COPY = {
  vi: {
    badge: "Flash sale đang diễn ra",
    headline: "Giá ưu đãi chỉ còn trong",
    note: "Sau khi hết thời gian này, giá sẽ trở về mức thông thường.",
    remainingStock: (count: number) =>
      `Còn ${count} suất giá tốt trong đợt sale này`,
    limit: (count: number) => `Giới hạn ${count} cuốn mỗi khách`,
    sold: (count: number) => `Đã bán ${count}`,
    stockTotal: (count: number) => `Tổng ${count} suất`,
    progress: "Tiến độ flash sale",
    expired: "Đang cập nhật lại giá sau khi flash sale kết thúc...",
    timerLabel: "Kết thúc sau",
    hours: "Giờ",
    minutes: "Phút",
    seconds: "Giây",
  },
  en: {
    badge: "Flash sale is live",
    headline: "Special price ends in",
    note: "When this timer ends, the price will return to the standard amount.",
    remainingStock: (count: number) =>
      `${count} discounted copies remain in this sale`,
    limit: (count: number) => `Limit ${count} copies per customer`,
    sold: (count: number) => `${count} sold`,
    stockTotal: (count: number) => `${count} total slots`,
    progress: "Flash sale progress",
    expired: "Refreshing pricing after the flash sale ended...",
    timerLabel: "Ends in",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
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
  stockLimit,
  soldCount,
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
  const totalSlots =
    stockLimit !== undefined
      ? stockLimit
      : remainingStock !== undefined && soldCount !== undefined
        ? remainingStock + soldCount
        : undefined;
  const progressPercent =
    totalSlots !== undefined && soldCount !== undefined && totalSlots > 0
      ? Math.min(100, Math.max(0, Math.round((soldCount / totalSlots) * 100)))
      : undefined;

  return (
    <div
      data-testid="flash-sale-countdown-card"
      className="overflow-hidden rounded-3xl border border-red-200 bg-gradient-to-br from-red-600 via-orange-500 to-amber-400 p-[1px] shadow-xl shadow-red-500/15"
    >
      <div className="rounded-[calc(1.5rem-1px)] bg-white/95 p-5 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-red-600">
              <Flame className="h-4 w-4" />
              <span>{copy.badge}</span>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{copy.headline}</p>
              <p className="mt-1 max-w-xl text-sm text-gray-600">{copy.note}</p>
            </div>
          </div>

          <div className="min-w-[220px] rounded-2xl bg-gradient-to-br from-red-50 via-white to-orange-50 px-4 py-4 shadow-inner">
            <div className="mb-3 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              <Clock3 className="h-4 w-4" />
              <span>{copy.timerLabel}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                {
                  label: copy.hours,
                  value: timer.hours,
                  testId: "flash-sale-countdown-hours",
                },
                {
                  label: copy.minutes,
                  value: timer.minutes,
                  testId: "flash-sale-countdown-minutes",
                },
                {
                  label: copy.seconds,
                  value: timer.seconds,
                  testId: "flash-sale-countdown-seconds",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl bg-white px-2 py-3 shadow-sm"
                >
                  <p
                    className="text-2xl font-extrabold text-gray-900"
                    data-testid={item.testId}
                  >
                    {item.value}
                  </p>
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-gray-500">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {(remainingStock !== undefined ||
          maxPerUser !== undefined ||
          totalSlots !== undefined) && (
          <div className="mt-4 space-y-3">
            {progressPercent !== undefined ? (
              <div className="rounded-2xl border border-red-100 bg-red-50/60 p-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-red-600">
                  <span>{copy.progress}</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-500 via-orange-500 to-amber-400 transition-[width] duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium text-gray-700">
                  {soldCount !== undefined ? (
                    <span className="rounded-full bg-white px-3 py-1">
                      {copy.sold(soldCount)}
                    </span>
                  ) : null}
                  {totalSlots !== undefined ? (
                    <span className="rounded-full bg-white px-3 py-1">
                      {copy.stockTotal(totalSlots)}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2 text-xs font-medium text-gray-700">
              {remainingStock !== undefined ? (
                <span className="rounded-full bg-gray-100 px-3 py-1">
                  {copy.remainingStock(remainingStock)}
                </span>
              ) : null}
              {maxPerUser !== undefined ? (
                <span className="rounded-full bg-gray-100 px-3 py-1">
                  {copy.limit(maxPerUser)}
                </span>
              ) : null}
            </div>
          </div>
        )}

        {remainingMs === 0 ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-amber-700">
            <TimerReset className="h-4 w-4" />
            <span>{copy.expired}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
