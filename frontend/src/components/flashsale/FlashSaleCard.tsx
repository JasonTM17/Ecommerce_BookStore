"use client";

import { useState, useEffect, useRef } from "react";
import { Zap, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { flashSaleApi, FlashSale } from "@/lib/flashsale";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { ProductImage } from "@/components/ui/ProductImage";
import { resolveProductFallbackImage } from "@/lib/product-images";
import { useLanguage } from "@/components/providers/language-provider";
import { publicWarmupQueryOptions } from "@/lib/public-query-options";

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
    ...publicWarmupQueryOptions,
    queryKey: ["flash-sales-active"],
    queryFn: flashSaleApi.getActiveFlashSales,
    refetchInterval: 60000,
  });

  if (activeSales.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#f6f6f6] py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="eleven-pill-black flex h-12 w-12 items-center justify-center">
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
          {activeSales.slice(0, 8).map((sale, index) => (
            <FlashSaleCard
              key={sale.id}
              sale={sale}
              imagePriority={index < 2}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function FlashSaleCard({
  sale,
  imagePriority = false,
}: {
  sale: FlashSale;
  imagePriority?: boolean;
}) {
  const queryClient = useQueryClient();
  const { locale } = useLanguage();
  const copy = COPY[locale];
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(sale.endTime));
  const [mounted, setMounted] = useState(false);
  const expireNotifiedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    expireNotifiedRef.current = false;
    setTimeLeft(calculateTimeLeft(sale.endTime));

    const timer = setInterval(() => {
      const nextTimeLeft = calculateTimeLeft(sale.endTime);
      setTimeLeft(nextTimeLeft);

      if (
        nextTimeLeft.hours === 0 &&
        nextTimeLeft.minutes === 0 &&
        nextTimeLeft.seconds === 0 &&
        !expireNotifiedRef.current
      ) {
        expireNotifiedRef.current = true;
        void queryClient.invalidateQueries({
          queryKey: ["flash-sales-active"],
        });
        void queryClient.invalidateQueries({
          queryKey: ["flash-sale-page", "active"],
        });
        void queryClient.invalidateQueries({
          queryKey: ["flash-sale-page", "upcoming"],
        });
        window.clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [queryClient, sale.endTime]);

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
        "eleven-surface group overflow-hidden rounded-[26px] bg-white",
        "transition-transform duration-300 hover:-translate-y-1",
      )}
    >
      <div className="relative aspect-[3/4] bg-[#f5f2ef]">
        <ProductImage
          src={sale.product.imageUrl || undefined}
          fallbackSrc={resolveProductFallbackImage({
            id: sale.product.id,
            imageUrl: sale.product.imageUrl,
            images: [],
          })}
          alt={sale.product.name}
          fill
          sizes="(min-width: 1280px) 18vw, (min-width: 640px) 35vw, 90vw"
          priority={imagePriority}
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
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
                width: `${Math.min(100, (sale.soldCount / Math.max(sale.stockLimit, 1)) * 100)}%`,
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
