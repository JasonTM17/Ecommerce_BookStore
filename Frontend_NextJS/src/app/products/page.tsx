"use client";

import { useState, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Product, Category, Brand } from "@/lib/types";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/product-card";
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
import { Search, SlidersHorizontal, Grid3X3, Grid2X2, X, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page?: number;
  number?: number;
  size: number;
}

/** Backend trả về List cho /categories và /brands; một số endpoint khác có thể trả PageResponse. */
function normalizeList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "content" in data && Array.isArray((data as PageResponse<T>).content)) {
    return (data as PageResponse<T>).content;
  }
  return [];
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get("keyword") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("categoryId") || "all");
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get("brandId") || "all");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "newest");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "0"));
  const [pageSize] = useState(12);
  const [gridSize, setGridSize] = useState<"2x2" | "3x3">("3x3");
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  const { data: productsData, isLoading: productsLoading } = useQuery<PageResponse<Product>>({
    queryKey: ["products", searchKeyword, selectedCategory, selectedBrand, sortBy, currentPage, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchKeyword) params.append("keyword", searchKeyword);
      if (selectedCategory && selectedCategory !== "all") params.append("categoryId", selectedCategory);
      if (selectedBrand && selectedBrand !== "all") params.append("brandId", selectedBrand);
      params.append("sortBy", sortBy);
      params.append("page", currentPage.toString());
      params.append("size", pageSize.toString());
      const response = await api.get(`/products?${params.toString()}`);
      return response.data;
    },
  });

  const { data: categoriesList = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get("/categories");
      return normalizeList<Category>(response.data);
    },
  });

  const { data: brandsList = [] } = useQuery<Brand[]>({
    queryKey: ["brands"],
    queryFn: async () => {
      const response = await api.get("/brands");
      return normalizeList<Brand>(response.data);
    },
  });

  const handleClearFilters = () => {
    setSearchKeyword("");
    setSelectedCategory("all");
    setSelectedBrand("all");
    setSortBy("newest");
    setCurrentPage(0);
  };

  const hasActiveFilters = searchKeyword || (selectedCategory && selectedCategory !== "all") || (selectedBrand && selectedBrand !== "all");
  const totalPages = productsData?.totalPages || 0;
  const totalElements = productsData?.totalElements || 0;
  const products = productsData?.content || [];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50/50 to-white">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Sản phẩm</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Tất cả sản phẩm
          </h1>
          <p className="text-gray-500">Khám phá hơn <span className="font-semibold text-blue-600">{totalElements}</span> cuốn sách hay nhất</p>
        </div>

        {/* Filters */}
        <div className={cn(
          "bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-hidden transition-all duration-300",
          isFilterOpen ? "shadow-md" : ""
        )}>
          {/* Filter Header */}
          <div 
            className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <SlidersHorizontal className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-semibold text-gray-900">Bộ lọc tìm kiếm</span>
                {hasActiveFilters && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                    Đang áp dụng
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
              {isFilterOpen ? "Thu gọn" : "Mở rộng"}
            </Button>
          </div>

          {/* Filter Content */}
          <div className={cn(
            "transition-all duration-300",
            isFilterOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          )}>
            <div className="px-5 pb-5 border-t border-gray-100 pt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search Input */}
                <div className="relative lg:col-span-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm sách..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && setCurrentPage(0)}
                    className="pl-12 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all"
                  />
                </div>

                {/* Category Select */}
                <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setCurrentPage(0); }}>
                  <SelectTrigger className="h-12 bg-gray-50 border-gray-200 hover:bg-gray-100 rounded-xl transition-colors">
                    <SelectValue placeholder="Danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    {categoriesList.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Brand Select */}
                <Select value={selectedBrand} onValueChange={(v) => { setSelectedBrand(v); setCurrentPage(0); }}>
                  <SelectTrigger className="h-12 bg-gray-50 border-gray-200 hover:bg-gray-100 rounded-xl transition-colors">
                    <SelectValue placeholder="Nhà xuất bản" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả NXB</SelectItem>
                    {brandsList.map((b) => (
                      <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort Select */}
                <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setCurrentPage(0); }}>
                  <SelectTrigger className="h-12 bg-gray-50 border-gray-200 hover:bg-gray-100 rounded-xl transition-colors">
                    <SelectValue placeholder="Sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mới nhất</SelectItem>
                    <SelectItem value="price_asc">Giá: Thấp đến Cao</SelectItem>
                    <SelectItem value="price_desc">Giá: Cao đến Thấp</SelectItem>
                    <SelectItem value="name_asc">Tên: A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">Đang lọc:</span>
                  {searchKeyword && (
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-sm px-3 py-1 rounded-full">
                      &ldquo;{searchKeyword}&rdquo;
                      <X className="w-3 h-3 cursor-pointer hover:text-blue-800" onClick={() => setSearchKeyword("")} />
                    </span>
                  )}
                  {selectedCategory !== "all" && (
                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 text-sm px-3 py-1 rounded-full">
                      {categoriesList.find(c => c.id.toString() === selectedCategory)?.name}
                      <X className="w-3 h-3 cursor-pointer hover:text-green-800" onClick={() => setSelectedCategory("all")} />
                    </span>
                  )}
                  {selectedBrand !== "all" && (
                    <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-600 text-sm px-3 py-1 rounded-full">
                      {brandsList.find(b => b.id.toString() === selectedBrand)?.name}
                      <X className="w-3 h-3 cursor-pointer hover:text-purple-800" onClick={() => setSelectedBrand("all")} />
                    </span>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleClearFilters} 
                    className="ml-auto text-gray-500 hover:text-red-600"
                  >
                    Xóa tất cả
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-3 h-3 rounded-full",
              !productsLoading && products.length > 0 ? "bg-green-500 animate-pulse" : "bg-gray-300"
            )} />
            <p className="text-gray-600">
              Tìm thấy <span className="font-bold text-gray-900">{totalElements}</span> sản phẩm
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:inline">Hiển thị:</span>
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <Button 
                variant={gridSize === "3x3" ? "default" : "ghost"} 
                size="icon" 
                onClick={() => setGridSize("3x3")}
                className={cn(
                  "h-8 w-8 rounded-lg transition-all",
                  gridSize === "3x3" ? "shadow-md" : ""
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button 
                variant={gridSize === "2x2" ? "default" : "ghost"} 
                size="icon" 
                onClick={() => setGridSize("2x2")}
                className={cn(
                  "h-8 w-8 rounded-lg transition-all",
                  gridSize === "2x2" ? "shadow-md" : ""
                )}
              >
                <Grid2X2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className={gridSize === "3x3" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"}>
            {Array.from({ length: pageSize }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <Skeleton className="h-80 w-full rounded-none" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-gray-500 mb-6">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
            {hasActiveFilters && (
              <Button onClick={handleClearFilters} variant="outline" className="rounded-xl">
                Xóa bộ lọc
              </Button>
            )}
          </div>
        ) : (
          <div className={gridSize === "3x3" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"}>
            {products.map((product, index) => (
              <div 
                key={product.id}
                className="animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!productsLoading && products.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <Button 
              variant="outline" 
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))} 
              disabled={currentPage === 0}
              className="rounded-xl h-10 px-4"
            >
              Trước
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
                      "w-10 h-10 rounded-xl transition-all",
                      currentPage === pageNum && "shadow-lg shadow-blue-500/30"
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
              className="rounded-xl h-10 px-4"
            >
              Sau
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
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50/50 to-white">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-48 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <Skeleton className="h-80 w-full rounded-none" />
                <div className="p-4 space-y-3">
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
    }>
      <ProductsContent />
    </Suspense>
  );
}
