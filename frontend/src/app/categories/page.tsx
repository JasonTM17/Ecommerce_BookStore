"use client";

import { Suspense, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Category, Product } from "@/lib/types";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  ChevronRight,
  Filter,
  FlaskConical,
  Globe,
  Laptop,
  Palette,
  Stethoscope,
  Trophy,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAddToCart } from "@/hooks/useAddToCart";
import { useLanguage } from "@/components/providers/language-provider";
import { publicWarmupQueryOptions } from "@/lib/public-query-options";
import {
  getPublicCategories,
  getPublicProductsByCategory,
} from "@/lib/public-storefront";

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page?: number;
  number?: number;
  size: number;
}

const CATEGORY_GRADIENTS = [
  "from-red-600 to-orange-600",
  "from-purple-600 to-pink-600",
  "from-green-600 to-emerald-600",
  "from-orange-600 to-amber-600",
  "from-red-600 to-rose-600",
  "from-stone-700 to-gray-900",
  "from-rose-600 to-red-600",
  "from-yellow-600 to-orange-600",
];

const COPY = {
  vi: {
    home: "Trang chủ",
    title: "Danh Mục Sách",
    allBooks: "Tất cả sách",
    pageTitle: "Danh Mục Sách",
    pageDescription: (count: number) => `${count} sản phẩm trong danh mục`,
    emptyCatalog: "Khám phá hơn 1000 cuốn sách từ mọi thể loại",
    chooseCategory: "Chọn danh mục để xem sản phẩm",
    chooseCategoryDescription:
      "Nhấp vào một danh mục bên trái để xem các sản phẩm",
    noProducts: "Không có sản phẩm",
    noProductsDescription: "Danh mục này chưa có sản phẩm nào",
    viewAll: "Xem tất cả sách",
    allProducts: "Tất cả sách",
    productUnit: "sản phẩm",
    bookUnit: "sách",
    previous: "Trước",
    next: "Sau",
  },
  en: {
    home: "Home",
    title: "Book Categories",
    allBooks: "All books",
    pageTitle: "Book Categories",
    pageDescription: (count: number) => `${count} products in this category`,
    emptyCatalog: "Discover more than 1000 books across every genre",
    chooseCategory: "Choose a category to view products",
    chooseCategoryDescription:
      "Click a category on the left to see its products",
    noProducts: "No products found",
    noProductsDescription: "This category does not have any products yet",
    viewAll: "View all books",
    allProducts: "All books",
    productUnit: "products",
    bookUnit: "books",
    previous: "Previous",
    next: "Next",
  },
} as const;

