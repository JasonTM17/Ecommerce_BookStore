"use client";

import { useQuery } from "@tanstack/react-query";
import { flashSaleApi, FlashSale } from "@/lib/flashsale";
import { Zap, Clock } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ProductImage } from "@/components/ui/ProductImage";
import { getCategoryPlaceholderImage } from "@/lib/product-images";

export function FlashSaleBanner() {
  const { data: flashSales = [], isLoading } = useQuery({
    queryKey: ["flash-sales-active"],
    queryFn: flashSaleApi.getActiveFlashSales,
    refetchInterval: 60000,
    retry: false,
  });

  if (isLoading || flashSales.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-red-500 to-orange-500 py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
          <div className="shrink-0 flex items-center gap-2 text-white">
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
      data-testid="flash-sale-banner-item"
      className="flex shrink-0 items-center gap-3 rounded-lg bg-white/10 px-3 py-2 transition-colors hover:bg-white/20"
    >
      <div className="relative h-14 w-10 overflow-hidden rounded bg-white">
        <ProductImage
          src={sale.product.imageUrl || undefined}
          fallbackSrc={getCategoryPlaceholderImage()}
          alt={sale.product.name}
          fill
          className="object-cover"
        />
      </div>
      <div>
        <p className="line-clamp-1 text-sm font-medium text-white">
          {sale.product.name}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-bold text-yellow-300">
            {formatPrice(sale.salePrice)}
          </span>
          <span className="text-xs text-white/70 line-through">
            {formatPrice(sale.originalPrice)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1 text-xs text-white/80">
          <Clock className="h-3 w-3" />
          <span className="font-mono tabular-nums">
            {String(timeLeft.hours).padStart(2, "0")}:
            {String(timeLeft.minutes).padStart(2, "0")}:
            {String(timeLeft.seconds).padStart(2, "0")}
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
