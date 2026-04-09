"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/product-skeleton";
import { api } from "@/lib/api";
import { Product, Category, Brand, PageResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import Link from "next/link";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "createdAt");
  const [direction, setDirection] = useState(searchParams.get("direction") || "DESC");
  const [showFilters, setShowFilters] = useState(false);
  
  const keyword = searchParams.get("keyword") || "";
  const categoryId = searchParams.get("categoryId");
  const brandId = searchParams.get("brandId");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const inStock = searchParams.get("inStock") === "true";

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", page, sortBy, direction, keyword, categoryId, brandId, minPrice, maxPrice, inStock],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("size", "12");
      params.set("sortBy", sortBy);
      params.set("direction", direction);
      if (keyword) params.set("keyword", keyword);
      if (categoryId) params.set("categoryId", categoryId);
      if (brandId) params.set("brandId", brandId);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (inStock) params.set("inStock", "true");
      
      const response = await api.get(`/products?${params.toString()}`);
      return response.data as PageResponse<Product>;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get("/categories");
      return response.data as Category[];
    },
  });

  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const response = await api.get("/brands");
      return response.data as Brand[];
    },
  });

  const clearFilters = () => {
    router.push("/products");
    setPage(0);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sản Phẩm</h1>
            <p className="text-gray-600">
              {productsData?.totalElements || 0} sản phẩm
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className={`lg:w-64 ${showFilters ? "block" : "hidden"} lg:block`}>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-gray-900">Bộ Lọc</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">Danh Mục</h3>
                  <div className="space-y-2">
                    {categories?.map((category) => (
                      <Link
                        key={category.id}
                        href={`/products?categoryId=${category.id}`}
                        className={`block text-sm ${
                          categoryId === category.id.toString()
                            ? "text-primary font-medium"
                            : "text-gray-600 hover:text-primary"
                        }`}
                      >
                        {category.name}
                        {category.productCount && (
                          <span className="text-gray-400 ml-1">({category.productCount})</span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">Khoảng Giá</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Từ"
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      onChange={(e) => {
                        const params = new URLSearchParams(searchParams.toString());
                        if (e.target.value) {
                          params.set("minPrice", e.target.value);
                        } else {
                          params.delete("minPrice");
                        }
                        router.push(`/products?${params.toString()}`);
                      }}
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      placeholder="Đến"
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      onChange={(e) => {
                        const params = new URLSearchParams(searchParams.toString());
                        if (e.target.value) {
                          params.set("maxPrice", e.target.value);
                        } else {
                          params.delete("maxPrice");
                        }
                        router.push(`/products?${params.toString()}`);
                      }}
                    />
                  </div>
                </div>

                {/* In Stock */}
                <div className="mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStock}
                      onChange={(e) => {
                        const params = new URLSearchParams(searchParams.toString());
                        if (e.target.checked) {
                          params.set("inStock", "true");
                        } else {
                          params.delete("inStock");
                        }
                        router.push(`/products?${params.toString()}`);
                      }}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-600">Chỉ hiển thị sản phẩm còn hàng</span>
                  </label>
                </div>

                {/* Clear Filters */}
                {(categoryId || brandId || minPrice || maxPrice || inStock) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Xóa Bộ Lọc
                  </Button>
                )}
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Bộ Lọc
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sắp xếp theo:</span>
                  <select
                    value={`${sortBy}-${direction}`}
                    onChange={(e) => {
                      const [newSortBy, newDirection] = e.target.value.split("-");
                      setSortBy(newSortBy);
                      setDirection(newDirection);
                      const params = new URLSearchParams(searchParams.toString());
                      params.set("sortBy", newSortBy);
                      params.set("direction", newDirection);
                      router.push(`/products?${params.toString()}`);
                    }}
                    className="border rounded-md px-3 py-2 text-sm"
                  >
                    <option value="createdAt-DESC">Mới nhất</option>
                    <option value="price-ASC">Giá: Thấp đến Cao</option>
                    <option value="price-DESC">Giá: Cao đến Thấp</option>
                    <option value="name-ASC">Tên: A-Z</option>
                    <option value="soldCount-DESC">Bán chạy nhất</option>
                  </select>
                </div>
              </div>

              {/* Products */}
              {isLoading ? (
                <ProductGridSkeleton />
              ) : productsData?.content.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
                  <p className="text-gray-600 mb-4">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                  <Button variant="outline" onClick={clearFilters}>
                    Xóa Bộ Lọc
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {productsData?.content.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {productsData && productsData.totalPages > 1 && (
                    <div className="flex justify-center mt-8 gap-2">
                      <Button
                        variant="outline"
                        disabled={!productsData.hasPrevious}
                        onClick={() => setPage(page - 1)}
                      >
                        Trước
                      </Button>
                      <div className="flex items-center px-4">
                        <span className="text-sm text-gray-600">
                          Trang {productsData.page + 1} / {productsData.totalPages}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        disabled={!productsData.hasNext}
                        onClick={() => setPage(page + 1)}
                      >
                        Sau
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