function CategoriesContent() {
  const { locale } = useLanguage();
  const copy = COPY[locale];
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart, isAddingToCart } = useAddToCart("/categories");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    searchParams.get("id") || null,
  );
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 12;

  const { data: categoriesData = [], isLoading: categoriesLoading } = useQuery<
    Category[]
  >({
    ...publicWarmupQueryOptions,
    queryKey: ["categories-all"],
    queryFn: getPublicCategories,
  });

  const { data: productsData, isLoading: productsLoading } = useQuery<
    PageResponse<Product>
  >({
    ...publicWarmupQueryOptions,
    queryKey: ["category-products", selectedCategoryId, currentPage, pageSize],
    queryFn: () =>
      getPublicProductsByCategory(selectedCategoryId, currentPage, pageSize),
    enabled: !!selectedCategoryId,
  });

  const selectedCategory = categoriesData.find(
    (category) => category.id.toString() === selectedCategoryId,
  );
  const products = productsData?.content || [];
  const totalPages = productsData?.totalPages || 0;
  const totalElements = productsData?.totalElements || 0;
  const rootCategories = categoriesData.filter(
    (category) => !category.parentId,
  );

  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategoryId(categoryId.toString());
    setCurrentPage(0);
    router.push(`/categories?id=${categoryId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50/50 to-white">
      <Header />

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="transition-colors hover:text-red-600">
            {copy.home}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-gray-900">{copy.title}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-white/50 bg-white/70 p-6 shadow-sm backdrop-blur-md">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/30">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  {copy.title}
                </h2>
              </div>

              {categoriesLoading ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedCategoryId(null);
                      router.push("/categories");
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300",
                      !selectedCategoryId
                        ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30"
                        : "text-gray-700 hover:bg-gray-50",
                    )}
                  >
                    <BookOpen className="h-5 w-5" />
                    <span className="font-medium">{copy.allBooks}</span>
                  </button>

                  {rootCategories.map((category, index) => (
                    <div key={category.id}>
                      <button
                        onClick={() => handleCategoryClick(category.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300",
                          selectedCategoryId === category.id.toString()
                            ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30"
                            : "text-gray-700 hover:bg-gray-50",
                        )}
                      >
                        {(() => {
                          const icons = [
                            BookOpen,
                            FlaskConical,
                            Briefcase,
                            Palette,
                            Stethoscope,
                            Laptop,
                            Globe,
                            Trophy,
                          ];
                          const Icon = icons[index % 8];
                          return <Icon className="h-5 w-5" />;
                        })()}
                        <div className="flex-1 text-left">
                          <span className="block font-medium">
                            {category.name}
                          </span>
                          {typeof category.productCount === "number" &&
                            category.productCount > 0 && (
                              <span
                                className={cn(
                                  "text-xs",
                                  selectedCategoryId === category.id.toString()
                                    ? "text-white/70"
                                    : "text-gray-400",
                                )}
                              >
                                {category.productCount} {copy.productUnit}
                              </span>
                            )}
                        </div>
                      </button>

                      {category.subcategories &&
                        category.subcategories.length > 0 && (
                          <div className="ml-6 mt-1 space-y-1">
                            {category.subcategories.map((subcategory) => (
                              <button
                                key={subcategory.id}
                                onClick={() =>
                                  handleCategoryClick(subcategory.id)
                                }
                                className={cn(
                                  "flex w-full items-center justify-between gap-3 rounded-lg px-4 py-2 text-sm transition-all duration-300",
                                  selectedCategoryId ===
                                    subcategory.id.toString()
                                    ? "bg-red-100 font-medium text-red-700"
                                    : "text-gray-600 hover:bg-gray-50",
                                )}
                              >
                                <span className="flex min-w-0 items-center gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                                  <span className="truncate">
                                    {subcategory.name}
                                  </span>
                                </span>
                                {typeof subcategory.productCount === "number" &&
                                  subcategory.productCount > 0 && (
                                    <span
                                      className={cn(
                                        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                                        selectedCategoryId ===
                                          subcategory.id.toString()
                                          ? "bg-red-200 text-red-700"
                                          : "bg-gray-100 text-gray-500",
                                      )}
                                    >
                                      {subcategory.productCount} {copy.bookUnit}
                                    </span>
                                  )}
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-8">
              <h1 className="mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
                {selectedCategory ? selectedCategory.name : copy.allProducts}
              </h1>
              <p className="text-gray-500">
                {selectedCategory
                  ? copy.pageDescription(totalElements)
                  : copy.emptyCatalog}
              </p>
            </div>

            {!selectedCategoryId && (
              <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {rootCategories.map((category, index) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className="group relative h-40 overflow-hidden rounded-2xl transition-all duration-300 hover:ring-2 hover:ring-red-500/50 hover:shadow-lg"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${
                        CATEGORY_GRADIENTS[index % CATEGORY_GRADIENTS.length]
                      } transition-transform duration-500 group-hover:scale-110`}
                    />
                    <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/10" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white">
                      <h3 className="text-center text-lg font-bold transition-transform group-hover:scale-105">
                        {category.name}
                      </h3>
                      {typeof category.productCount === "number" &&
                        category.productCount > 0 && (
                          <p className="mt-2 rounded-full bg-white/20 px-3 py-1 text-sm text-white/80 backdrop-blur-sm">
                            {category.productCount} {copy.productUnit}
                          </p>
                        )}
                    </div>
                    <div className="absolute right-3 top-3 translate-x-2 transform rounded-full bg-white/20 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                      <div className="flex h-8 w-8 items-center justify-center">
                        <ArrowRight className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedCategoryId ? (
              <>
                {productsLoading ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, index) => (
                      <div
                        key={index}
                        className="overflow-hidden rounded-2xl bg-white shadow-sm"
                      >
                        <Skeleton className="h-72 w-full rounded-none" />
                        <div className="space-y-3 p-4">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-6 w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <div className="rounded-2xl border border-gray-100 bg-white p-16 text-center shadow-sm">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                      <BookOpen className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900">
                      {copy.noProducts}
                    </h3>
                    <p className="mb-6 text-gray-500">
                      {copy.noProductsDescription}
                    </p>
                    <Button
                      onClick={() => setSelectedCategoryId(null)}
                      variant="outline"
                      className="rounded-xl"
                    >
                      {copy.viewAll}
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onAddToCart={addToCart}
                          isAddingToCart={isAddingToCart}
                        />
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="mt-12 flex max-w-full flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                        <Button
                          variant="outline"
                          onClick={() =>
                            setCurrentPage((page) => Math.max(0, page - 1))
                          }
                          disabled={currentPage === 0}
                          className="h-9 rounded-xl px-3 text-xs sm:h-10 sm:px-4 sm:text-sm"
                        >
                          {copy.previous}
                        </Button>

                        <div className="flex items-center gap-1">
                          {Array.from(
                            { length: Math.min(5, totalPages) },
                            (_, index) => {
                              let pageNumber;
                              if (totalPages <= 5) {
                                pageNumber = index;
                              } else if (currentPage < 3) {
                                pageNumber = index;
                              } else if (currentPage > totalPages - 3) {
                                pageNumber = totalPages - 5 + index;
                              } else {
                                pageNumber = currentPage - 2 + index;
                              }

                              return (
                                <Button
                                  key={pageNumber}
                                  variant={
                                    currentPage === pageNumber
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() => setCurrentPage(pageNumber)}
                                  className={cn(
                                    "h-9 w-9 rounded-xl text-xs sm:h-10 sm:w-10 sm:text-sm",
                                    currentPage === pageNumber &&
                                      "shadow-lg shadow-red-500/30",
                                  )}
                                >
                                  {pageNumber + 1}
                                </Button>
                              );
                            },
                          )}
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage((page) => page + 1)}
                          disabled={currentPage >= totalPages - 1}
                          className="h-9 rounded-xl px-3 text-xs sm:h-10 sm:px-4 sm:text-sm"
                        >
                          {copy.next}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-red-100 bg-gradient-to-r from-red-50 to-orange-50 p-8 text-center">
                <Filter className="mx-auto mb-4 h-12 w-12 text-red-400" />
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  {copy.chooseCategory}
                </h3>
                <p className="text-gray-500">
                  {copy.chooseCategoryDescription}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header />
          <main className="container mx-auto flex-1 px-4 py-8">
            <Skeleton className="mb-6 h-10 w-64" />
            <div className="grid gap-8 lg:grid-cols-4">
              <div className="lg:col-span-1">
                <Skeleton className="h-96 w-full rounded-2xl" />
              </div>
              <div className="lg:col-span-3">
                <Skeleton className="mb-2 h-10 w-48" />
                <Skeleton className="mb-8 h-5 w-64" />
                <div className="grid grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <Skeleton key={index} className="h-80 w-full rounded-2xl" />
                  ))}
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <CategoriesContent />
    </Suspense>
  );
}
