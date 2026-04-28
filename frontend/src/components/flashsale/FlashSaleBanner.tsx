"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgePercent, ChevronRight, Clock, Flame } from "lucide-react";
import Link from "next/link";
import { ProductImage } from "@/components/ui/ProductImage";
import { useLanguage } from "@/components/providers/language-provider";
import { flashSaleApi, FlashSale } from "@/lib/flashsale";
import { resolveProductFallbackImage } from "@/lib/product-images";
import { publicWarmupQueryOptions } from "@/lib/public-query-options";

const SALE_SLOTS = ["08:00", "10:00", "12:00", "16:00", "20:00"];

const COPY = {
  vi: {
    aria: "Flash sale cu\u1ed1i trang",
    kicker: "Sale s\u1ed1c h\u00f4m nay",
    title: "Flash Sale 5 khung gi\u1edd",
    slotLabel: "Khung gi\u1edd",
    endsIn: "K\u1ebft th\u00fac sau",
    cta: "Xem deal",
    mobileCta: "Xem ngay",
  },
  en: {
    aria: "Footer flash sale",
    kicker: "Today's hot deals",
    title: "Five-slot Flash Sale",
    slotLabel: "Time slots",
    endsIn: "Ends in",
    cta: "View deals",
    mobileCta: "View now",
  },
} as const;

