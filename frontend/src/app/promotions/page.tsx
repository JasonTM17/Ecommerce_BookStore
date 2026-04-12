"use client";

import Link from "next/link";
import { Gift, ShoppingBag, TicketPercent } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AvailableCoupons } from "@/components/coupon/CouponCard";
import { Button } from "@/components/ui/button";

export default function PromotionsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50/70 via-white to-white">
      <Header />

      <main className="flex-1">
        <section className="border-b border-blue-100 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 py-16 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
                <TicketPercent className="h-4 w-4" />
                Public coupons that can be copied right away
              </div>
              <h1 className="text-4xl font-bold sm:text-5xl">Promotions</h1>
              <p className="mt-4 text-lg text-blue-50">
                Browse active coupon codes, copy the ones you need, then apply them in cart or checkout without changing the purchase flow.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/cart">
                  <Button className="bg-white text-blue-600 hover:bg-blue-50">Go to cart</Button>
                </Link>
                <Link href="/checkout">
                  <Button variant="outline" className="border-white/60 bg-transparent text-white hover:bg-white/10">
                    Continue to checkout
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
                <div className="rounded-2xl bg-blue-100 p-3 text-blue-600">
                  <Gift className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Available coupons</h2>
                  <p className="mt-1 text-gray-500">
                    Copy a code now and apply it when you review your cart or finalize checkout.
                  </p>
                </div>
              </div>
              <AvailableCoupons className="min-h-[240px]" />
            </section>

            <aside className="space-y-6">
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900">How to use them</h2>
                <div className="mt-4 space-y-3 text-sm text-gray-600">
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="font-medium text-gray-900">1. Copy a code</p>
                    <p className="mt-1">Use the quick copy button on any coupon card.</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="font-medium text-gray-900">2. Review requirements</p>
                    <p className="mt-1">Check minimum order value, expiry date, and remaining usage.</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="font-medium text-gray-900">3. Apply in cart or checkout</p>
                    <p className="mt-1">The official apply flow stays exactly where it already lives.</p>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white shadow-sm">
                <div className="flex items-start gap-3">
                  <ShoppingBag className="mt-1 h-5 w-5 text-blue-300" />
                  <div>
                    <h2 className="text-xl font-semibold">Ready to use a code?</h2>
                    <p className="mt-2 text-sm leading-6 text-gray-300">
                      Pick your books, then head to cart or checkout to apply the coupon during the normal purchase flow.
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/products">
                    <Button variant="secondary">Browse books</Button>
                  </Link>
                  <Link href="/cart">
                    <Button variant="outline" className="border-gray-600 bg-transparent text-white hover:bg-white/10">
                      Open cart
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
