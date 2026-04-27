"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  CreditCard,
  Shield,
  Sparkles,
  Truck,
} from "lucide-react";
import {
  CategorySection,
  FeaturedProducts,
  NewProducts,
} from "@/components/home-section";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { useLanguage } from "@/components/providers/language-provider";
import { apiPublic } from "@/lib/api";
import { publicWarmupQueryOptions } from "@/lib/public-query-options";
import type { Category } from "@/lib/types";

type ShowcaseGenre = {
  key: string;
  labelKey: string;
  aliases: string[];
};

const showcaseGenres: ShowcaseGenre[] = [
  {
    key: "tieu-thuyet",
    labelKey: "home.genreNovel",
    aliases: ["tieu-thuyet", "tieu-thuyet-van-hoc", "tieu-thuyet-kinh-dien"],
  },
  {
    key: "khoa-hoc",
    labelKey: "home.genreScience",
    aliases: ["khoa-hoc", "khoa-hoc-tu-nhien"],
  },
  {
    key: "ky-nang",
    labelKey: "home.genreSkills",
    aliases: ["phat-trien-ban-than", "ky-nang-song"],
  },
  {
    key: "lich-su",
    labelKey: "home.genreHistory",
    aliases: ["lich-su"],
  },
];

const shelfTones = [
  "bg-[#111111]",
  "bg-[#777169]",
  "bg-[#c9bfb4]",
  "bg-[#e8dfd6]",
  "bg-[#2f2f2f]",
  "bg-[#b7a99b]",
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
    ...(category.subcategories
      ? flattenCategories(category.subcategories)
      : []),
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
      genre.aliases.includes(normalizeKey(category.name)),
    );

    return {
      ...genre,
      label: t(genre.labelKey),
      href: matchedCategory
        ? `/categories?id=${matchedCategory.id}`
        : "/categories",
      countLabel:
        typeof matchedCategory?.productCount === "number" &&
        matchedCategory.productCount > 0
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
    },
    {
      icon: Shield,
      title: t("home.featureAuthenticTitle"),
      subtitle: t("home.featureAuthenticSubtitle"),
    },
    {
      icon: CreditCard,
      title: t("home.featurePaymentTitle"),
      subtitle: t("home.featurePaymentSubtitle"),
    },
    {
      icon: BookOpen,
      title: t("home.featureReturnsTitle"),
      subtitle: t("home.featureReturnsSubtitle"),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-black/[0.05] bg-[#fffdfb]">
          <div className="container relative mx-auto max-w-7xl px-4 py-16 md:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
              <div
                className={`transition-all duration-700 ${
                  mounted
                    ? "translate-y-0 opacity-100"
                    : "translate-y-6 opacity-0"
                }`}
              >
                <div className="eleven-pill-stone mb-7 inline-flex items-center gap-2 px-4 py-2">
                  <Sparkles className="h-4 w-4 text-black" />
                  <span className="text-sm font-medium text-black">
                    {t("home.libraryBadge")}
                  </span>
                </div>

                <h1 className="eleven-display max-w-4xl text-5xl leading-[1.04] md:text-6xl lg:text-7xl">
                  {t("home.heroTitleLead")}{" "}
                  <span className="italic text-[#777169]">
                    {t("home.heroTitleAccent")}
                  </span>{" "}
                  <br />
                  <span>{t("home.heroTitleTail")}</span>
                </h1>

                <p className="eleven-body mt-7 max-w-2xl text-lg leading-8 md:text-xl">
                  {t("home.heroDescription")}
                </p>

                <div className="mt-9 flex flex-wrap gap-3">
                  <Link
                    href="/products"
                    className="eleven-pill-black group inline-flex items-center px-6 py-3 text-[15px] font-medium transition-transform duration-300 hover:scale-[1.02]"
                  >
                    {t("home.shopNow")}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/categories"
                    className="eleven-pill-white group inline-flex items-center px-6 py-3 text-[15px] font-medium transition-transform duration-300 hover:scale-[1.02]"
                  >
                    {t("home.browseCategories")}
                    <BookMarked className="ml-2 h-4 w-4 transition-transform group-hover:rotate-6" />
                  </Link>
                </div>

                <div className="mt-10 grid max-w-2xl gap-3 border-t border-black/[0.06] pt-8 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-black" />
                    <span className="eleven-muted text-sm">
                      {t("home.authenticBooks")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-black" />
                    <span className="eleven-muted text-sm">
                      {t("home.nationwideDelivery")}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`transition-all delay-150 duration-700 ${
                  mounted
                    ? "translate-y-0 opacity-100"
                    : "translate-y-6 opacity-0"
                }`}
              >
                <div className="eleven-surface overflow-hidden rounded-[28px]">
                  <div className="border-b border-black/[0.06] bg-[#f5f2ef]/80 px-6 py-5">
                    <p className="eleven-kicker">{t("nav.categories")}</p>
                    <p className="mt-2 text-2xl font-light text-black">
                      {t("home.showcaseLikes")}
                    </p>
                  </div>

                  <div className="grid gap-0 divide-y divide-black/[0.06]">
                    {showcaseCards.map((genre) => (
                      <Link
                        key={genre.key}
                        href={genre.href}
                        data-testid={`hero-showcase-${genre.key}`}
                        className="group flex items-center justify-between px-6 py-5 transition-colors hover:bg-[#f8f6f3]"
                      >
                        <div>
                          <p className="text-base font-medium text-black">
                            {genre.label}
                          </p>
                          <p className="eleven-muted mt-1 text-sm">
                            {genre.countLabel}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-[#777169] transition-transform group-hover:translate-x-1 group-hover:text-black" />
                      </Link>
                    ))}
                  </div>

                  <div className="bg-white px-6 py-7">
                    <div className="flex h-32 items-end gap-2 rounded-3xl bg-[#f5f2ef]/70 px-5 py-4">
                      {shelfTones.map((tone, index) => (
                        <div
                          key={`${tone}-${index}`}
                          className={`${tone} rounded-t-full shadow-[rgba(0,0,0,0.06)_0_0_0_1px]`}
                          style={{
                            height: `${58 + index * 10}px`,
                            width: `${28 + (index % 2) * 8}px`,
                          }}
                        />
                      ))}
                      <div className="ml-auto flex h-20 w-20 items-center justify-center rounded-full bg-black text-white shadow-[rgba(0,0,0,0.14)_0_10px_24px]">
                        <BookOpen className="h-8 w-8" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-12">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featureHighlights.map((feature) => (
                <div
                  key={feature.title}
                  data-testid="hero-feature-highlight"
                  className="eleven-surface flex items-center gap-4 rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="eleven-warm-surface flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                    <feature.icon className="h-5 w-5 text-black" />
                  </div>
                  <div>
                    <h3 className="font-medium text-black">{feature.title}</h3>
                    <p className="eleven-muted mt-1 text-sm">
                      {feature.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CategorySection />
        <FeaturedProducts />
        <NewProducts />

        <section className="bg-white px-4 py-20">
          <div className="eleven-warm-surface mx-auto max-w-6xl rounded-[32px] px-6 py-16 text-center md:px-12">
            <div className="eleven-pill-white mb-6 inline-flex items-center gap-2 px-4 py-2">
              <Sparkles className="h-4 w-4 text-black" />
              <span className="text-sm font-medium text-black">
                {t("home.newMemberBadge")}
              </span>
            </div>

            <h2 className="eleven-display mx-auto max-w-3xl text-4xl leading-tight md:text-5xl">
              {t("home.ctaTitleLead")} <br />
              <span className="italic text-[#777169]">
                {t("home.ctaTitleAccent")}
              </span>
            </h2>

            <p className="eleven-body mx-auto mt-6 max-w-2xl text-lg leading-8">
              {t("home.ctaDescription")}
            </p>

            <Link
              href="/register"
              className="eleven-pill-black group mt-9 inline-flex items-center px-7 py-3 text-[15px] font-medium transition-transform duration-300 hover:scale-[1.02]"
            >
              <span className="mr-2">{t("home.registerNow")}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
