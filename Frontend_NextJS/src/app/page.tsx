"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FeaturedProducts, NewProducts, CategorySection } from "@/components/home-section";
import Link from "next/link";
import { ArrowRight, BookOpen, Truck, Shield, CreditCard } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-primary/90 to-primary py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Khám Phá Thế Giới Sách
                  <br />
                  <span className="text-yellow-300">Mọi Lúc, Mọi Nơi</span>
                </h1>
                <p className="text-lg md:text-xl text-white/90 mb-8">
                  Hàng ngàn đầu sách hay từ các nhà xuất bản uy tín. 
                  Giao hàng nhanh chóng, thanh toán an toàn.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/products"
                    className="inline-flex items-center bg-white text-primary font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Mua Ngay
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    href="/categories"
                    className="inline-flex items-center border-2 border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Khám Phá Danh Mục
                  </Link>
                </div>
              </div>
              <div className="hidden md:flex justify-center">
                <div className="relative">
                  <div className="absolute -top-8 -left-8 w-48 h-48 bg-yellow-300/20 rounded-full" />
                  <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-white/10 rounded-full" />
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
                    <BookOpen className="h-32 w-32 text-white mx-auto mb-4" />
                    <p className="text-white text-lg font-medium">10,000+ Đầu Sách</p>
                    <p className="text-white/80 text-sm">Từ mọi thể loại</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Miễn Phí Giao Hàng</h3>
                  <p className="text-sm text-gray-500">Đơn hàng từ 200K</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">100% Chính Hãng</h3>
                  <p className="text-sm text-gray-500">Sách từ nhà xuất bản</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Thanh Toán An Toàn</h3>
                  <p className="text-sm text-gray-500">Nhiều phương thức</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Đổi Trả Dễ Dàng</h3>
                  <p className="text-sm text-gray-500">Trong 7 ngày</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <CategorySection />

        {/* Featured Products */}
        <FeaturedProducts />

        {/* New Products */}
        <NewProducts />

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Bắt Đầu Hành Trình Đọc Sách
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Đăng ký ngay hôm nay để nhận ưu đãi 10% cho đơn hàng đầu tiên
            </p>
            <Link
              href="/register"
              className="inline-flex items-center bg-white text-primary font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Đăng Ký Ngay
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
