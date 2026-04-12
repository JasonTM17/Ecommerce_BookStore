"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  CreditCard,
  Heart,
  Shield,
  Sparkles,
  Truck,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  CategorySection,
  FeaturedProducts,
  NewProducts,
} from "@/components/home-section";
import { apiPublic } from "@/lib/api";
import type { Category } from "@/lib/types";

const floatingBookSizes = ["w-16 h-16", "w-20 h-20", "w-24 h-24", "w-28 h-28", "w-32 h-32"];

type ShowcaseGenre = {
  key: string;
  label: string;
  aliases: string[];
  iconClassName: string;
};

const showcaseGenres: ShowcaseGenre[] = [
  {
    key: "tieu-thuyet",
    label: "Tiểu thuyết",
    aliases: ["tieu-thuyet", "tieu-thuyet-van-hoc", "tieu-thuyet-kinh-dien"],
    iconClassName: "h-12 w-12",
  },
  {
    key: "khoa-hoc",
    label: "Khoa học",
    aliases: ["khoa-hoc", "khoa-hoc-tu-nhien"],
    iconClassName: "h-14 w-14",
  },
  {
    key: "ky-nang",
    label: "Kỹ năng",
    aliases: ["phat-trien-ban-than", "ky-nang-song"],
    iconClassName: "h-12 w-12",
  },
  {
    key: "lich-su",
    label: "Lịch sử",
    aliases: ["lich-su"],
    iconClassName: "h-14 w-14",
  },
];

const featureHighlights = [
  {
    icon: Truck,
    title: "Miễn phí giao hàng",
    subtitle: "Áp dụng cho đơn từ 200.000đ",
    iconWrapperClassName: "bg-blue-100",
    iconClassName: "text-blue-600",
  },
  {
    icon: Shield,
    title: "100% chính hãng",
    subtitle: "Sách từ các nhà xuất bản uy tín",
    iconWrapperClassName: "bg-green-100",
    iconClassName: "text-green-600",
  },
  {
    icon: CreditCard,
    title: "Thanh toán an toàn",
    subtitle: "Nhiều phương thức linh hoạt",
    iconWrapperClassName: "bg-purple-100",
    iconClassName: "text-purple-600",
  },
  {
    icon: BookOpen,
    title: "Đổi trả dễ dàng",
    subtitle: "Hỗ trợ trong 7 ngày",
    iconWrapperClassName: "bg-orange-100",
    iconClassName: "text-orange-600",
  },
];

