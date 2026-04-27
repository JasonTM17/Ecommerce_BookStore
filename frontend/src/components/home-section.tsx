"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { ProductCardSkeleton } from "@/components/product-skeleton";
import { useLanguage } from "@/components/providers/language-provider";
import { ApiStatusCard } from "@/components/ui/api-status-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddToCart } from "@/hooks/useAddToCart";
import { apiPublic } from "@/lib/api";
import { publicWarmupQueryOptions } from "@/lib/public-query-options";
import { Category, Product } from "@/lib/types";

const CATEGORY_ACCENTS = [
  "bg-[#0b0b0b]",
  "bg-[#777169]",
  "bg-[#b8aa9d]",
  "bg-[#d9cec3]",
  "bg-[#4e4e4e]",
  "bg-[#c8b9aa]",
  "bg-[#1f1f1f]",
  "bg-[#a49486]",
];

const SECTION_COPY = {
  vi: {
    errorTitle: "Dữ liệu đang tạm thời chưa sẵn sàng",
    errorDescription:
      "Hệ thống đang khởi động hoặc đồng bộ dữ liệu. Vui lòng thử lại sau ít phút.",
    retry: "Thử lại",
    categoryDescription:
      "Khám phá các thể loại sách phong phú từ văn học, khoa học đến kỹ năng sống.",
  },
  en: {
    errorTitle: "Store data is temporarily unavailable",
    errorDescription:
      "The backend is still warming up or syncing data. Please try again in a moment.",
    retry: "Try again",
    categoryDescription:
      "Explore a broad mix of categories, from literature and science to practical self-growth.",
  },
} as const;

function SectionHeader({
  kicker,
  title,
  children,
  href,
  linkLabel,
}: {
  kicker: string;
  title: string;
  children?: React.ReactNode;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="eleven-kicker mb-2">{kicker}</p>
        <h2 className="eleven-display text-3xl leading-tight md:text-4xl">
          {title}
        </h2>
        {children ? (
          <div className="eleven-body mt-3 max-w-2xl">{children}</div>
        ) : null}
      </div>

      {href && linkLabel ? (
        <Link
          href={href}
          className="eleven-pill-white group inline-flex w-fit items-center gap-2 px-4 py-2 text-sm font-medium transition-transform hover:scale-[1.02]"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      ) : null}
    </div>
  );
}

export function FeaturedProducts() {
  const { t, locale } = useLanguage();
  const sectionCopy = SECTION_COPY[locale];
  const { addToCart, isAddingToCart } = useAddToCart("/");
  const {
    data: products,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    ...publicWarmupQueryOptions,
    queryKey: ["featured-products"],
    queryFn: async () => {
      const response = await apiPublic.get("/products/featured");
      return response.data as Product[];
    },
  });

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <Skeleton className="mb-2 h-9 w-48" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-10 w-28" />
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <ApiStatusCard
            compact
            title={sectionCopy.errorTitle}
            description={sectionCopy.errorDescription}
            retryLabel={sectionCopy.retry}
            onRetry={() => void refetch()}
            primaryHref="/products"
            primaryLabel={t("common.viewAll")}
          />
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto max-w-7xl px-4">
        <SectionHeader
          kicker={t("home.showcaseLikes")}
          title={t("common.bestseller")}
          href="/products?featured=true"
          linkLabel={t("common.viewAll")}
        />
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {products.slice(0, 8).map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
              isAddingToCart={isAddingToCart}
              imagePriority={index < 2}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function NewProducts() {
  const { t, locale } = useLanguage();
  const sectionCopy = SECTION_COPY[locale];
  const { addToCart, isAddingToCart } = useAddToCart("/");
  const {
    data: products,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    ...publicWarmupQueryOptions,
    queryKey: ["new-products"],
    queryFn: async () => {
      const response = await apiPublic.get("/products/new");
      return response.data as Product[];
    },
  });

  if (isLoading) {
    return (
      <section className="bg-[#f6f6f6] py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <Skeleton className="mb-2 h-9 w-48" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Skeleton className="h-10 w-28" />
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="bg-[#f6f6f6] py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <ApiStatusCard
            compact
            title={sectionCopy.errorTitle}
            description={sectionCopy.errorDescription}
            retryLabel={sectionCopy.retry}
            onRetry={() => void refetch()}
            primaryHref="/products"
            primaryLabel={t("common.viewAll")}
          />
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#f6f6f6] py-16">
      <div className="container mx-auto max-w-7xl px-4">
        <SectionHeader
          kicker={t("home.ctaTitleAccent")}
          title={t("common.newArrival")}
          href="/products?isNew=true"
          linkLabel={t("common.viewAll")}
        />
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {products.slice(0, 8).map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
              isAddingToCart={isAddingToCart}
              imagePriority={index < 2}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function CategorySection() {
  const { t, locale } = useLanguage();
  const sectionCopy = SECTION_COPY[locale];
  const {
    data: categories,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    ...publicWarmupQueryOptions,
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await apiPublic.get("/categories/root");
      return response.data as Category[];
    },
  });

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-10">
            <Skeleton className="mb-2 h-9 w-48" />
            <Skeleton className="h-5 w-36" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-36 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <ApiStatusCard
            compact
            title={sectionCopy.errorTitle}
            description={sectionCopy.errorDescription}
            retryLabel={sectionCopy.retry}
            onRetry={() => void refetch()}
            primaryHref="/categories"
            primaryLabel={t("nav.categories")}
          />
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="eleven-kicker mb-3">{t("home.libraryBadge")}</p>
          <h2 className="eleven-display mb-4 text-3xl leading-tight md:text-4xl">
            {t("nav.categories")}
          </h2>
          <p className="eleven-body">{sectionCopy.categoryDescription}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/categories?id=${category.id}`}
              className="eleven-surface group relative h-40 overflow-hidden rounded-3xl p-5 transition-transform duration-300 hover:-translate-y-1"
            >
              <div
                className={`absolute right-5 top-5 h-3 w-10 rounded-full ${
                  CATEGORY_ACCENTS[index % CATEGORY_ACCENTS.length]
                }`}
              />

              <div className="flex h-full flex-col justify-end">
                <h3 className="pr-10 text-xl font-light leading-tight text-black">
                  {category.name}
                </h3>
                {typeof category.productCount === "number" &&
                  category.productCount > 0 && (
                    <p className="eleven-muted mt-3 text-sm">
                      {category.productCount.toLocaleString(
                        locale === "vi" ? "vi-VN" : "en-US",
                      )}{" "}
                      {locale === "vi" ? "sản phẩm" : "titles"}
                    </p>
                  )}
              </div>

              <div className="eleven-pill-stone absolute bottom-5 right-5 flex h-9 w-9 items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <ArrowRight className="h-4 w-4 text-black" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
