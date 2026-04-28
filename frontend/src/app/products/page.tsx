"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Product, Category, Brand } from "@/lib/types";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/product-card";
import { ApiStatusCard } from "@/components/ui/api-status-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, Grid3X3, Grid2X2, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAddToCart } from "@/hooks/useAddToCart";
import { useLanguage } from "@/components/providers/language-provider";
import { publicWarmupQueryOptions } from "@/lib/public-query-options";
import {
  getPublicBrands,
  getPublicCategories,
  getPublicProductsPage,
} from "@/lib/public-storefront";

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page?: number;
  number?: number;
  size: number;
}

type CollectionMode = "featured" | "new" | null;

const COPY = {
  vi: {
    home: "Trang chủ",
    products: "Sản phẩm",
    title: "Tất cả sản phẩm",
    subtitle: "Khám phá hơn",
    filterTitle: "Bộ lọc tìm kiếm",
    activeFilter: "Đang áp dụng",
    collapse: "Thu gọn",
    expand: "Mở rộng",
    searchPlaceholder: "Tìm kiếm sách...",
    categoryPlaceholder: "Danh mục",
    categoryAll: "Tất cả danh mục",
    brandPlaceholder: "Nhà xuất bản",
    brandAll: "Tất cả NXB",
    sortPlaceholder: "Sắp xếp",
    newest: "Mới nhất",
    priceAsc: "Giá: Thấp đến Cao",
    priceDesc: "Giá: Cao đến Thấp",
    nameAsc: "Tên: A-Z",
    activeFilters: "Đang lọc:",
    clearAll: "Xóa tất cả",
    results: "Tìm thấy",
    showing: "Hiển thị:",
    previous: "Trước",
    next: "Sau",
    noResultsTitle: "Không tìm thấy sản phẩm",
    noResultsDescription: "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc",
    clearFilters: "Xóa bộ lọc",
    errorTitle: "Chưa thể tải danh sách sách",
    errorDescription:
      "Hệ thống đang khởi động hoặc kết nối tạm thời gián đoạn. Vui lòng thử lại sau ít phút.",
    retry: "Thử lại",
    goHome: "Về trang chủ",
    featuredHeading: {
      title: "Sản phẩm nổi bật",
      description: "Tuyển chọn những cuốn sách đang được quan tâm nhiều nhất.",
    },
    newHeading: {
      title: "Sản phẩm mới",
      description: "Khám phá những đầu sách mới vừa có mặt trong catalog.",
    },
    allHeading: {
      title: "Tất cả sản phẩm",
      description: "Khám phá hơn",
    },
  },
  en: {
    home: "Home",
    products: "Products",
    title: "All products",
    subtitle: "Discover more than",
    filterTitle: "Search filters",
    activeFilter: "Active",
    collapse: "Collapse",
    expand: "Expand",
    searchPlaceholder: "Search books...",
    categoryPlaceholder: "Category",
    categoryAll: "All categories",
    brandPlaceholder: "Publisher",
    brandAll: "All publishers",
    sortPlaceholder: "Sort",
    newest: "Newest",
    priceAsc: "Price: Low to High",
    priceDesc: "Price: High to Low",
    nameAsc: "Name: A-Z",
    activeFilters: "Filtering by:",
    clearAll: "Clear all",
    results: "Found",
    showing: "Display:",
    previous: "Previous",
    next: "Next",
    noResultsTitle: "No products found",
    noResultsDescription: "Try changing the search keyword or filters",
    clearFilters: "Clear filters",
    errorTitle: "Books are temporarily unavailable",
    errorDescription:
      "The backend is still starting up or the connection is temporarily interrupted. Please try again in a moment.",
    retry: "Retry",
    goHome: "Go home",
    featuredHeading: {
      title: "Featured products",
      description:
        "A curated selection of the books drawing the most attention.",
    },
    newHeading: {
      title: "New products",
      description: "Discover the newest titles added to the catalog.",
    },
    allHeading: {
      title: "All products",
      description: "Discover more than",
    },
  },
} as const;