function normalizeKey(value?: string | null) {
  if (!value) {
    return "";
  }

  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

function flattenCategories(categories: Category[]): Category[] {
  return categories.flatMap((category) => [
    category,
    ...(category.subcategories ? flattenCategories(category.subcategories) : []),
  ]);
}

function formatCount(productCount?: number) {
  if (!productCount || productCount <= 0) {
    return "Khám phá ngay";
  }

  return `${productCount.toLocaleString("vi-VN")} cuốn`;
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const { data: categories = [] } = useQuery({
    queryKey: ["home-showcase-categories"],
    queryFn: async () => {
      const response = await apiPublic.get("/categories");
      return Array.isArray(response.data) ? (response.data as Category[]) : [];
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const flattenedCategories = flattenCategories(categories);
  const showcaseCards = showcaseGenres.map((genre) => {
    const matchedCategory = flattenedCategories.find((category) =>
      genre.aliases.includes(normalizeKey(category.name))
    );

    return {
      ...genre,
      href: matchedCategory ? `/categories?id=${matchedCategory.id}` : "/categories",
      countLabel: formatCount(matchedCategory?.productCount),
    };
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />
            <div
              className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            />
            <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/10 blur-3xl" />

            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="absolute text-white/10 animate-float"
                style={{
                  left: `${15 + index * 20}%`,
                  top: `${20 + (index % 3) * 25}%`,
                  animationDelay: `${index * 0.5}s`,
                  animationDuration: `${3 + index * 0.5}s`,
                }}
              >
                <BookOpen className={floatingBookSizes[index] || "w-16 h-16"} />
              </div>
            ))}
          </div>

          <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div
                className={`text-white transition-all duration-1000 ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
              >
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm mb-6">
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium">Hơn 10.000 đầu sách chất lượng</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Khám phá{" "}
                  <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
                    thế giới sách
                  </span>
                  <br />
                  <span className="text-3xl md:text-4xl lg:text-5xl">mọi lúc, mọi nơi</span>
                </h1>

                <p className="text-lg md:text-xl text-blue-100/90 mb-8 max-w-lg">
                  Từ văn học, kinh doanh đến khoa học và kỹ năng sống, BookStore giúp bạn
                  tìm được cuốn sách phù hợp với trải nghiệm mua sắm nhanh, đẹp và đáng tin cậy.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/products"
                    className="group inline-flex items-center rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 px-8 py-4 font-bold text-gray-900 shadow-xl shadow-amber-500/30 transition-all duration-300 hover:from-yellow-400 hover:to-amber-400 hover:scale-105 hover:shadow-amber-500/50"
                  >
                    Mua ngay
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/categories"
                    className="group inline-flex items-center rounded-xl border-2 border-white/30 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10"
                  >
                    Khám phá danh mục
                    <BookMarked className="ml-2 h-5 w-5 transition-transform group-hover:rotate-12" />
                  </Link>
                </div>

                <div className="mt-10 flex items-center gap-6 border-t border-white/10 pt-10">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-400" />
                    <span className="text-sm text-blue-100/80">100% sách chính hãng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-green-400" />
                    <span className="text-sm text-blue-100/80">Giao hàng nhanh toàn quốc</span>
                  </div>
                </div>
              </div>

              <div
                className={`hidden md:flex items-center justify-center transition-all duration-1000 delay-300 ${
                  mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
                }`}
              >
                <div className="relative">
                  <div className="absolute -top-8 -left-8 h-32 w-32 rounded-full bg-yellow-400/20 animate-pulse" />
                  <div
                    className="absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-blue-400/20 animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                  />

                  <div className="relative rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
                    <div className="grid grid-cols-2 gap-4">
                      {showcaseCards.map((genre, index) => (
                        <Link
                          key={genre.key}
                          href={genre.href}
                          data-testid={`hero-showcase-${genre.key}`}
                          className="group rounded-2xl bg-white/10 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <BookOpen className={`${genre.iconClassName} text-yellow-300 mb-2`} />
                          <p className="text-sm font-semibold text-white">{genre.label}</p>
                          <p className="text-xs text-blue-100/75">{genre.countLabel}</p>
                        </Link>
                      ))}
                    </div>

                    <div className="absolute -top-4 -right-4 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-2 text-gray-900 shadow-lg">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        <span className="text-sm font-bold">10K+ yêu thích</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featureHighlights.map((feature) => (
                <div
                  key={feature.title}
                  data-testid="hero-feature-highlight"
                  className="flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 hover:bg-gray-50"
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${feature.iconWrapperClassName} shadow-sm transition-all duration-300`}
                  >
                    <feature.icon className={`h-7 w-7 ${feature.iconClassName}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-500">{feature.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CategorySection />
        <FeaturedProducts />
        <NewProducts />

        <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-24">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm mb-6">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-white/90">
                Ưu đãi đặc biệt cho thành viên mới
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Bắt đầu hành trình
              <br />
              <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
                đọc sách ngay hôm nay
              </span>
            </h2>

            <p className="mx-auto mb-10 max-w-2xl text-xl text-blue-100/90">
              Đăng ký để nhận ưu đãi <span className="font-bold text-yellow-400">10%</span> cho
              đơn hàng đầu tiên và lưu lại những cuốn sách bạn yêu thích.
            </p>

            <Link
              href="/register"
              className="group inline-flex items-center rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 px-10 py-5 font-bold text-gray-900 shadow-2xl shadow-amber-500/30 transition-all duration-300 hover:from-yellow-400 hover:to-amber-400 hover:scale-105 hover:shadow-amber-500/50"
            >
              <span className="mr-2">Đăng ký ngay</span>
              <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
