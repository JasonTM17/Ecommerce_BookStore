"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  Flame,
  PackageCheck,
  ShieldCheck,
  Truck,
  Zap,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FlashSaleCard } from "@/components/flashsale/FlashSaleCard";
import { ApiStatusCard } from "@/components/ui/api-status-card";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/ProductImage";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/components/providers/language-provider";
import { flashSaleApi, FlashSale } from "@/lib/flashsale";
import { resolveProductFallbackImage } from "@/lib/product-images";
import { publicWarmupQueryOptions } from "@/lib/public-query-options";

const SALE_SLOTS = ["08:00", "10:00", "12:00", "16:00", "20:00"];

const COPY = {
  vi: {
    heroKicker: "Giá sốc hôm nay",
    heroTitle: "Flash Sale 5 khung giờ",
    heroDescription:
      "Săn deal sách chính hãng theo phong cách Tiki: khung giờ rõ ràng, thanh bán chạy trực quan và giá tốt được đồng bộ từ API thật.",
    browseBooks: "Xem toàn bộ sách",
    browsePromotions: "Xem khuyến mãi",
    liveNow: "Đang bán",
    comingSoon: "Sắp mở",
    finished: "Đã qua",
    slotSubtitle: "Chọn khung giờ để theo dõi deal nổi bật trong ngày.",
    benefitOfficial: "Sách chính hãng",
    benefitOfficialDesc: "Ảnh bìa local và dữ liệu sản phẩm thật.",
    benefitShipping: "Giao hàng nhanh",
    benefitShippingDesc: "Luồng mua hàng giữ nguyên checkout hiện có.",
    benefitSecure: "Thanh toán an toàn",
    benefitSecureDesc: "Không thay đổi schema hay API backend.",
    benefitStock: "Số lượng có hạn",
    benefitStockDesc: "Thanh bán chạy phản ánh tồn kho flash sale.",
    activeHeading: "Deal đang cháy hàng",
    activeDescription:
      "Các sản phẩm đang mở bán, ưu tiên giá sốc và tiến độ bán rõ như sàn thương mại điện tử.",
    activeEmpty: "Hiện chưa có flash sale nào đang diễn ra.",
    upcomingHeading: "Lịch mở bán tiếp theo",
    upcomingDescription:
      "Theo dõi trước các chiến dịch sắp mở để chủ động săn deal khi bắt đầu.",
    startsAt: "Bắt đầu",
    discountLabel: "Giảm",
    estimatedPrice: "Giá dự kiến",
    stockLabel: "Số lượng",
    previewProduct: "Xem sản phẩm",
    upcomingEmpty: "Chưa có campaign sắp tới nào được lên lịch.",
    emptyTitle: "Hiện chưa có flash sale nào",
    emptyDescription:
      "Chưa có chiến dịch đang chạy hoặc sắp mở bán. Bạn vẫn có thể xem khuyến mãi hoặc khám phá catalog sách.",
    emptyCatalog: "Khám phá catalog",
    emptyCoupon: "Xem coupon công khai",
    errorTitle: "Flash sale đang tạm thời chưa tải được",
    errorDescription:
      "Backend có thể đang khởi động lại hoặc kết nối tạm thời gián đoạn. Vui lòng thử lại sau ít phút.",
    retry: "Tải lại flash sale",
    browseCatalog: "Xem danh sách sách",
    totalDeals: "deal đang hiển thị",
    bestDiscount: "giảm cao nhất",
    stockReady: "sản phẩm trong kho",
  },
  en: {
    heroKicker: "Today’s good deals",
    heroTitle: "Five-slot Flash Sale",
    heroDescription:
      "A Tiki-inspired sale surface for official books: clear time slots, visual selling bars, and live API-backed prices.",
    browseBooks: "Browse all books",
    browsePromotions: "View promotions",
    liveNow: "Live now",
    comingSoon: "Coming soon",
    finished: "Finished",
    slotSubtitle: "Pick a sale window and follow the day’s strongest deals.",
    benefitOfficial: "Official books",
    benefitOfficialDesc: "Local covers with real product data.",
    benefitShipping: "Fast delivery",
    benefitShippingDesc: "Checkout flow stays unchanged.",
    benefitSecure: "Secure payment",
    benefitSecureDesc: "No backend schema or API change.",
    benefitStock: "Limited stock",
    benefitStockDesc: "Selling bars reflect flash-sale inventory.",
    activeHeading: "Hot live deals",
    activeDescription:
      "Products currently on sale with sharp prices and marketplace-style selling progress.",
    activeEmpty: "There is no active flash sale right now.",
    upcomingHeading: "Next launch window",
    upcomingDescription:
      "Track upcoming campaigns so you can jump in when they go live.",
    startsAt: "Starts",
    discountLabel: "Discount",
    estimatedPrice: "Estimated price",
    stockLabel: "Stock",
    previewProduct: "Preview product",
    upcomingEmpty: "No upcoming campaign has been scheduled yet.",
    emptyTitle: "No flash sale is live right now",
    emptyDescription:
      "There is no active or upcoming flash-sale campaign at the moment. You can still browse promotions or explore the catalog.",
    emptyCatalog: "Browse catalog",
    emptyCoupon: "View public coupons",
    errorTitle: "Flash sale is temporarily unavailable",
    errorDescription:
      "The backend may still be starting up or the connection is temporarily interrupted. Please try again in a moment.",
    retry: "Reload flash sale",
    browseCatalog: "Browse books",
    totalDeals: "visible deals",
    bestDiscount: "best discount",
    stockReady: "items in stock",
  },
} as const;

