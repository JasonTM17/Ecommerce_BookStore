"use client";

import { useQuery } from "@tanstack/react-query";
import { flashSaleApi, FlashSale } from "@/lib/flashsale";
import { Loader2, Zap, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export function FlashSaleBanner() {
  const { data: flashSales = [], isLoading } = useQuery({
    queryKey: ["flash-sales-active"],
    queryFn: flashSaleApi.getActiveFlashSales,
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-red-500 to-orange-500 py-3">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-white" />
        </div>
      </div>
    );
  }

  if (flashSales.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-red-500 to-orange-500 py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 text-white shrink-0">
            <Zap className="h-5 w-5 fill-yellow-400 text-yellow-300" />
            <span className="font-bold tracking-wide">FLASH SALE</span>
          </div>
          <div className="flex gap-4 overflow-x-auto">
            {flashSales.slice(0, 5).map((sale) => (
              <FlashSaleQuickView key={sale.id} sale={sale} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FlashSaleQuickView({ sale }: { sale: FlashSale }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(sale.endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(sale.endTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [sale.endTime]);

  return (
    <Link
      href={`/products/${sale.product.id}`}
      className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 shrink-0 transition-colors"
    >
      <div className="w-10 h-14 bg-white rounded overflow-hidden relative">
        {sale.product.imageUrl && (
          <Image
            src={sale.product.imageUrl}
            alt={sale.product.name}
            fill
            className="object-cover"
          />
        )}
      </div>
      <div>
        <p className="text-white text-sm font-medium line-clamp-1">
          {sale.product.name}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-yellow-300 font-bold">
            {formatPrice(sale.salePrice)}
          </span>
          <span className="text-white/70 line-through text-xs">
            {formatPrice(sale.originalPrice)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-white/80 mt-1">
          <Clock className="h-3 w-3" />
          <span className="font-mono tabular-nums">
            {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
          </span>
        </div>
      </div>
    </Link>
  );
}

function calculateTimeLeft(endTime: string) {
  const end = new Date(endTime).getTime();
  const now = new Date().getTime();
  const diff = Math.max(0, end - now);

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(price);
}
