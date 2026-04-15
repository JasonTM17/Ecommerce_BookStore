"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, Flame, Sparkles, Zap } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FlashSaleCard } from "@/components/flashsale/FlashSaleCard";
import { ApiStatusCard } from "@/components/ui/api-status-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/components/providers/language-provider";
import { flashSaleApi } from "@/lib/flashsale";
import { publicWarmupQueryOptions } from "@/lib/public-query-options";

const COPY = {
  vi: {
    heroBadge: "Ưu đãi giới hạn thời gian được đồng bộ từ API thật",
    heroDescription:
      "Săn deal nổi bật khi hàng còn trong kho. Các chiến dịch đang chạy được cập nhật tự động và lịch mở bán sắp tới nằm ngay bên dưới.",
    browseBooks: "Xem toàn bộ sách",
    browsePromotions: "Xem khuyến mãi",
    emptyTitle: "Hiện chưa có flash sale nào",
    emptyDescription:
      "Hiện chưa có chiến dịch nào đang chạy hoặc sắp mở bán. Bạn vẫn có thể xem khuyến mãi hoặc khám phá toàn bộ catalog sách.",
    emptyCatalog: "Khám phá catalog",
    emptyCoupon: "Xem coupon công khai",
    activeBadge: "Đang diễn ra",
    activeHeading: "Chiến dịch đang chạy",
    activeDescription:
      "Các deal này đang hoạt động ngay bây giờ và liên kết trực tiếp tới trang chi tiết sản phẩm thật.",
    activeEmpty: "Hiện chưa có flash sale nào đang diễn ra.",
    upcomingBadge: "Sắp diễn ra",
    upcomingHeading: "Lịch mở bán tiếp theo",
    upcomingDescription:
      "Theo dõi trước các campaign sắp mở để chủ động săn deal khi bắt đầu.",
    startsAt: "Bắt đầu lúc",
    discountLabel: "Mức giảm",
    estimatedPrice: "Giá dự kiến",
    stockLabel: "Số lượng",
    previewProduct: "Xem trước sản phẩm",
    upcomingEmpty: "Chưa có campaign sắp tới nào được lên lịch.",
    errorTitle: "Flash sale đang tạm thời chưa tải được",
    errorDescription:
      "Backend có thể đang khởi động lại hoặc kết nối tạm thời gián đoạn. Vui lòng thử lại sau ít phút.",
    retry: "Tải lại flash sale",
    browseCatalog: "Xem danh sách sách",
  },
  en: {
    heroBadge: "Time-limited offers synced from the live API",
    heroDescription:
      "Catch standout deals while stock lasts. Live campaigns are refreshed automatically and the next launch window is listed below.",
    browseBooks: "Browse all books",
    browsePromotions: "View promotions",
    emptyTitle: "No flash sale is live right now",
    emptyDescription:
      "There is no active or upcoming flash-sale campaign at the moment. You can still browse promotions or explore the full catalog.",
    emptyCatalog: "Browse catalog",
    emptyCoupon: "View public coupons",
    activeBadge: "Live now",
    activeHeading: "Active campaigns",
    activeDescription:
      "These deals are currently running and link directly to the real product detail pages.",
    activeEmpty: "There is no active flash sale right now.",
    upcomingBadge: "Coming up",
    upcomingHeading: "Next launch window",
    upcomingDescription:
      "Track the next campaigns ahead of time so you can jump in the moment they go live.",
    startsAt: "Starts at",
    discountLabel: "Discount",
    estimatedPrice: "Estimated price",
    stockLabel: "Stock",
    previewProduct: "Preview product",
    upcomingEmpty: "No upcoming campaign has been scheduled yet.",
    errorTitle: "Flash sale is temporarily unavailable",
    errorDescription:
      "The backend may still be starting up or the connection is temporarily interrupted. Please try again in a moment.",
    retry: "Reload flash sale",
    browseCatalog: "Browse books",
  },
} as const;

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

