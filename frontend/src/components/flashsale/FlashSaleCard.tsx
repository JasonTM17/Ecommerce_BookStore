"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Flame, ShoppingCart, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/ProductImage";
import { flashSaleApi, FlashSale } from "@/lib/flashsale";
import {
  resolveProductFallbackImage,
  resolveProductImageSource,
} from "@/lib/product-images";
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
    <section className="bg-[#fffdf7] py-12">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="overflow-hidden rounded-[28px] border border-[#eadfce] bg-white shadow-[rgba(130,72,20,0.09)_0_18px_42px]">
          <div className="flex flex-col gap-5 bg-gradient-to-r from-[#1f1a17] via-[#4a1712] to-[#991b1b] px-5 py-5 text-white md:flex-row md:items-center md:justify-between md:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#b42318] shadow-sm">
                <Flame className="h-6 w-6 fill-[#ffdd57]" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#fed7aa]">
                  Flash Sale
                </p>
                <h2 className="text-2xl font-bold tracking-normal text-white md:text-3xl">
                  {copy.sectionTitle}
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-[#ffe7d6]">
                  {copy.sectionSubtitle}
                </p>
              </div>
            </div>
            <Link href="/flash-sale">
              <Button className="w-full rounded-full bg-white px-5 font-semibold text-[#7c2d12] hover:bg-[#fff8ed] md:w-auto">
                {copy.sectionAction}
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 bg-[#fff8ed] p-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))] lg:p-5">
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
        "group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#eadfce] bg-white shadow-sm",
        "transition-all duration-300 hover:-translate-y-1 hover:border-[#ef9a6b] hover:shadow-[rgba(180,35,24,0.14)_0_18px_32px]",
        className,
      )}
    >
      <div className="relative aspect-[3/4] bg-gradient-to-b from-[#fff8ed] to-white">
        <ProductImage
          src={resolveProductImageSource({
            id: sale.product.id,
            imageUrl: sale.product.imageUrl,
            images: [],
          })}
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

        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[#b42318] px-2.5 py-1 text-xs font-bold text-white shadow-sm">
          <Zap className="h-3.5 w-3.5 fill-[#ffdd57] text-[#ffdd57]" />
          <span>-{sale.discountPercent}%</span>
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#7c2d12] shadow-sm ring-1 ring-[#eadfce]">
          {copy.dealBadge}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-[44px] text-sm font-semibold leading-5 text-gray-900 transition-colors group-hover:text-[#b42318]">
          {sale.product.name}
        </h3>
        <p className="mt-1 truncate text-sm text-gray-500">
          {sale.product.author}
        </p>

        <div className="mt-3 flex flex-wrap items-end gap-x-2 gap-y-1">
          <span className="text-xl font-bold leading-none text-[#b42318]">
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
              className="relative h-full rounded-full bg-gradient-to-r from-[#b42318] via-[#f97316] to-[#fbbf24]"
              style={{ width: `${soldPercent}%` }}
            >
              <span className="absolute right-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/90" />
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-[#fff7ed] px-3 py-2 text-xs ring-1 ring-[#f3d8c0]">
          <div className="flex min-w-0 items-center gap-1.5 text-[#9a3412]">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate font-medium">{copy.timeLeft}</span>
          </div>
          <span className="shrink-0 font-mono font-bold tabular-nums text-[#b42318]">
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

        <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#b42318] px-3 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-[#8f1d16]">
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
