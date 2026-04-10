"use client";

import { useState } from "react";
import { Tag, Copy, Check, Loader2, Percent, Truck, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { couponApi, Coupon } from "@/lib/coupon";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface CouponInputProps {
  onApply?: (coupon: Coupon, discount: number) => void;
  orderTotal?: number;
  className?: string;
}

export function CouponInput({ onApply, orderTotal = 0, className }: CouponInputProps) {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [copied, setCopied] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mã coupon",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const coupon = await couponApi.validateCoupon(code.trim(), orderTotal);
      setAppliedCoupon(coupon);
      
      let discount = 0;
      if (coupon.type === "PERCENTAGE") {
        discount = (orderTotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else if (coupon.type === "FIXED_AMOUNT") {
        discount = coupon.discountValue;
      }
      
      onApply?.(coupon, discount);
      toast({
        title: "Thành công",
        description: `Áp dụng coupon ${coupon.code} thành công!`,
      });
    } catch (error: any) {
      toast({
        title: "Coupon không hợp lệ",
        description: error?.response?.data?.message || "Mã coupon không đúng hoặc đã hết hạn",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setAppliedCoupon(null);
    setCode("");
    onApply?.(null as any, 0);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(appliedCoupon?.code || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PERCENTAGE":
        return <Percent className="h-4 w-4" />;
      case "FIXED_AMOUNT":
        return <Minus className="h-4 w-4" />;
      case "FREE_SHIPPING":
        return <Truck className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  if (appliedCoupon) {
    return (
      <div className={cn("p-4 bg-green-50 border border-green-200 rounded-xl", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
              {getTypeIcon(appliedCoupon.type)}
            </div>
            <div>
              <p className="font-semibold text-green-700">{appliedCoupon.code}</p>
              <p className="text-sm text-green-600">{appliedCoupon.description}</p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Xóa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-2", className)}>
      <div className="flex-1 relative">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Nhập mã coupon"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="pl-10"
          disabled={loading}
        />
      </div>
      <Button
        onClick={handleApply}
        disabled={!code.trim() || loading}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Áp dụng"}
      </Button>
    </div>
  );
}
