"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FeaturedProducts, NewProducts, CategorySection } from "@/components/home-section";
import Link from "next/link";
import { ArrowRight, BookOpen, Truck, Shield, CreditCard, Sparkles, BookMarked, Heart } from "lucide-react";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl" />
            
            {/* Floating book icons */}
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute text-white/10 animate-float"
                style={{
                  left: `${15 + i * 20}%`,
                  top: `${20 + (i % 3) * 25}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${3 + i * 0.5}s`
                }}
              >
                <BookOpen className={`w-${16 + i * 4} h-${16 + i * 4}`} />
              </div>
            ))}
          </div>

          <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className={`text-white transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium">Hơn 10,000+ đầu sách chất lượng</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Khám Phá{' '}
                  <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
                    Thế Giới Sách
                  </span>
                  <br />
                  <span className="text-3xl md:text-4xl lg:text-5xl">Mọi Lúc, Mọi Nơi</span>
                </h1>
                
                <p className="text-lg md:text-xl text-blue-100/90 mb-8 max-w-lg">
                  Hàng ngàn đầu sách hay từ các nhà xuất bản uy tín. 
                  Giao hàng nhanh chóng, thanh toán an toàn.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/products"
                    className="group inline-flex items-center bg-gradient-to-r from-yellow-500 to-amber-500 text-gray-900 font-bold px-8 py-4 rounded-xl hover:from-yellow-400 hover:to-amber-400 transition-all duration-300 shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105"
                  >
                    Mua Ngay
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/categories"
                    className="group inline-flex items-center border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
                  >
                    Khám Phá Danh Mục
                    <BookMarked className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  </Link>
                </div>

                {/* Trust badges */}
                <div className="flex items-center gap-6 mt-10 pt-10 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-400" />
                    <span className="text-sm text-blue-100/80">100% Chính Hãng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-green-400" />
                    <span className="text-sm text-blue-100/80">Miễn Phí Giao Hàng</span>
                  </div>
                </div>
              </div>

              {/* Hero Illustration */}
              <div className={`hidden md:flex justify-center items-center transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                <div className="relative">
                  {/* Decorative circles */}
                  <div className="absolute -top-8 -left-8 w-32 h-32 bg-yellow-400/20 rounded-full animate-pulse" />
                  <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-400/20 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                  
                  {/* Main card */}
                  <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                    <div className="grid grid-cols-2 gap-4">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        >
                          <BookOpen className={`h-${12 + i % 2} w-${12 + i % 2} text-yellow-300 mb-2`} />
                          <p className="text-white text-sm font-medium">
                            {['Tiểu Thuyết', 'Khoa Học', 'Kỹ Năng', 'Lịch Sử'][i]}
                          </p>
                          <p className="text-blue-200/60 text-xs">
                            {['1,200+ cuốn', '800+ cuốn', '950+ cuốn', '650+ cuố'][i]}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Floating badge */}
                    <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 px-4 py-2 rounded-full shadow-lg animate-bounce">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        <span className="font-bold text-sm">10K+ Yêu Thích</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 bg-white border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Truck, title: "Miễn Phí Giao Hàng", subtitle: "Đơn hàng từ 200K", color: "blue" },
                { icon: Shield, title: "100% Chính Hãng", subtitle: "Sách từ nhà xuất bản", color: "green" },
                { icon: CreditCard, title: "Thanh Toán An Toàn", subtitle: "Nhiều phương thức", color: "purple" },
                { icon: BookOpen, title: "Đổi Trả Dễ Dàng", subtitle: "Trong 7 ngày", color: "orange" },
              ].map((feature, i) => (
                <div 
                  key={i}
                  className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all duration-300 cursor-pointer"
                >
                  <div className={`w-14 h-14 bg-${feature.color}-100 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                    <feature.icon className={`h-7 w-7 text-${feature.color}-600`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                    <p className="text-sm text-gray-500">{feature.subtitle}</p>
                  </div>
                </div>
              ))}
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
        <section className="py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-white/90">Ưu đãi đặc biệt cho thành viên mới</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Bắt Đầu Hành Trình
              <br />
              <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
                Đọc Sách Ngay Hôm Nay
              </span>
            </h2>
            
            <p className="text-xl text-blue-100/90 mb-10 max-w-2xl mx-auto">
              Đăng ký ngay hôm nay để nhận ưu đãi <span className="font-bold text-yellow-400">10%</span> cho đơn hàng đầu tiên
            </p>
            
            <Link
              href="/register"
              className="group inline-flex items-center bg-gradient-to-r from-yellow-500 to-amber-500 text-gray-900 font-bold px-10 py-5 rounded-2xl hover:from-yellow-400 hover:to-amber-400 transition-all duration-300 shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105"
            >
              <span className="mr-2">Đăng Ký Ngay</span>
              <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