function getCurrentSlotIndex() {
  const hour = new Date().getHours();
  if (hour < 10) return 0;
  if (hour < 12) return 1;
  if (hour < 16) return 2;
  if (hour < 20) return 3;
  return 4;
}

function formatDate(value: string, locale: "vi" | "en") {
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMoney(value: number, locale: "vi" | "en") {
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(value);
}

function getSlotStatus(index: number, activeSlotIndex: number) {
  if (index < activeSlotIndex) return "finished";
  if (index === activeSlotIndex) return "live";
  return "upcoming";
}

export default function FlashSalePage() {
  const { locale } = useLanguage();
  const copy = COPY[locale];
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  const {
    data: activeSales = [],
    isLoading: activeLoading,
    isError: activeError,
    refetch: refetchActiveSales,
  } = useQuery({
    ...publicWarmupQueryOptions,
    queryKey: ["flash-sale-page", "active"],
    queryFn: flashSaleApi.getActiveFlashSales,
  });

  const {
    data: upcomingSales = [],
    isLoading: upcomingLoading,
    isError: upcomingError,
    refetch: refetchUpcomingSales,
  } = useQuery({
    ...publicWarmupQueryOptions,
    queryKey: ["flash-sale-page", "upcoming"],
    queryFn: flashSaleApi.getUpcomingFlashSales,
  });

  useEffect(() => {
    setActiveSlotIndex(getCurrentSlotIndex());
  }, []);

  const saleStats = useMemo(() => {
    const allSales = [...activeSales, ...upcomingSales];
    return {
      totalDeals: allSales.length,
      bestDiscount: Math.max(
        0,
        ...allSales.map((sale) => sale.discountPercent || 0),
      ),
      stockReady: activeSales.reduce(
        (total, sale) => total + Math.max(sale.remainingStock, 0),
        0,
      ),
    };
  }, [activeSales, upcomingSales]);

  const isLoading = activeLoading || upcomingLoading;
  const isError = activeError || upcomingError;
  const isEmpty =
    !isLoading && activeSales.length === 0 && upcomingSales.length === 0;

  const benefits = [
    {
      icon: CheckCircle2,
      title: copy.benefitOfficial,
      description: copy.benefitOfficialDesc,
    },
    {
      icon: Truck,
      title: copy.benefitShipping,
      description: copy.benefitShippingDesc,
    },
    {
      icon: ShieldCheck,
      title: copy.benefitSecure,
      description: copy.benefitSecureDesc,
    },
    {
      icon: PackageCheck,
      title: copy.benefitStock,
      description: copy.benefitStockDesc,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f7ff]">
      <Header />

      <main className="flex-1">
        <section className="border-b border-[#d8e8ff] bg-[#edf6ff]">
          <div className="mx-auto w-full max-w-7xl px-4 py-8 md:py-10">
            <div className="overflow-hidden rounded-[28px] border border-[#cfe6ff] bg-white shadow-[rgba(11,116,229,0.1)_0_18px_44px]">
              <div className="grid gap-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                <div className="p-6 md:p-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#e8f5ff] px-4 py-2 text-sm font-semibold text-[#0b74e5]">
                    <Flame className="h-4 w-4 fill-[#ffdd57] text-[#ff424e]" />
                    {copy.heroKicker}
                  </div>
                  <h1 className="mt-5 text-4xl font-bold leading-tight tracking-normal text-gray-950 md:text-5xl">
                    {copy.heroTitle}
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
                    {copy.heroDescription}
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link href="/products">
                      <Button className="rounded-full bg-[#0b74e5] px-5 font-semibold text-white hover:bg-[#0969d3]">
                        {copy.browseBooks}
                      </Button>
                    </Link>
                    <Link href="/promotions">
                      <Button
                        variant="outline"
                        className="rounded-full border-[#b8dcff] bg-white px-5 font-semibold text-[#0b74e5] hover:bg-[#f1f8ff]"
                      >
                        {copy.browsePromotions}
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="bg-[#0b74e5] p-5 text-white md:p-6">
                  <div className="grid h-full content-between gap-5">
                    <div>
                      <p className="text-sm font-medium text-[#d8efff]">
                        Flash Sale
                      </p>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <StatPill
                          value={saleStats.totalDeals}
                          label={copy.totalDeals}
                        />
                        <StatPill
                          value={`${saleStats.bestDiscount}%`}
                          label={copy.bestDiscount}
                        />
                        <StatPill
                          value={saleStats.stockReady}
                          label={copy.stockReady}
                        />
                      </div>
                    </div>

                    <div className="rounded-3xl bg-white/12 p-4">
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                        <Clock className="h-4 w-4" />
                        {copy.slotSubtitle}
                      </div>
                      <SaleSlotNav
                        activeSlotIndex={activeSlotIndex}
                        copy={{
                          liveNow: copy.liveNow,
                          comingSoon: copy.comingSoon,
                          finished: copy.finished,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-[#d8e8ff] bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#e8f5ff] text-[#0b74e5]">
                      <benefit.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-gray-950">
                        {benefit.title}
                      </h2>
                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-7xl px-4 py-8">
          {isError ? (
            <ApiStatusCard
              title={copy.errorTitle}
              description={copy.errorDescription}
              retryLabel={copy.retry}
              onRetry={() => {
                void refetchActiveSales();
                void refetchUpcomingSales();
              }}
              primaryHref="/products"
              primaryLabel={copy.browseCatalog}
            />
          ) : isLoading ? (
            <FlashSaleLoadingState />
          ) : isEmpty ? (
            <div className="rounded-[28px] border border-dashed border-[#b8dcff] bg-white px-6 py-16 text-center shadow-sm md:px-8">
              <Zap className="mx-auto mb-4 h-14 w-14 text-[#0b74e5]" />
              <h2 className="mb-2 text-2xl font-semibold text-gray-950">
                {copy.emptyTitle}
              </h2>
              <p className="mx-auto mb-6 max-w-2xl text-gray-500">
                {copy.emptyDescription}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/products">
                  <Button className="rounded-full bg-[#0b74e5] hover:bg-[#0969d3]">
                    {copy.emptyCatalog}
                  </Button>
                </Link>
                <Link href="/promotions">
                  <Button
                    variant="outline"
                    className="rounded-full border-[#b8dcff] text-[#0b74e5] hover:bg-[#f1f8ff]"
                  >
                    {copy.emptyCoupon}
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <section className="overflow-hidden rounded-[28px] border border-[#cfe6ff] bg-white shadow-sm">
                <div className="flex flex-col gap-4 bg-[#0b74e5] px-5 py-5 text-white md:flex-row md:items-end md:justify-between md:px-6">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium text-white">
                      <Flame className="h-4 w-4 fill-[#ffdd57] text-[#ffdd57]" />
                      {copy.liveNow}
                    </div>
                    <h2 className="text-2xl font-bold text-white md:text-3xl">
                      {copy.activeHeading}
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[#e8f5ff]">
                      {copy.activeDescription}
                    </p>
                  </div>
                  <SaleSlotNav
                    activeSlotIndex={activeSlotIndex}
                    compact
                    copy={{
                      liveNow: copy.liveNow,
                      comingSoon: copy.comingSoon,
                      finished: copy.finished,
                    }}
                  />
                </div>

                {activeSales.length > 0 ? (
                  <div className="grid gap-4 bg-[#f7fbff] p-4 sm:grid-cols-2 lg:grid-cols-4 lg:p-5">
                    {activeSales.map((sale, index) => (
                      <FlashSaleCard
                        key={sale.id}
                        sale={sale}
                        imagePriority={index < 2}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    {copy.activeEmpty}
                  </div>
                )}
              </section>

              <section className="rounded-[28px] border border-[#d8e8ff] bg-white p-5 shadow-sm md:p-6">
                <div className="mb-5">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#fff0d5] px-3 py-1 text-sm font-medium text-[#b45309]">
                    <CalendarClock className="h-4 w-4" />
                    {copy.comingSoon}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-950 md:text-3xl">
                    {copy.upcomingHeading}
                  </h2>
                  <p className="mt-2 text-gray-500">
                    {copy.upcomingDescription}
                  </p>
                </div>

                {upcomingSales.length > 0 ? (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {upcomingSales.map((sale, index) => (
                      <UpcomingSaleCard
                        key={sale.id}
                        sale={sale}
                        locale={locale}
                        copy={{
                          startsAt: copy.startsAt,
                          discountLabel: copy.discountLabel,
                          estimatedPrice: copy.estimatedPrice,
                          stockLabel: copy.stockLabel,
                          previewProduct: copy.previewProduct,
                        }}
                        imagePriority={index < 4}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-[#d8e8ff] bg-[#f7fbff] p-8 text-center text-gray-500">
                    {copy.upcomingEmpty}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function StatPill({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-2xl bg-white px-3 py-3 text-center text-[#0b74e5]">
      <p className="text-xl font-bold leading-none">{value}</p>
      <p className="mt-1 text-[11px] font-medium leading-4 text-gray-500">
        {label}
      </p>
    </div>
  );
}

function SaleSlotNav({
  activeSlotIndex,
  compact = false,
  copy,
}: {
  activeSlotIndex: number;
  compact?: boolean;
  copy: {
    liveNow: string;
    comingSoon: string;
    finished: string;
  };
}) {
  return (
    <div
      className={
        compact
          ? "grid grid-cols-5 gap-1 rounded-2xl bg-white/12 p-1"
          : "grid grid-cols-5 gap-1"
      }
    >
      {SALE_SLOTS.map((slot, index) => {
        const status = getSlotStatus(index, activeSlotIndex);
        const isLive = status === "live";
        const statusLabel =
          status === "live"
            ? copy.liveNow
            : status === "finished"
              ? copy.finished
              : copy.comingSoon;

        return (
          <div
            key={slot}
            className={
              isLive
                ? "rounded-xl bg-white px-2 py-2 text-center text-[#0b74e5] shadow-sm"
                : "rounded-xl bg-white/10 px-2 py-2 text-center text-white/85"
            }
          >
            <p className="text-sm font-bold leading-none">{slot}</p>
            <p className="mt-1 truncate text-[10px] font-medium">
              {statusLabel}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function FlashSaleLoadingState() {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[28px] border border-[#d8e8ff] bg-white">
        <div className="bg-[#0b74e5] p-5">
          <Skeleton className="h-8 w-64 bg-white/30" />
          <Skeleton className="mt-3 h-4 w-full max-w-xl bg-white/20" />
        </div>
        <div className="grid gap-4 bg-[#f7fbff] p-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[430px] rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-44 rounded-[28px]" />
        ))}
      </div>
    </div>
  );
}

function UpcomingSaleCard({
  sale,
  locale,
  copy,
  imagePriority = false,
}: {
  sale: FlashSale;
  locale: "vi" | "en";
  copy: {
    startsAt: string;
    discountLabel: string;
    estimatedPrice: string;
    stockLabel: string;
    previewProduct: string;
  };
  imagePriority?: boolean;
}) {
  return (
    <div className="grid gap-4 rounded-3xl border border-[#d8e8ff] bg-[#f7fbff] p-4 sm:grid-cols-[96px_minmax(0,1fr)] sm:items-center">
      <div className="relative h-32 overflow-hidden rounded-2xl bg-white sm:h-36">
        <ProductImage
          src={sale.product.imageUrl || undefined}
          fallbackSrc={resolveProductFallbackImage({
            id: sale.product.id,
            imageUrl: sale.product.imageUrl,
            images: [],
          })}
          alt={sale.product.name}
          fill
          sizes="96px"
          priority={imagePriority}
          className="object-contain p-3"
        />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0b74e5]">
            {copy.startsAt} {formatDate(sale.startTime, locale)}
          </p>
          <p className="rounded-full bg-[#ff424e] px-3 py-1 text-xs font-bold text-white">
            {copy.discountLabel} -{sale.discountPercent}%
          </p>
        </div>
        <h3 className="mt-3 line-clamp-2 text-lg font-semibold text-gray-950">
          {sale.product.name}
        </h3>
        <p className="mt-1 text-sm text-gray-500">{sale.product.author}</p>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span>
            {copy.estimatedPrice}:{" "}
            <strong className="text-[#ff424e]">
              {formatMoney(sale.salePrice, locale)}
            </strong>
          </span>
          <span>
            {copy.stockLabel}: {sale.stockLimit}
          </span>
        </div>
        <div className="mt-4">
          <Link href={`/products/${sale.product.id}`}>
            <Button
              variant="outline"
              className="rounded-full border-[#b8dcff] text-[#0b74e5] hover:bg-white"
            >
              {copy.previewProduct}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
