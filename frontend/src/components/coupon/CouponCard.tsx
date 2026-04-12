"use client";

import { useQuery } from "@tanstack/react-query";
import { couponApi, Coupon } from "@/lib/coupon";
import { Tag, Percent, Minus, Truck, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface AvailableCouponsProps {
  onSelect?: (coupon: Coupon) => void;
  className?: string;
}

export function AvailableCoupons({ onSelect, className }: AvailableCouponsProps) {
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["available-coupons"],
    queryFn: couponApi.getAvailableCoupons,
  });

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div className={cn("text-center py-8 text-gray-500", className)}>
        <Tag className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p>Hiện không có coupon khả dụng</p>
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

export function CouponCard({ coupon, onSelect, showDetails = true }: CouponCardProps) {
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
        return "bg-blue-500";
      case "FREE_SHIPPING":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onSelect ? () => onSelect(coupon) : undefined}
      className={cn(
        "relative bg-white border border-gray-200 rounded-xl p-4 transition-all",
        onSelect ? "cursor-pointer hover:border-blue-300 hover:shadow-md" : "cursor-default",
        onSelect && "pr-12"
      )}
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white", getTypeColor(coupon.type))}>
          {getTypeIcon(coupon.type)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-lg text-blue-600">{coupon.code}</span>
            {copied && <Check className="h-4 w-4 text-green-500" />}
          </div>
          <p className="text-sm text-gray-600 mb-1">{coupon.description}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span>{coupon.discountDisplay}</span>
            {coupon.minOrderAmount > 0 && (
              <span>Đơn tối thiểu {coupon.minOrderAmount.toLocaleString("vi-VN")}đ</span>
            )}
          </div>
          {showDetails && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                HSD: {getExpiryDate(coupon.endDate)}
              </span>
              <span className="text-xs text-gray-400">
                Còn lại: {coupon.usageLimit - coupon.usedCount} lượt
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Sao chép mã"
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
