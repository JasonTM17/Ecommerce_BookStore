"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, Flame, Sparkles, Zap } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FlashSaleCard } from "@/components/flashsale/FlashSaleCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { flashSaleApi } from "@/lib/flashsale";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function FlashSalePage() {
  const { data: activeSales = [], isLoading: activeLoading } = useQuery({
    queryKey: ["flash-sale-page", "active"],
    queryFn: flashSaleApi.getActiveFlashSales,
  });

  const { data: upcomingSales = [], isLoading: upcomingLoading } = useQuery({
    queryKey: ["flash-sale-page", "upcoming"],
    queryFn: flashSaleApi.getUpcomingFlashSales,
  });

  const isLoading = activeLoading || upcomingLoading;
  const isEmpty = !isLoading && activeSales.length === 0 && upcomingSales.length === 0;

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
                Ưu đãi giới hạn thời gian được đồng bộ từ API thật
              </div>
              <h1 className="text-4xl font-bold sm:text-5xl">Flash Sale</h1>
              <p className="mt-4 text-lg text-red-50">
                Săn deal nổi bật khi hàng còn trong kho. Các chiến dịch đang chạy được cập nhật tự động và lịch mở bán sắp tới nằm ngay bên dưới.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/products">
                  <Button className="bg-white text-red-600 hover:bg-red-50">Xem toàn bộ sách</Button>
                </Link>
                <Link href="/promotions">
                  <Button variant="outline" className="border-white/60 bg-transparent text-white hover:bg-white/10">
                    Xem khuyến mãi
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-10">
          {isLoading ? (
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
              <h2 className="mb-2 text-2xl font-semibold text-gray-900">Hiện chưa có flash sale nào</h2>
              <p className="mx-auto mb-6 max-w-2xl text-gray-500">
                Hiện chưa có chiến dịch nào đang chạy hoặc sắp mở bán. Bạn vẫn có thể xem khuyến mãi hoặc khám phá toàn bộ catalog sách.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/products">
                  <Button>Khám phá catalog</Button>
                </Link>
                <Link href="/promotions">
                  <Button variant="outline">Xem coupon công khai</Button>
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
                      Đang diễn ra
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Chiến dịch đang chạy</h2>
                    <p className="mt-2 text-gray-500">Các deal này đang hoạt động ngay bây giờ và liên kết trực tiếp tới trang chi tiết sản phẩm thật.</p>
                  </div>
                </div>

                {activeSales.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    {activeSales.map((sale) => (
                      <FlashSaleCard key={sale.id} sale={sale} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                    Hiện chưa có flash sale nào đang diễn ra.
                  </div>
                )}
              </section>

              <section>
                <div className="mb-6">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                    <CalendarClock className="h-4 w-4" />
                    Sắp diễn ra
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Lịch mở bán tiếp theo</h2>
                  <p className="mt-2 text-gray-500">Theo dõi trước các campaign sắp mở để chủ động săn deal khi bắt đầu.</p>
                </div>

                {upcomingSales.length > 0 ? (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {upcomingSales.map((sale) => (
                      <div key={sale.id} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-600">Bắt đầu lúc {formatDate(sale.startTime)}</p>
                            <h3 className="mt-2 text-xl font-semibold text-gray-900">{sale.product.name}</h3>
                            <p className="mt-1 text-sm text-gray-500">{sale.product.author}</p>
                          </div>
                          <div className="rounded-2xl bg-gray-50 px-4 py-3 text-right">
                            <p className="text-sm text-gray-500">Mức giảm</p>
                            <p className="text-2xl font-bold text-red-600">-{sale.discountPercent}%</p>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <span>Giá dự kiến: {formatMoney(sale.salePrice)}</span>
                          <span>Số lượng: {sale.stockLimit}</span>
                        </div>
                        <div className="mt-5">
                          <Link href={`/products/${sale.product.id}`}>
                            <Button variant="outline">Xem trước sản phẩm</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                    Chưa có campaign sắp tới nào được lên lịch.
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
