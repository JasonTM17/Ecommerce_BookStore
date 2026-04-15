"use client";

import { useQuery } from "@tanstack/react-query";
import { apiPublic } from "@/lib/api";
import { Product, Category } from "@/lib/types";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { ProductCardSkeleton } from "@/components/product-skeleton";
import { ApiStatusCard } from "@/components/ui/api-status-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddToCart } from "@/hooks/useAddToCart";
import { useLanguage } from "@/components/providers/language-provider";
import { publicWarmupQueryOptions } from "@/lib/public-query-options";
import { ArrowRight } from "lucide-react";

const CATEGORY_GRADIENTS = [
  "from-blue-600 to-blue-700",
  "from-purple-600 to-pink-600",
  "from-green-600 to-emerald-600",
  "from-orange-600 to-amber-600",
  "from-red-600 to-rose-600",
  "from-indigo-600 to-violet-600",
  "from-teal-600 to-cyan-600",
  "from-yellow-600 to-orange-600",
];

const SECTION_COPY = {
  vi: {
    errorTitle: "Dữ liệu đang tạm thời chưa sẵn sàng",
    errorDescription:
      "Hệ thống đang khởi động hoặc đồng bộ dữ liệu. Vui lòng thử lại sau ít phút.",
    retry: "Thử lại",
  },
  en: {
    errorTitle: "Store data is temporarily unavailable",
    errorDescription:
      "The backend is still warming up or syncing data. Please try again in a moment.",
    retry: "Try again",
  },
} as const;

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
        <div className="container mx-auto px-4">
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
        <div className="container mx-auto px-4">
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
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-3xl font-bold text-transparent">
              {t("common.bestseller")}
            </h2>
            <p className="mt-1 text-gray-500">{t("home.showcaseLikes")}</p>
          </div>
          <Link
            href="/products?featured=true"
            className="group flex items-center gap-2 font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            {t("common.viewAll")}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
              isAddingToCart={isAddingToCart}
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
      <section className="bg-gradient-to-b from-gray-50/50 to-white py-16">
        <div className="container mx-auto px-4">
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
      <section className="bg-gradient-to-b from-gray-50/50 to-white py-16">
        <div className="container mx-auto px-4">
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
    <section className="bg-gradient-to-b from-gray-50/50 to-white py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-3xl font-bold text-transparent">
              {t("common.newArrival")}
            </h2>
            <p className="mt-1 text-gray-500">{t("home.ctaTitleAccent")}</p>
          </div>
          <Link
            href="/products?isNew=true"
            className="group flex items-center gap-2 font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            {t("common.viewAll")}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
              isAddingToCart={isAddingToCart}
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
        <div className="container mx-auto px-4">
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
        <div className="container mx-auto px-4">
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
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-3xl font-bold text-transparent">
            {t("nav.categories")}
          </h2>
          <p className="mx-auto max-w-xl text-gray-500">
            {locale === "vi"
              ? "Khám phá các thể loại sách phong phú từ văn học, khoa học đến kỹ năng sống."
              : "Explore a broad mix of categories, from literature and science to practical self-growth."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/categories?id=${category.id}`}
              className="group relative h-36 overflow-hidden rounded-2xl"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${CATEGORY_GRADIENTS[index % CATEGORY_GRADIENTS.length]} transition-transform duration-500 group-hover:scale-110`}
              />
              <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/10" />
              <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white">
                <h3 className="text-center text-lg font-bold transition-transform duration-300 group-hover:scale-105">
                  {category.name}
                </h3>
                {typeof category.productCount === "number" &&
                  category.productCount > 0 && (
                    <p className="mt-2 rounded-full bg-white/20 px-3 py-1 text-sm text-white/80 backdrop-blur-sm">
                      {category.productCount.toLocaleString(
                        locale === "vi" ? "vi-VN" : "en-US",
                      )}{" "}
                      {locale === "vi" ? "sản phẩm" : "titles"}
                    </p>
                  )}
              </div>

              <div className="absolute right-3 top-3 flex h-8 w-8 translate-x-2 items-center justify-center rounded-full bg-white/20 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                <ArrowRight className="h-4 w-4 text-white" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
