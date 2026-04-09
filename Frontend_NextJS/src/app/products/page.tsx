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
import { Search, SlidersHorizontal, Grid3X3, Grid2X2, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
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

  const { data: categoriesData } = useQuery<PageResponse<Category>>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get("/categories?page=0&size=100");
      return response.data;
    },
  });

  const { data: brandsData } = useQuery<PageResponse<Brand>>({
    queryKey: ["brands"],
    queryFn: async () => {
      const response = await api.get("/brands?page=0&size=100");
      return response.data;
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tất cả sản phẩm</h1>
          <p className="text-gray-600">Khám phá {totalElements} cuốn sách hay nhất</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">Bộ lọc</span>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters} className="ml-auto text-gray-500 hover:text-gray-700">
                <X className="w-4 h-4 mr-1" />
                Xóa bộ lọc
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm sách..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setCurrentPage(0)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setCurrentPage(0); }}>
              <SelectTrigger><SelectValue placeholder="Danh mục" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categoriesData?.content.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedBrand} onValueChange={(v) => { setSelectedBrand(v); setCurrentPage(0); }}>
              <SelectTrigger><SelectValue placeholder="Nhà xuất bản" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả NXB</SelectItem>
                {brandsData?.content.map((b) => <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setCurrentPage(0); }}>
              <SelectTrigger><SelectValue placeholder="Sắp xếp" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="price_asc">Giá: Thấp đến Cao</SelectItem>
                <SelectItem value="price_desc">Giá: Cao đến Thấp</SelectItem>
                <SelectItem value="name_asc">Tên: A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">Tìm thấy <span className="font-semibold text-gray-900">{totalElements}</span> sản phẩm</p>
          <div className="flex items-center gap-2">
            <Button variant={gridSize === "3x3" ? "default" : "outline"} size="icon" onClick={() => setGridSize("3x3")} className="w-10 h-10"><Grid3X3 className="w-4 h-4" /></Button>
            <Button variant={gridSize === "2x2" ? "default" : "outline"} size="icon" onClick={() => setGridSize("2x2")} className="w-10 h-10"><Grid2X2 className="w-4 h-4" /></Button>
          </div>
        </div>

        {productsLoading ? (
          <div className={gridSize === "3x3" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"}>
            {Array.from({ length: pageSize }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <SlidersHorizontal className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
            {hasActiveFilters && <Button onClick={handleClearFilters} variant="outline">Xóa bộ lọc</Button>}
          </div>
        ) : (
          <div className={gridSize === "3x3" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"}>
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <ProductCard product={product} />
              </Link>
            ))}
          </div>
        )}

        {!productsLoading && products.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button variant="outline" onClick={() => setCurrentPage((p) => Math.max(0, p - 1))} disabled={currentPage === 0}>Trước</Button>
            <span className="text-sm text-gray-600">Trang {currentPage + 1} / {totalPages}</span>
            <Button variant="outline" onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage >= totalPages - 1}>Sau</Button>
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
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-48 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <Skeleton className="h-48 w-full" />
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
