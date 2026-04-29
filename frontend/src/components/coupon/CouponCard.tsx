"use client";

import { useQuery } from "@tanstack/react-query";
import { couponApi, Coupon } from "@/lib/coupon";
import { Tag, Percent, Minus, Truck, Copy, Check, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";
import { useState } from "react";

const COPY = {
  vi: {
    empty: "Hiện không có coupon khả dụng",
    freeShipping: "Miễn phí vận chuyển",
    percentOff: (value: number) => `Giảm ${formatPercent(value)}`,
    amountOff: (value: number) => `Giảm ${formatMoney(value, "vi")}`,
    minOrder: (value: number) => `Đơn tối thiểu ${formatMoney(value, "vi")}`,
    expires: (value: string) => `HSD: ${formatDate(value, "vi")}`,
    remaining: (value: number) => `Còn lại: ${value} lượt`,
    copy: "Sao chép mã",
    copied: "Đã sao chép",
  },
  en: {
    empty: "No coupons are available right now",
    freeShipping: "Free shipping",
    percentOff: (value: number) => `${formatPercent(value)} off`,
    amountOff: (value: number) => `${formatMoney(value, "en")} off`,
    minOrder: (value: number) => `Minimum order ${formatMoney(value, "en")}`,
    expires: (value: string) => `Expires: ${formatDate(value, "en")}`,
    remaining: (value: number) => `${value} uses left`,
    copy: "Copy code",
    copied: "Copied",
  },
} as const;

const EN_COUPON_DESCRIPTIONS: Record<string, string> = {
  BOOKLOVER50K: "Get 50,000 VND off orders from 399,000 VND",
  FREESHIP: "Free shipping for orders from 120,000 VND",
  SPRING25: "Save 25% on featured titles, up to 80,000 VND",
  WELCOME10: "Save 10% on your first order from 150,000 VND",
};

interface AvailableCouponsProps {
  onSelect?: (coupon: Coupon) => void;
  className?: string;
}

export function AvailableCoupons({
  onSelect,
  className,
}: AvailableCouponsProps) {
  const { locale } = useLanguage();
  const copy = COPY[locale];
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["available-coupons"],
    queryFn: couponApi.getAvailableCoupons,
  });

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <Loader2 className="h-6 w-6 animate-spin text-red-600" />
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div className={cn("text-center py-8 text-gray-500", className)}>
        <Tag className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p>{copy.empty}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {coupons.map((coupon) => (
        <CouponCard key={coupon.id} coupon={coupon} onSelect={onSelect} />
      ))}
    </div>
  );
}

interface CouponCardProps {
  coupon: Coupon;
  onSelect?: (coupon: Coupon) => void;
  showDetails?: boolean;
}

export function CouponCard({
  coupon,
  onSelect,
  showDetails = true,
}: CouponCardProps) {
  const { locale } = useLanguage();
  const copy = COPY[locale];
  const [copied, setCopied] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PERCENTAGE":
        return <Percent className="h-5 w-5" />;
      case "FIXED_AMOUNT":
        return <Minus className="h-5 w-5" />;
      case "FREE_SHIPPING":
        return <Truck className="h-5 w-5" />;
      default:
        return <Tag className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "PERCENTAGE":
        return "bg-red-500";
      case "FIXED_AMOUNT":
        return "bg-red-500";
      case "FREE_SHIPPING":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getDiscountDisplay = () => {
    switch (coupon.type) {
      case "PERCENTAGE":
        return copy.percentOff(coupon.discountValue);
      case "FIXED_AMOUNT":
        return copy.amountOff(coupon.discountValue);
      case "FREE_SHIPPING":
        return copy.freeShipping;
      default:
        return coupon.discountDisplay;
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      data-testid="coupon-card"
      onClick={onSelect ? () => onSelect(coupon) : undefined}
      className={cn(
        "relative bg-white border border-gray-200 rounded-xl p-4 transition-all",
        onSelect
          ? "cursor-pointer hover:border-red-300 hover:shadow-md"
          : "cursor-default",
        onSelect && "pr-12",
      )}
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center text-white",
            getTypeColor(coupon.type),
          )}
        >
          {getTypeIcon(coupon.type)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-lg text-red-600">
              {coupon.code}
            </span>
            {copied && <Check className="h-4 w-4 text-green-500" />}
          </div>
          <p className="text-sm text-gray-600 mb-1">
            {locale === "en"
              ? EN_COUPON_DESCRIPTIONS[coupon.code] || coupon.description
              : coupon.description}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span>{getDiscountDisplay()}</span>
            {coupon.minOrderAmount > 0 && (
              <span>{copy.minOrder(coupon.minOrderAmount)}</span>
            )}
          </div>
          {showDetails && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                {copy.expires(coupon.endDate)}
              </span>
              <span className="text-xs text-gray-400">
                {copy.remaining(
                  Math.max(0, coupon.usageLimit - coupon.usedCount),
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label={copied ? copy.copied : copy.copy}
        title={copied ? copy.copied : copy.copy}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4 text-gray-400" />
        )}
      </button>
    </div>
  );
}

function formatMoney(value: number, locale: "vi" | "en") {
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    currency: "VND",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatDate(value: string, locale: "vi" | "en") {
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatPercent(value: number) {
  return `${Number(value.toFixed(2))}%`;
}