export default function FlashSalePage() {
  const { locale } = useLanguage();
  const copy = COPY[locale];
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

  const isLoading = activeLoading || upcomingLoading;
  const isError = activeError || upcomingError;
  const isEmpty =
    !isLoading && activeSales.length === 0 && upcomingSales.length === 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-red-50 via-white to-white">
      <Header />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-red-100 bg-gradient-to-br from-red-600 via-red-500 to-orange-500 py-16 text-white">
          <div className="absolute inset-0">
            <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-yellow-300/20 blur-3xl" />
          </div>
          <div className="container relative z-10 mx-auto px-4">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
                <Zap className="h-4 w-4" />
                {copy.heroBadge}
              </div>
              <h1 className="text-4xl font-bold sm:text-5xl">Flash Sale</h1>
              <p className="mt-4 text-lg text-red-50">{copy.heroDescription}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/products">
                  <Button className="bg-white text-red-600 hover:bg-red-50">
                    {copy.browseBooks}
                  </Button>
                </Link>
                <Link href="/promotions">
                  <Button
                    variant="outline"
                    className="border-white/60 bg-transparent text-white hover:bg-white/10"
                  >
                    {copy.browsePromotions}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-10">
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
            <div className="space-y-10">
              <div className="space-y-4">
                <Skeleton className="h-8 w-60" />
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-[420px] rounded-3xl" />
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-8 w-72" />
                <div className="grid gap-4 lg:grid-cols-2">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <Skeleton key={index} className="h-40 rounded-3xl" />
                  ))}
                </div>
              </div>
            </div>
          ) : isEmpty ? (
            <div className="rounded-3xl border border-dashed border-red-200 bg-white px-8 py-20 text-center shadow-sm">
              <Sparkles className="mx-auto mb-4 h-14 w-14 text-red-300" />
              <h2 className="mb-2 text-2xl font-semibold text-gray-900">
                {copy.emptyTitle}
              </h2>
              <p className="mx-auto mb-6 max-w-2xl text-gray-500">
                {copy.emptyDescription}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/products">
                  <Button>{copy.emptyCatalog}</Button>
                </Link>
                <Link href="/promotions">
                  <Button variant="outline">{copy.emptyCoupon}</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              <section>
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                      <Flame className="h-4 w-4" />
                      {copy.activeBadge}
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {copy.activeHeading}
                    </h2>
                    <p className="mt-2 text-gray-500">
                      {copy.activeDescription}
                    </p>
                  </div>
                </div>

                {activeSales.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    {activeSales.map((sale, index) => (
                      <FlashSaleCard
                        key={sale.id}
                        sale={sale}
                        imagePriority={index < 2}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                    {copy.activeEmpty}
                  </div>
                )}
              </section>

              <section>
                <div className="mb-6">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                    <CalendarClock className="h-4 w-4" />
                    {copy.upcomingBadge}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    {copy.upcomingHeading}
                  </h2>
                  <p className="mt-2 text-gray-500">
                    {copy.upcomingDescription}
                  </p>
                </div>

                {upcomingSales.length > 0 ? (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {upcomingSales.map((sale) => (
                      <div
                        key={sale.id}
                        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-600">
                              {copy.startsAt}{" "}
                              {formatDate(sale.startTime, locale)}
                            </p>
                            <h3 className="mt-2 text-xl font-semibold text-gray-900">
                              {sale.product.name}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {sale.product.author}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-gray-50 px-4 py-3 text-right">
                            <p className="text-sm text-gray-500">
                              {copy.discountLabel}
                            </p>
                            <p className="text-2xl font-bold text-red-600">
                              -{sale.discountPercent}%
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <span>
                            {copy.estimatedPrice}:{" "}
                            {formatMoney(sale.salePrice, locale)}
                          </span>
                          <span>
                            {copy.stockLabel}: {sale.stockLimit}
                          </span>
                        </div>
                        <div className="mt-5">
                          <Link href={`/products/${sale.product.id}`}>
                            <Button variant="outline">
                              {copy.previewProduct}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center text-gray-500">
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
