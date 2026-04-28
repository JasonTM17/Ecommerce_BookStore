"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Clock, Flame } from "lucide-react";
import Link from "next/link";
import { ProductImage } from "@/components/ui/ProductImage";
import { flashSaleApi, FlashSale } from "@/lib/flashsale";
import { resolveProductFallbackImage } from "@/lib/product-images";
import { publicWarmupQueryOptions } from "@/lib/public-query-options";

const SALE_SLOTS = ["08:00", "10:00", "12:00", "16:00", "20:00"];

export function FlashSaleBanner() {
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
    <div className="overflow-hidden border-y border-[#d8e8ff] bg-[#0b74e5]">
      <div className="mx-auto w-full max-w-7xl px-4 py-3">
        <div className="grid min-w-0 gap-3 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
          <Link
            href="/flash-sale"
            className="flex min-w-0 items-center gap-3 text-white"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#ff424e] shadow-sm">
              <Flame className="h-5 w-5 fill-[#ffdd57]" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#cde7ff]">
                Sale sốc hôm nay
              </span>
              <span className="block truncate text-sm font-bold text-white">
                Flash Sale 5 khung giờ
              </span>
            </span>
          </Link>

          <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="flex min-w-0 items-center gap-2 overflow-hidden">
              <div className="flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white">
                <Clock className="h-3.5 w-3.5" />
                {SALE_SLOTS.join(" - ")}
              </div>
              <div className="hidden min-w-0 flex-1 gap-2 overflow-hidden md:flex">
                {flashSales.slice(0, 3).map((sale, index) => (
                  <FlashSaleQuickView
                    key={sale.id}
                    sale={sale}
                    imagePriority={index === 0}
                  />
                ))}
              </div>
            </div>

            <FlashSaleMobileDeal sale={featuredSale} />
          </div>

          <Link
            href="/flash-sale"
            className="hidden items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0b74e5] transition-colors hover:bg-[#eef7ff] md:inline-flex"
          >
            Xem ngay
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function FlashSaleQuickView({
  sale,
  imagePriority = false,
}: {
  sale: FlashSale;
  imagePriority?: boolean;
}) {
  return (
    <Link
      href={`/products/${sale.product.id}?source=flash-sale&saleId=${sale.id}`}
      data-testid="flash-sale-banner-item"
      className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-white px-2.5 py-2 text-gray-900 shadow-sm transition-transform hover:-translate-y-0.5"
    >
      <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-lg bg-[#f4f7ff]">
        <ProductImage
          src={sale.product.imageUrl || undefined}
          fallbackSrc={resolveProductFallbackImage({
            id: sale.product.id,
            imageUrl: sale.product.imageUrl,
            images: [],
          })}
          alt={sale.product.name}
          fill
          sizes="36px"
          priority={imagePriority}
          className="object-contain p-1"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold">{sale.product.name}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-bold text-[#ff424e]">
            {formatPrice(sale.salePrice)}
          </span>
          <span className="rounded-full bg-[#fff0d5] px-1.5 py-0.5 text-[10px] font-bold text-[#b45309]">
            -{sale.discountPercent}%
          </span>
        </div>
      </div>
    </Link>
  );
}

function FlashSaleMobileDeal({ sale }: { sale: FlashSale }) {
  const queryClient = useQueryClient();
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(sale.endTime));
  const expireNotifiedRef = useRef(false);

  useEffect(() => {
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
        window.clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [queryClient, sale.endTime]);

  return (
    <Link
      href={`/products/${sale.product.id}?source=flash-sale&saleId=${sale.id}`}
      className="flex min-w-0 items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2 md:hidden"
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-gray-900">
          {sale.product.name}
        </span>
        <span className="mt-0.5 block text-sm font-bold text-[#ff424e]">
          {formatPrice(sale.salePrice)}
        </span>
      </span>
      <span className="shrink-0 rounded-full bg-[#fff0d5] px-2.5 py-1 font-mono text-xs font-bold text-[#b45309]">
        {String(timeLeft.hours).padStart(2, "0")}:
        {String(timeLeft.minutes).padStart(2, "0")}:
        {String(timeLeft.seconds).padStart(2, "0")}
      </span>
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
