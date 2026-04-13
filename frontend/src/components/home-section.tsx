"use client";

import { useQuery } from "@tanstack/react-query";
import { apiPublic } from "@/lib/api";
import { Product, Category } from "@/lib/types";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { ProductCardSkeleton } from "@/components/product-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddToCart } from "@/hooks/useAddToCart";
import { useLanguage } from "@/components/providers/language-provider";
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

export function FeaturedProducts() {
  const { t } = useLanguage();
  const { addToCart, isAddingToCart } = useAddToCart("/");
  const { data: products, isLoading } = useQuery({
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
          <div className="flex items-center justify-between mb-10">
            <div>
              <Skeleton className="h-9 w-48 mb-2" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-10 w-28" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
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
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {t("common.bestseller")}
            </h2>
            <p className="text-gray-500 mt-1">{t("home.showcaseLikes")}</p>
          </div>
          <Link
            href="/products?featured=true"
            className="group flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            {t("common.viewAll")}
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} isAddingToCart={isAddingToCart} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function NewProducts() {
  const { t } = useLanguage();
  const { addToCart, isAddingToCart } = useAddToCart("/");
  const { data: products, isLoading } = useQuery({
    queryKey: ["new-products"],
    queryFn: async () => {
      const response = await apiPublic.get("/products/new");
      return response.data as Product[];
    },
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <Skeleton className="h-9 w-48 mb-2" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Skeleton className="h-10 w-28" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50/50 to-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {t("common.newArrival")}
            </h2>
            <p className="text-gray-500 mt-1">{t("home.ctaTitleAccent")}</p>
          </div>
          <Link
            href="/products?isNew=true"
            className="group flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            {t("common.viewAll")}
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} isAddingToCart={isAddingToCart} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function CategorySection() {
  const { t, locale } = useLanguage();
  const { data: categories, isLoading } = useQuery({
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
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-36" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-36 w-full rounded-2xl" />
            ))}
          </div>
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
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
            {t("nav.categories")}
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            {locale === "vi"
              ? "Khám phá các thể loại sách phong phú từ văn học, khoa học đến kỹ năng sống."
              : "Explore a broad mix of categories, from literature and science to practical self-growth."}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <Link key={category.id} href={`/categories?id=${category.id}`} className="group relative h-36 rounded-2xl overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${CATEGORY_GRADIENTS[index % CATEGORY_GRADIENTS.length]} transition-transform duration-500 group-hover:scale-110`} />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                <h3 className="font-bold text-lg text-center group-hover:scale-105 transition-transform duration-300">
                  {category.name}
                </h3>
                {typeof category.productCount === "number" && category.productCount > 0 && (
                  <p className="text-sm text-white/80 mt-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    {category.productCount.toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}{" "}
                    {locale === "vi" ? "sản phẩm" : "titles"}
                  </p>
                )}
              </div>

              <div className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <ArrowRight className="h-4 w-4 text-white" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
