"use client";

import { useState, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Category, Product } from "@/lib/types";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ChevronRight, BookOpen, Filter, FlaskConical, Briefcase, Palette, Stethoscope, Laptop, Globe, Trophy } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAddToCart } from "@/hooks/useAddToCart";

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page?: number;
  number?: number;
  size: number;
}

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

function normalizeList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "content" in data && Array.isArray((data as PageResponse<T>).content)) {
    return (data as PageResponse<T>).content;
  }
  return [];
}

function CategoriesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart, isAddingToCart } = useAddToCart("/categories");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    searchParams.get("id") || null
  );
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 12;

  const { data: categoriesData = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["categories-all"],
    queryFn: async () => {
      const response = await api.get("/categories");
      return normalizeList<Category>(response.data);
    },
  });

  const { data: productsData, isLoading: productsLoading } = useQuery<PageResponse<Product>>({
    queryKey: ["category-products", selectedCategoryId, currentPage, pageSize],
    queryFn: async () => {
      if (!selectedCategoryId) return { content: [], totalElements: 0, totalPages: 0, page: 0, number: 0, size: pageSize };
      const response = await api.get(`/products/category/${selectedCategoryId}?page=${currentPage}&size=${pageSize}`);
      return response.data;
    },
    enabled: !!selectedCategoryId,
  });

  const selectedCategory = categoriesData.find(c => c.id.toString() === selectedCategoryId);
  const products = productsData?.content || [];
  const totalPages = productsData?.totalPages || 0;
  const totalElements = productsData?.totalElements || 0;

  // Get root categories (no parent)
  const rootCategories = categoriesData.filter(c => !c.parentId);

  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategoryId(categoryId.toString());
    setCurrentPage(0);
    router.push(`/categories?id=${categoryId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50/50 to-white">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Danh mục sách</span>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-sm p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h2 className="font-bold text-lg text-gray-900">Danh Mục</h2>
              </div>

              {categoriesLoading ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-xl" />
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
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                      !selectedCategoryId
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                        : "hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    <BookOpen className="w-5 h-5" />
                    <span className="font-medium">Tất cả sách</span>
                  </button>

                  {rootCategories.map((category, index) => (
                    <div key={category.id}>
                      <button
                        onClick={() => handleCategoryClick(category.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                          selectedCategoryId === category.id.toString()
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                            : "hover:bg-gray-50 text-gray-700"
                        )}
                      >
                        {(() => {
                          const icons = [BookOpen, FlaskConical, Briefcase, Palette, Stethoscope, Laptop, Globe, Trophy]
                          const Icon = icons[index % 8]
                          return <Icon className="w-5 h-5" />
                        })()}
                        <div className="flex-1 text-left">
                          <span className="font-medium block">{category.name}</span>
                          {typeof category.productCount === "number" && category.productCount > 0 && (
                            <span className={cn(
                              "text-xs",
                              selectedCategoryId === category.id.toString() ? "text-white/70" : "text-gray-400"
                            )}>
                              {category.productCount} sản phẩm
                            </span>
                          )}
                        </div>
                      </button>

                      {/* Subcategories */}
                      {category.subcategories && category.subcategories.length > 0 && (
                        <div className="ml-6 mt-1 space-y-1">
                          {category.subcategories.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => handleCategoryClick(sub.id)}
                              className={cn(
                                "w-full flex items-center justify-between gap-3 px-4 py-2 rounded-lg text-sm transition-all duration-300",
                                selectedCategoryId === sub.id.toString()
                                  ? "bg-blue-100 text-blue-700 font-medium"
                                  : "hover:bg-gray-50 text-gray-600"
                              )}
                            >
                              <span className="flex items-center gap-2 min-w-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                <span className="truncate">{sub.name}</span>
                              </span>
                              {typeof sub.productCount === "number" && sub.productCount > 0 && (
                                <span
                                  className={cn(
                                    "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                                    selectedCategoryId === sub.id.toString()
                                      ? "bg-blue-200 text-blue-700"
                                      : "bg-gray-100 text-gray-500"
                                  )}
                                >
                                  {sub.productCount} sách
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

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Category Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                {selectedCategory ? selectedCategory.name : "Tất cả sách"}
              </h1>
              <p className="text-gray-500">
                {selectedCategory 
                  ? `${totalElements} sản phẩm trong danh mục`
                  : "Khám phá hơn 1000 cuốn sách từ mọi thể loại"
                }
              </p>
            </div>

            {/* Category Cards Grid (when no category selected) */}
            {!selectedCategoryId && (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
                {rootCategories.map((category, index) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className="group relative h-40 rounded-2xl overflow-hidden transition-all duration-300 hover:ring-2 hover:ring-blue-500/50 hover:shadow-lg"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${CATEGORY_GRADIENTS[index % CATEGORY_GRADIENTS.length]} transition-transform duration-500 group-hover:scale-110`} />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                      <h3 className="font-bold text-lg text-center group-hover:scale-105 transition-transform">
                        {category.name}
                      </h3>
                      {typeof category.productCount === "number" && category.productCount > 0 && (
                        <p className="text-sm text-white/80 mt-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                          {category.productCount} sản phẩm
                        </p>
                      )}
                    </div>
                    <div className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Products Grid */}
            {selectedCategoryId ? (
              <>
                {productsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                        <Skeleton className="h-72 w-full rounded-none" />
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
                      <BookOpen className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Không có sản phẩm</h3>
                    <p className="text-gray-500 mb-6">Danh mục này chưa có sản phẩm nào</p>
                    <Button onClick={() => setSelectedCategoryId(null)} variant="outline" className="rounded-xl">
                      Xem tất cả sách
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onAddToCart={addToCart}
                          isAddingToCart={isAddingToCart}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
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
                                  "w-10 h-10 rounded-xl",
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
                  </>
                )}
              </>
            ) : (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 text-center border border-blue-100">
                <Filter className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Chọn danh mục để xem sản phẩm</h3>
                <p className="text-gray-500">Nhấp vào một danh mục bên trái để xem các sản phẩm</p>
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
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
            <div className="lg:col-span-3">
              <Skeleton className="h-10 w-48 mb-2" />
              <Skeleton className="h-5 w-64 mb-8" />
              <div className="grid grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-80 w-full rounded-2xl" />
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <CategoriesContent />
    </Suspense>
  );
}