export function FlashSaleBanner() {
  const { locale } = useLanguage();
  const copy = COPY[locale];
  const { data: flashSales = [], isLoading } = useQuery({
    ...publicWarmupQueryOptions,
    queryKey: ["flash-sales-active"],
    queryFn: flashSaleApi.getActiveFlashSales,
    refetchInterval: 60000,
  });

  if (isLoading || flashSales.length === 0) {
    return null;
  }

  const featuredSale = flashSales[0];

  return (
    <section
      aria-label={copy.aria}
      data-testid="footer-flash-sale-banner"
      className="border-t border-[#d8e8ff] bg-gradient-to-b from-white to-[#f4f8ff] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-4">
        <div className="grid min-w-0 gap-3 rounded-[24px] border border-[#d8e8ff] bg-white/95 p-3 shadow-[rgba(11,116,229,0.12)_0_-8px_32px] backdrop-blur md:grid-cols-[minmax(220px,0.72fr)_minmax(0,1.45fr)_auto] md:items-center">
          <Link
            href="/flash-sale"
            className="flex min-w-0 items-center gap-3 rounded-2xl bg-gradient-to-r from-[#f0f8ff] to-[#fff6eb] p-2.5 text-gray-950 transition-colors hover:from-[#e8f5ff] hover:to-[#fff1dd]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#ff424e] shadow-sm ring-1 ring-[#ffe1ca]">
              <Flame className="h-5 w-5 fill-[#ffdd57] text-[#ff424e]" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#ff6a00]">
                {copy.kicker}
              </span>
              <span className="block truncate text-sm font-bold text-gray-950">
                {copy.title}
              </span>
            </span>
          </Link>

          <div className="min-w-0">
            <div className="mb-2 flex min-w-0 flex-wrap items-center gap-2">
              <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#d8e8ff] bg-[#f4f9ff] px-3 py-1.5 text-xs font-semibold text-[#0b74e5]">
                <Clock className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{copy.slotLabel}</span>
                <span className="font-bold">{SALE_SLOTS.join(" - ")}</span>
              </div>
              <FlashSaleCountdownPill
                endTime={featuredSale.endTime}
                label={copy.endsIn}
              />
            </div>

            <div className="hidden min-w-0 gap-2 md:grid md:grid-cols-3">
              {flashSales.slice(0, 3).map((sale, index) => (
                <FlashSaleQuickView
                  key={sale.id}
                  sale={sale}
                  locale={locale}
                  imagePriority={index === 0}
                />
              ))}
            </div>

            <FlashSaleMobileDeal
              sale={featuredSale}
              locale={locale}
              ctaLabel={copy.mobileCta}
            />
          </div>

          <Link
            href="/flash-sale"
            className="hidden items-center justify-center gap-1.5 rounded-full bg-[#ff424e] px-5 py-2.5 text-sm font-bold text-white shadow-[rgba(255,66,78,0.24)_0_10px_20px] transition-colors hover:bg-[#e83843] md:inline-flex"
          >
            {copy.cta}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function FlashSaleCountdownPill({
  endTime,
  label,
}: {
  endTime: string;
  label: string;
}) {
  const timeLeft = useFlashSaleCountdown(endTime);

  return (
    <div className="flex min-w-0 items-center gap-1.5 rounded-full border border-[#ffe1ca] bg-[#fff8ed] px-3 py-1.5 text-xs font-semibold text-[#b45309]">
      <BadgePercent className="h-3.5 w-3.5 shrink-0" />
      <span className="hidden sm:inline">{label}</span>
      <span className="font-mono font-bold tabular-nums text-[#ff424e]">
        {formatCountdown(timeLeft)}
      </span>
    </div>
  );
}

function FlashSaleQuickView({
  sale,
  locale,
  imagePriority = false,
}: {
  sale: FlashSale;
  locale: "vi" | "en";
  imagePriority?: boolean;
}) {
  const soldPercent = getSoldPercent(sale);

  return (
    <Link
      href={`/products/${sale.product.id}?source=flash-sale&saleId=${sale.id}`}
      data-testid="flash-sale-banner-item"
      className="group flex min-w-0 items-center gap-2 rounded-2xl border border-[#e3efff] bg-[#fbfdff] px-2.5 py-2 text-gray-900 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#9ed2ff] hover:bg-white"
    >
      <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-[#e5eefb]">
        <ProductImage
          src={sale.product.imageUrl || undefined}
          fallbackSrc={resolveProductFallbackImage({
            id: sale.product.id,
            imageUrl: sale.product.imageUrl,
            images: [],
          })}
          alt={sale.product.name}
          fill
          sizes="40px"
          priority={imagePriority}
          className="object-contain p-1"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold transition-colors group-hover:text-[#0b74e5]">
          {sale.product.name}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-extrabold text-[#ff424e]">
            {formatPrice(sale.salePrice, locale)}
          </span>
          <span className="rounded-full bg-[#fff0d5] px-1.5 py-0.5 text-[10px] font-bold text-[#b45309]">
            -{sale.discountPercent}%
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#ffe6d8]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#ff424e] via-[#ff7a00] to-[#ffd43b]"
            style={{ width: `${soldPercent}%` }}
          />
        </div>
      </div>
    </Link>
  );
}

function FlashSaleMobileDeal({
  sale,
  locale,
  ctaLabel,
}: {
  sale: FlashSale;
  locale: "vi" | "en";
  ctaLabel: string;
}) {
  const timeLeft = useFlashSaleCountdown(sale.endTime);

  return (
    <Link
      href={`/products/${sale.product.id}?source=flash-sale&saleId=${sale.id}`}
      className="mt-2 grid min-w-0 grid-cols-[48px_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-[#e3efff] bg-[#fbfdff] p-2.5 pr-16 md:hidden"
    >
      <div className="relative h-16 w-12 overflow-hidden rounded-xl bg-white ring-1 ring-[#e5eefb]">
        <ProductImage
          src={sale.product.imageUrl || undefined}
          fallbackSrc={resolveProductFallbackImage({
            id: sale.product.id,
            imageUrl: sale.product.imageUrl,
            images: [],
          })}
          alt={sale.product.name}
          fill
          sizes="48px"
          priority
          className="object-contain p-1"
        />
      </div>

      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-gray-950">
          {sale.product.name}
        </span>
        <span className="mt-1 flex items-center gap-2">
          <span className="text-base font-extrabold text-[#ff424e]">
            {formatPrice(sale.salePrice, locale)}
          </span>
          <span className="rounded-full bg-[#fff0d5] px-1.5 py-0.5 text-[10px] font-bold text-[#b45309]">
            -{sale.discountPercent}%
          </span>
        </span>
        <span className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#0b74e5]">
            <Clock className="h-3 w-3" />
            {formatCountdown(timeLeft)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#ff424e] px-2.5 py-1 text-[11px] font-bold text-white">
            {ctaLabel}
            <ChevronRight className="h-3 w-3" />
          </span>
        </span>
      </span>
    </Link>
  );
}

function useFlashSaleCountdown(endTime: string) {
  const queryClient = useQueryClient();
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endTime));
  const expireNotifiedRef = useRef(false);

  useEffect(() => {
    expireNotifiedRef.current = false;
    setTimeLeft(calculateTimeLeft(endTime));

    const timer = window.setInterval(() => {
      const nextTimeLeft = calculateTimeLeft(endTime);
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
        window.clearInterval(timer);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [endTime, queryClient]);

  return timeLeft;
}

function getSoldPercent(sale: FlashSale) {
  const stockLimit = Math.max(sale.stockLimit, 1);
  return Math.min(100, Math.max(8, (sale.soldCount / stockLimit) * 100));
}

function formatCountdown(timeLeft: ReturnType<typeof calculateTimeLeft>) {
  return `${String(timeLeft.hours).padStart(2, "0")}:${String(
    timeLeft.minutes,
  ).padStart(2, "0")}:${String(timeLeft.seconds).padStart(2, "0")}`;
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

function formatPrice(price: number, locale: "vi" | "en") {
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(price);
}