function ProductsContent() {
  const { locale } = useLanguage();
  const copy = COPY[locale];
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { addToCart, isAddingToCart } = useAddToCart("/products");
  const collectionMode: CollectionMode =
    searchParams.get("featured") === "true"
      ? "featured"
      : searchParams.get("isNew") === "true"
        ? "new"
        : null;
  const [searchKeyword, setSearchKeyword] = useState(
    searchParams.get("keyword") || "",
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("categoryId") || "all",
  );
  const [selectedBrand, setSelectedBrand] = useState(
    searchParams.get("brandId") || "all",
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "newest");
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "0"),
  );
  const [pageSize] = useState(12);
  const [gridSize, setGridSize] = useState<"2x2" | "3x3">("3x3");
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
    refetch: refetchProducts,
  } = useQuery<PageResponse<Product>>({
    ...publicWarmupQueryOptions,
    queryKey: [
      "products",
      collectionMode,
      searchKeyword,
      selectedCategory,
      selectedBrand,
      sortBy,
      currentPage,
      pageSize,
    ],
    queryFn: () =>
      getPublicProductsPage({
        collectionMode,
        keyword: searchKeyword,
        categoryId: selectedCategory,
        brandId: selectedBrand,
        sortBy,
        page: currentPage,
        size: pageSize,
      }),
  });

  const { data: categoriesList = [] } = useQuery<Category[]>({
    ...publicWarmupQueryOptions,
    queryKey: ["categories"],
    queryFn: getPublicCategories,
  });

  const { data: brandsList = [] } = useQuery<Brand[]>({
    ...publicWarmupQueryOptions,
    queryKey: ["brands"],
    queryFn: getPublicBrands,
  });

  useEffect(() => {
    if (searchParams.get("focus") !== "search") return;
    const frameId = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [searchParams]);

  const handleClearFilters = () => {
    setSearchKeyword("");
    setSelectedCategory("all");
    setSelectedBrand("all");
    setSortBy("newest");
    setCurrentPage(0);
  };

  const hasActiveFilters =
    searchKeyword ||
    (selectedCategory && selectedCategory !== "all") ||
    (selectedBrand && selectedBrand !== "all");
  const totalPages = productsData?.totalPages || 0;
  const totalElements = productsData?.totalElements || 0;
  const products = productsData?.content || [];
  const collectionHeading =
    collectionMode === "featured"
      ? copy.featuredHeading
      : collectionMode === "new"
        ? copy.newHeading
        : copy.allHeading;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50/50 to-white">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="transition-colors hover:text-red-600">
              {copy.home}
            </Link>
            <span>/</span>
            <span className="font-medium text-gray-900">{copy.products}</span>
          </div>
          <h1 className="mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
            {collectionHeading.title}
          </h1>
          <p className="text-gray-500">
            {collectionHeading.description}{" "}
            <span className="font-semibold text-red-600">{totalElements}</span>{" "}
            {locale === "vi" ? "cuốn sách chất lượng" : "books"}
          </p>
        </div>

        <div
          className={cn(
            "mb-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300",
            isFilterOpen ? "shadow-md" : "",
          )}
        >
          <div
            className="flex cursor-pointer items-center justify-between p-5 hover:bg-gray-50 transition-colors"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/30">
                <SlidersHorizontal className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-semibold text-gray-900">
                  {copy.filterTitle}
                </span>
                {hasActiveFilters && (
                  <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                    {copy.activeFilter}
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsFilterOpen(!isFilterOpen);
              }}
              className="text-gray-500"
            >
              {isFilterOpen ? copy.collapse : copy.expand}
            </Button>
          </div>

          <div
            className={cn(
              "transition-all duration-300",
              isFilterOpen
                ? "max-h-[500px] opacity-100"
                : "max-h-0 overflow-hidden opacity-0",
            )}
          >
            <div className="border-t border-gray-100 px-5 pb-5 pt-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="relative lg:col-span-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    ref={searchInputRef}
                    type="search"
                    name="search"
                    data-search-input
                    placeholder={copy.searchPlaceholder}
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && setCurrentPage(0)}
                    className="h-12 rounded-xl border-gray-200 bg-gray-50 pl-12 transition-all focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                <Select
                  value={selectedCategory}
                  onValueChange={(v) => {
                    setSelectedCategory(v);
                    setCurrentPage(0);
                  }}
                >
                  <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-gray-50 transition-colors hover:bg-gray-100">
                    <SelectValue placeholder={copy.categoryPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{copy.categoryAll}</SelectItem>
                    {categoriesList.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedBrand}
                  onValueChange={(v) => {
                    setSelectedBrand(v);
                    setCurrentPage(0);
                  }}
                >
                  <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-gray-50 transition-colors hover:bg-gray-100">
                    <SelectValue placeholder={copy.brandPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{copy.brandAll}</SelectItem>
                    {brandsList.map((b) => (
                      <SelectItem key={b.id} value={b.id.toString()}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={sortBy}
                  onValueChange={(v) => {
                    setSortBy(v);
                    setCurrentPage(0);
                  }}
                >
                  <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-gray-50 transition-colors hover:bg-gray-100">
                    <SelectValue placeholder={copy.sortPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">{copy.newest}</SelectItem>
                    <SelectItem value="price_asc">{copy.priceAsc}</SelectItem>
                    <SelectItem value="price_desc">{copy.priceDesc}</SelectItem>
                    <SelectItem value="name_asc">{copy.nameAsc}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
                  <span className="text-sm text-gray-500">
                    {copy.activeFilters}
                  </span>
                  {searchKeyword && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-sm text-red-600">
                      &ldquo;{searchKeyword}&rdquo;
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-800"
                        onClick={() => setSearchKeyword("")}
                      />
                    </span>
                  )}
                  {selectedCategory !== "all" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-sm text-green-600">
                      {
                        categoriesList.find(
                          (c) => c.id.toString() === selectedCategory,
                        )?.name
                      }
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-green-800"
                        onClick={() => setSelectedCategory("all")}
                      />
                    </span>
                  )}
                  {selectedBrand !== "all" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-sm text-purple-600">
                      {
                        brandsList.find(
                          (b) => b.id.toString() === selectedBrand,
                        )?.name
                      }
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-purple-800"
                        onClick={() => setSelectedBrand("all")}
                      />
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="ml-auto text-gray-500 hover:text-red-600"
                  >
                    {copy.clearAll}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "h-3 w-3 rounded-full",
                !productsLoading && products.length > 0
                  ? "bg-green-500 animate-pulse"
                  : "bg-gray-300",
              )}
            />
            <p className="text-gray-600">
              {copy.results}{" "}
              <span className="font-bold text-gray-900">{totalElements}</span>{" "}
              {locale === "vi" ? "sản phẩm" : "products"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-gray-500 sm:inline">
              {copy.showing}
            </span>
            <div className="flex items-center rounded-xl bg-gray-100 p-1">
              <Button
                variant={gridSize === "3x3" ? "default" : "ghost"}
                size="icon"
                onClick={() => setGridSize("3x3")}
                className={cn(
                  "h-8 w-8 rounded-lg transition-all",
                  gridSize === "3x3" && "shadow-md",
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={gridSize === "2x2" ? "default" : "ghost"}
                size="icon"
                onClick={() => setGridSize("2x2")}
                className={cn(
                  "h-8 w-8 rounded-lg transition-all",
                  gridSize === "2x2" && "shadow-md",
                )}
              >
                <Grid2X2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {productsError ? (
          <ApiStatusCard
            title={copy.errorTitle}
            description={copy.errorDescription}
            retryLabel={copy.retry}
            onRetry={() => void refetchProducts()}
            primaryHref="/"
            primaryLabel={copy.goHome}
          />
        ) : productsLoading ? (
          <div
            className={
              gridSize === "3x3"
                ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            }
          >
            {Array.from({ length: pageSize }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                <Skeleton className="h-80 w-full rounded-none" />
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
              <Search className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              {copy.noResultsTitle}
            </h3>
            <p className="mb-6 text-gray-500">{copy.noResultsDescription}</p>
            {hasActiveFilters && (
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="rounded-xl"
              >
                {copy.clearFilters}
              </Button>
            )}
          </div>
        ) : (
          <div
            className={
              gridSize === "3x3"
                ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            }
          >
            {products.map((product, index) => (
              <div
                key={product.id}
                className="animate-in fade-in slide-in-from-bottom-4"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: "backwards",
                }}
              >
                <ProductCard
                  product={product}
                  onAddToCart={addToCart}
                  isAddingToCart={isAddingToCart}
                />
              </div>
            ))}
          </div>
        )}

        {!productsLoading &&
          !productsError &&
          products.length > 0 &&
          totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="h-10 rounded-xl px-4"
              >
                {copy.previous}
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage < 3) {
                    pageNum = i;
                  } else if (currentPage > totalPages - 3) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "h-10 w-10 rounded-xl transition-all",
                        currentPage === pageNum &&
                          "shadow-lg shadow-red-500/30",
                      )}
                    >
                      {pageNum + 1}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage >= totalPages - 1}
                className="h-10 rounded-xl px-4"
              >
                {copy.next}
              </Button>
            </div>
          )}
      </main>
      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50/50 to-white">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8">
            <Skeleton className="mb-2 h-10 w-64" />
            <Skeleton className="mb-8 h-5 w-48" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm"
                >
                  <Skeleton className="h-80 w-full rounded-none" />
                  <div className="space-y-3 p-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
