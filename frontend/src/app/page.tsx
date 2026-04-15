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
import { CategorySection, FeaturedProducts, NewProducts } from "@/components/home-section";
import { apiPublic } from "@/lib/api";
import { publicWarmupQueryOptions } from "@/lib/public-query-options";
import { useLanguage } from "@/components/providers/language-provider";
import type { Category } from "@/lib/types";

const floatingBookSizes = ["w-16 h-16", "w-20 h-20", "w-24 h-24", "w-28 h-28", "w-32 h-32"];

type ShowcaseGenre = {
  key: string;
  labelKey: string;
  aliases: string[];
  iconClassName: string;
};

const showcaseGenres: ShowcaseGenre[] = [
  {
    key: "tieu-thuyet",
    labelKey: "home.genreNovel",
    aliases: ["tieu-thuyet", "tieu-thuyet-van-hoc", "tieu-thuyet-kinh-dien"],
    iconClassName: "h-12 w-12",
  },
  {
    key: "khoa-hoc",
    labelKey: "home.genreScience",
    aliases: ["khoa-hoc", "khoa-hoc-tu-nhien"],
    iconClassName: "h-14 w-14",
  },
  {
    key: "ky-nang",
    labelKey: "home.genreSkills",
    aliases: ["phat-trien-ban-than", "ky-nang-song"],
    iconClassName: "h-12 w-12",
  },
  {
    key: "lich-su",
    labelKey: "home.genreHistory",
    aliases: ["lich-su"],
    iconClassName: "h-14 w-14",
  },
];

function normalizeKey(value?: string | null) {
  if (!value) {
    return "";
  }

  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
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

export default function HomePage() {
  const { t, locale } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const { data: categories = [] } = useQuery({
    ...publicWarmupQueryOptions,
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
      label: t(genre.labelKey),
      href: matchedCategory ? `/categories?id=${matchedCategory.id}` : "/categories",
      countLabel:
        typeof matchedCategory?.productCount === "number" && matchedCategory.productCount > 0
          ? `${matchedCategory.productCount.toLocaleString(locale === "vi" ? "vi-VN" : "en-US")} ${
              locale === "vi" ? "cuốn" : "titles"
            }`
          : t("home.showcaseFallback"),
    };
  });

  const featureHighlights = [
    {
      icon: Truck,
      title: t("home.featureShippingTitle"),
      subtitle: t("home.featureShippingSubtitle"),
      iconWrapperClassName: "bg-blue-100",
      iconClassName: "text-blue-600",
    },
    {
      icon: Shield,
      title: t("home.featureAuthenticTitle"),
      subtitle: t("home.featureAuthenticSubtitle"),
      iconWrapperClassName: "bg-green-100",
      iconClassName: "text-green-600",
    },
    {
      icon: CreditCard,
      title: t("home.featurePaymentTitle"),
      subtitle: t("home.featurePaymentSubtitle"),
      iconWrapperClassName: "bg-purple-100",
      iconClassName: "text-purple-600",
    },
    {
      icon: BookOpen,
      title: t("home.featureReturnsTitle"),
      subtitle: t("home.featureReturnsSubtitle"),
      iconWrapperClassName: "bg-orange-100",
      iconClassName: "text-orange-600",
    },
  ];

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
                  <span className="text-sm font-medium">{t("home.libraryBadge")}</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  {t("home.heroTitleLead")}{" "}
                  <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
                    {t("home.heroTitleAccent")}
                  </span>
                  <br />
                  <span className="text-3xl md:text-4xl lg:text-5xl">{t("home.heroTitleTail")}</span>
                </h1>

                <p className="text-lg md:text-xl text-blue-100/90 mb-8 max-w-lg">{t("home.heroDescription")}</p>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/products"
                    className="group inline-flex items-center rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 px-8 py-4 font-bold text-gray-900 shadow-xl shadow-amber-500/30 transition-all duration-300 hover:from-yellow-400 hover:to-amber-400 hover:scale-105 hover:shadow-amber-500/50"
                  >
                    {t("home.shopNow")}
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/categories"
                    className="group inline-flex items-center rounded-xl border-2 border-white/30 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10"
                  >
                    {t("home.browseCategories")}
                    <BookMarked className="ml-2 h-5 w-5 transition-transform group-hover:rotate-12" />
                  </Link>
                </div>

                <div className="mt-10 flex items-center gap-6 border-t border-white/10 pt-10">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-400" />
                    <span className="text-sm text-blue-100/80">{t("home.authenticBooks")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-green-400" />
                    <span className="text-sm text-blue-100/80">{t("home.nationwideDelivery")}</span>
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
                        <span className="text-sm font-bold">{t("home.showcaseLikes")}</span>
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
              <span className="text-sm font-medium text-white/90">{t("home.newMemberBadge")}</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t("home.ctaTitleLead")}
              <br />
              <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
                {t("home.ctaTitleAccent")}
              </span>
            </h2>

            <p className="mx-auto mb-10 max-w-2xl text-xl text-blue-100/90">{t("home.ctaDescription")}</p>

            <Link
              href="/register"
              className="group inline-flex items-center rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 px-10 py-5 font-bold text-gray-900 shadow-2xl shadow-amber-500/30 transition-all duration-300 hover:from-yellow-400 hover:to-amber-400 hover:scale-105 hover:shadow-amber-500/50"
            >
              <span className="mr-2">{t("home.registerNow")}</span>
              <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
