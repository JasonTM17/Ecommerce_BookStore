"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Flame, ShoppingCart, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/ProductImage";
import { flashSaleApi, FlashSale } from "@/lib/flashsale";
import { resolveProductFallbackImage } from "@/lib/product-images";
import { publicWarmupQueryOptions } from "@/lib/public-query-options";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";

const COPY = {
  vi: {
    sectionTitle: "Sale sốc hôm nay",
    sectionSubtitle:
      "Deal sách chính hãng theo khung giờ, giá tốt và số lượng có hạn.",
    sectionAction: "Xem tất cả",
    sold: "Đã bán",
    remaining: "Còn",
    dealBadge: "Đang bán",
    buyNow: "Mua ngay",
    timeLeft: "Còn lại",
  },
  en: {
    sectionTitle: "Today’s hot deals",
    sectionSubtitle:
      "Time-boxed official bookstore deals with sharp prices and limited stock.",
    sectionAction: "View all",
    sold: "Sold",
    remaining: "Left",
    dealBadge: "Live deal",
    buyNow: "Buy now",
    timeLeft: "Ends in",
  },
} as const;

function buildFlashSaleHref(productId: number, saleId: number) {
  return `/products/${productId}?source=flash-sale&saleId=${saleId}`;
}

function getSoldPercent(sale: FlashSale) {
  const stockLimit = Math.max(sale.stockLimit, 1);
  return Math.min(100, Math.max(6, (sale.soldCount / stockLimit) * 100));
}

function formatPrice(price: number, locale: "vi" | "en") {
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(price);
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
    <section className="bg-[#f4f7ff] py-12">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="overflow-hidden rounded-[28px] border border-[#d8e8ff] bg-white shadow-[rgba(11,116,229,0.08)_0_18px_42px]">
          <div className="flex flex-col gap-5 bg-[#0b74e5] px-5 py-5 text-white md:flex-row md:items-center md:justify-between md:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#ff424e] shadow-sm">
                <Flame className="h-6 w-6 fill-[#ffdd57]" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#cde7ff]">
                  Flash Sale
                </p>
                <h2 className="text-2xl font-bold tracking-normal text-white md:text-3xl">
                  {copy.sectionTitle}
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-[#e8f5ff]">
                  {copy.sectionSubtitle}
                </p>
              </div>
            </div>
            <Link href="/flash-sale">
              <Button className="w-full rounded-full bg-white px-5 font-semibold text-[#0b74e5] hover:bg-[#eef7ff] md:w-auto">
                {copy.sectionAction}
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 bg-[#f7fbff] p-4 sm:grid-cols-2 lg:grid-cols-4 lg:p-5">
            {activeSales.slice(0, 8).map((sale, index) => (
              <FlashSaleCard
                key={sale.id}
                sale={sale}
                imagePriority={index < 2}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FlashSaleCard({
  sale,
  imagePriority = false,
  className,
}: {
  sale: FlashSale;
  imagePriority?: boolean;
  className?: string;
}) {
  const queryClient = useQueryClient();
  const { locale } = useLanguage();
  const copy = COPY[locale];
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(sale.endTime));
  const [mounted, setMounted] = useState(false);
  const expireNotifiedRef = useRef(false);
  const soldPercent = getSoldPercent(sale);

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

  return (
    <Link
      href={buildFlashSaleHref(sale.product.id, sale.id)}
      data-testid="flash-sale-card"
      className={cn(
        "group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#dbeaff] bg-white shadow-sm",
        "transition-all duration-300 hover:-translate-y-1 hover:border-[#9ed2ff] hover:shadow-[rgba(11,116,229,0.18)_0_18px_32px]",
        className,
      )}
    >
      <div className="relative aspect-[3/4] bg-gradient-to-b from-[#f4f9ff] to-white">
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

        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[#ff424e] px-2.5 py-1 text-xs font-bold text-white shadow-sm">
          <Zap className="h-3.5 w-3.5 fill-[#ffdd57] text-[#ffdd57]" />-
          {sale.discountPercent}%
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#0b74e5] shadow-sm">
          {copy.dealBadge}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-[44px] text-sm font-semibold leading-5 text-gray-900 transition-colors group-hover:text-[#0b74e5]">
          {sale.product.name}
        </h3>
        <p className="mt-1 truncate text-sm text-gray-500">
          {sale.product.author}
        </p>

        <div className="mt-3 flex flex-wrap items-end gap-x-2 gap-y-1">
          <span className="text-xl font-bold leading-none text-[#ff424e]">
            {formatPrice(sale.salePrice, locale)}
          </span>
          <span className="text-sm text-gray-400 line-through">
            {formatPrice(sale.originalPrice, locale)}
          </span>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {copy.sold} {sale.soldCount}
            </span>
            <span>
              {copy.remaining} {sale.remainingStock}
            </span>
          </div>
          <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-[#ffe6d8]">
            <div
              className="relative h-full rounded-full bg-gradient-to-r from-[#ff424e] via-[#ff7a00] to-[#ffd43b]"
              style={{ width: `${soldPercent}%` }}
            >
              <span className="absolute right-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/90" />
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-[#eef7ff] px-3 py-2 text-xs">
          <div className="flex min-w-0 items-center gap-1.5 text-[#0b74e5]">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate font-medium">{copy.timeLeft}</span>
          </div>
          <span className="shrink-0 font-mono font-bold tabular-nums text-[#ff424e]">
            {mounted
              ? `${String(timeLeft.hours).padStart(2, "0")}:${String(
                  timeLeft.minutes,
                ).padStart(
                  2,
                  "0",
                )}:${String(timeLeft.seconds).padStart(2, "0")}`
              : "--:--:--"}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#ff424e] px-3 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-[#e83843]">
          <ShoppingCart className="h-4 w-4" />
          {copy.buyNow}
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
