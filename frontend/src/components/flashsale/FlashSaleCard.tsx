"use client";

import { useState, useEffect } from "react";
import { Zap, Clock, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { flashSaleApi, FlashSale } from "@/lib/flashsale";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { ProductImage } from "@/components/ui/ProductImage";
import { getCategoryPlaceholderImage } from "@/lib/product-images";
import { useLanguage } from "@/components/providers/language-provider";

const COPY = {
  vi: {
    sectionTitle: "Flash Sale",
    sectionSubtitle: "Giảm giá cực sốc trong thời gian có hạn",
    sectionAction: "Xem tất cả",
    sold: "Đã bán",
    remaining: "Còn",
    dealBadge: "Deal đang chạy",
  },
  en: {
    sectionTitle: "Flash Sale",
    sectionSubtitle: "Limited-time deals synced from the live store data",
    sectionAction: "View all",
    sold: "Sold",
    remaining: "Left",
    dealBadge: "Live deal",
  },
} as const;

function buildFlashSaleHref(productId: number, saleId: number) {
  return `/products/${productId}?source=flash-sale&saleId=${saleId}`;
}

export function FlashSaleSection() {
  const { locale } = useLanguage();
  const copy = COPY[locale];
  const { data: activeSales = [] } = useQuery({
    queryKey: ["flash-sales-active"],
    queryFn: flashSaleApi.getActiveFlashSales,
  });

  if (activeSales.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-b from-red-50 to-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {copy.sectionTitle}
              </h2>
              <p className="text-gray-500">{copy.sectionSubtitle}</p>
            </div>
          </div>
          <Link href="/flash-sale">
            <Button
              variant="outline"
              className="border-red-200 text-red-500 hover:bg-red-50"
            >
              {copy.sectionAction}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeSales.slice(0, 8).map((sale) => (
            <FlashSaleCard key={sale.id} sale={sale} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function FlashSaleCard({ sale }: { sale: FlashSale }) {
  const { locale } = useLanguage();
  const copy = COPY[locale];
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(sale.endTime));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(sale.endTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [sale.endTime]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <Link
      href={buildFlashSaleHref(sale.product.id, sale.id)}
      data-testid="flash-sale-card"
      className={cn(
        "bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden",
        "hover:shadow-xl hover:border-red-200 transition-all duration-300 group",
      )}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] bg-gray-100">
        <ProductImage
          src={sale.product.imageUrl || undefined}
          fallbackSrc={getCategoryPlaceholderImage()}
          alt={sale.product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Flash Sale Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <div className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-md flex items-center gap-1">
            <Zap className="h-3 w-3" />-{sale.discountPercent}%
          </div>
          <div className="px-2 py-1 bg-white/95 text-red-600 text-[11px] font-semibold rounded-md shadow-sm">
            {copy.dealBadge}
          </div>
        </div>

        {/* Stock Progress */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-center justify-between text-white text-xs mb-1">
            <span>
              {copy.sold} {sale.soldCount}
            </span>
            <span>
              {copy.remaining} {sale.remainingStock}
            </span>
          </div>
          <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all"
              style={{
                width: `${Math.min(100, (sale.soldCount / sale.stockLimit) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors mb-1">
          {sale.product.name}
        </h3>
        <p className="text-sm text-gray-500 mb-2">{sale.product.author}</p>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-red-600">
            {formatPrice(sale.salePrice)}
          </span>
          <span className="text-sm text-gray-400 line-through">
            {formatPrice(sale.originalPrice)}
          </span>
        </div>

        {/* Countdown */}
        <div className="flex items-center justify-center gap-1 p-2 bg-red-50 rounded-lg">
          <Clock className="h-4 w-4 text-red-500" />
          {mounted ? (
            <span className="text-sm font-semibold text-red-600">
              {String(timeLeft.hours).padStart(2, "0")}:
              {String(timeLeft.minutes).padStart(2, "0")}:
              {String(timeLeft.seconds).padStart(2, "0")}
            </span>
          ) : (
            <span className="text-sm text-red-600">--:--:--</span>
          )}
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
