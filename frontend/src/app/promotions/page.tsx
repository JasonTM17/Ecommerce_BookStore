"use client";

import Link from "next/link";
import { Gift, ShoppingBag, TicketPercent } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AvailableCoupons } from "@/components/coupon/CouponCard";
import { Button } from "@/components/ui/button";

export default function PromotionsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-red-50/70 via-white to-white">
      <Header />

      <main className="flex-1">
        <section className="border-b border-red-100 bg-gradient-to-br from-red-600 via-red-500 to-orange-500 py-16 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
                <TicketPercent className="h-4 w-4" />
                Mã giảm giá công khai có thể sao chép ngay
              </div>
              <h1 className="text-4xl font-bold sm:text-5xl">Khuyến mãi</h1>
              <p className="mt-4 text-lg text-red-50">
                Xem các mã giảm giá đang hoạt động, sao chép mã phù hợp và áp dụng ngay ở giỏ hàng hoặc bước thanh toán như luồng mua sắm hiện tại.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/cart">
                  <Button className="bg-white text-red-600 hover:bg-red-50">Đến giỏ hàng</Button>
                </Link>
                <Link href="/checkout">
                  <Button variant="outline" className="border-white/60 bg-transparent text-white hover:bg-white/10">
                    Tiếp tục thanh toán
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-10">
          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-start gap-4">
                <div className="rounded-2xl bg-red-100 p-3 text-red-600">
                  <Gift className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Coupon đang khả dụng</h2>
                  <p className="mt-1 text-gray-500">
                    Sao chép mã bạn cần ngay bây giờ và áp dụng ở bước xem giỏ hàng hoặc hoàn tất thanh toán.
                  </p>
                </div>
              </div>
              <AvailableCoupons className="min-h-[240px]" />
            </section>

            <aside className="space-y-6">
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900">Cách sử dụng</h2>
                <div className="mt-4 space-y-3 text-sm text-gray-600">
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="font-medium text-gray-900">1. Sao chép mã</p>
                    <p className="mt-1">Dùng nút sao chép nhanh trên bất kỳ coupon card nào.</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="font-medium text-gray-900">2. Xem điều kiện áp dụng</p>
                    <p className="mt-1">Kiểm tra giá trị đơn tối thiểu, hạn sử dụng và lượt dùng còn lại.</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="font-medium text-gray-900">3. Áp dụng tại giỏ hàng hoặc checkout</p>
                    <p className="mt-1">Luồng nhập coupon chính thức vẫn giữ đúng ở nơi người dùng đã quen thao tác.</p>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white shadow-sm">
                <div className="flex items-start gap-3">
                  <ShoppingBag className="mt-1 h-5 w-5 text-red-300" />
                  <div>
                    <h2 className="text-xl font-semibold">Sẵn sàng dùng mã giảm giá?</h2>
                    <p className="mt-2 text-sm leading-6 text-gray-300">
                      Chọn sách bạn muốn mua rồi đi tới giỏ hàng hoặc bước thanh toán để áp dụng mã trong đúng luồng mua sắm hiện tại.
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/products">
                    <Button variant="secondary">Xem danh mục sách</Button>
                  </Link>
                  <Link href="/cart">
                    <Button variant="outline" className="border-gray-600 bg-transparent text-white hover:bg-white/10">
                      Mở giỏ hàng
                    </Button>
                  </Link>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
