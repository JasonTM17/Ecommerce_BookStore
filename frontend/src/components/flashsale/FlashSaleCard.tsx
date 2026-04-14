"use client";

import { useState, useEffect } from "react";
import { Zap, Clock } from "lucide-react";
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
    retry: false,
    queryFn: flashSaleApi.getActiveFlashSales,
  });

  if (activeSales.length === 0) {
    return null;
  }

  return (
    <section className="bg-gradient-to-b from-red-50 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/30">
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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
        "overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm",
        "group transition-all duration-300 hover:border-red-200 hover:shadow-xl"
      )}
    >
      <div className="relative aspect-[3/4] bg-gray-100">
        <ProductImage
          src={sale.product.imageUrl || undefined}
          fallbackSrc={getCategoryPlaceholderImage()}
          alt={sale.product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          <div className="flex items-center gap-1 rounded-md bg-red-500 px-2 py-1 text-xs font-bold text-white">
            <Zap className="h-3 w-3" />-{sale.discountPercent}%
          </div>
          <div className="rounded-md bg-white/95 px-2 py-1 text-[11px] font-semibold text-red-600 shadow-sm">
            {copy.dealBadge}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <div className="mb-1 flex items-center justify-between text-xs text-white">
            <span>
              {copy.sold} {sale.soldCount}
            </span>
            <span>
              {copy.remaining} {sale.remainingStock}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/30">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all"
              style={{
                width: `${Math.min(100, (sale.soldCount / sale.stockLimit) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="mb-1 line-clamp-2 font-semibold text-gray-900 transition-colors group-hover:text-red-600">
          {sale.product.name}
        </h3>
        <p className="mb-2 text-sm text-gray-500">{sale.product.author}</p>

        <div className="mb-3 flex items-center gap-2">
          <span className="text-lg font-bold text-red-600">
            {formatPrice(sale.salePrice)}
          </span>
          <span className="text-sm text-gray-400 line-through">
            {formatPrice(sale.originalPrice)}
          </span>
        </div>

        <div className="flex items-center justify-center gap-1 rounded-lg bg-red-50 p-2">
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
