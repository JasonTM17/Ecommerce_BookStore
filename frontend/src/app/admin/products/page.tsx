"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Eye, Search, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/components/providers/language-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ProductImage } from "@/components/ui/ProductImage";
import { toast } from "@/components/ui/toaster";
import {
  getCategoryPlaceholderImage,
  resolveProductImageSource,
} from "@/lib/product-images";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/lib/types";

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

const COPY = {
  vi: {
    breadcrumb: "Admin",
    title: "Quản lý sản phẩm",
    subtitle: "Tổng cộng {count} sản phẩm đang hiển thị trong catalog.",
    searchPlaceholder: "Tìm kiếm sản phẩm...",
    catalogNotice:
      "Portfolio hiện giữ màn này cho việc rà soát catalog, không mở CRUD tạo/sửa trong pass này.",
    product: "Sản phẩm",
    category: "Danh mục",
    price: "Giá",
    stock: "Tồn kho",
    sold: "Đã bán",
    action: "Hành động",
    empty: "Chưa có sản phẩm nào khớp bộ lọc hiện tại.",
    page: "Trang {current} / {total}",
    prev: "Trước",
    next: "Sau",
    view: "Xem chi tiết sản phẩm",
    delete: "Xóa sản phẩm",
    deleteConfirm: 'Bạn có chắc muốn xóa sản phẩm "{name}" không?',
    deleteSuccess: "Đã xóa sản phẩm thành công.",
    deleteError: "Không thể xóa sản phẩm này.",
  },
  en: {
    breadcrumb: "Admin",
    title: "Product management",
    subtitle: "{count} products are currently visible in the catalog.",
    searchPlaceholder: "Search products...",
    catalogNotice:
      "This portfolio lane keeps the screen focused on catalog review instead of create/edit CRUD.",
    product: "Product",
    category: "Category",
    price: "Price",
    stock: "Stock",
    sold: "Sold",
    action: "Action",
    empty: "No products match the current filter.",
    page: "Page {current} / {total}",
    prev: "Previous",
    next: "Next",
    view: "View product detail",
    delete: "Delete product",
    deleteConfirm: 'Are you sure you want to delete "{name}"?',
    deleteSuccess: "Product deleted successfully.",
    deleteError: "Unable to delete this product.",
  },
} as const;

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const {
    isAuthenticated,
    isAdmin,
    isLoading: isAuthLoading,
  } = useAuth(true, true);
  const { locale } = useLanguage();
  const copy = COPY[locale];
  const [page, setPage] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", page, searchKeyword],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        size: "10",
        sortBy: "createdAt",
        direction: "DESC",
      });

      if (searchKeyword) {
        params.set("keyword", searchKeyword);
      }

      const response = await api.get(`/products?${params.toString()}`);
      return response.data as PageResponse<Product>;
    },
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: number) => {
      await api.delete(`/admin/products/${productId}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success(copy.deleteSuccess);
    },
    onError: () => {
      toast.error(copy.deleteError);
    },
  });

  if (isAuthLoading || !isAuthenticated || !isAdmin) {
    return null;
  }

  const products = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
            <Link
              href="/admin"
              className="hover:text-blue-600 transition-colors"
            >
              {copy.breadcrumb}
            </Link>
            <span>/</span>
            <span className="font-medium text-gray-900">{copy.title}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{copy.title}</h1>
          <p className="mt-2 text-gray-600">
            {copy.subtitle.replace("{count}", String(totalElements))}
          </p>
        </div>

        <Card className="mb-6 rounded-2xl border-0 shadow-sm">
          <CardContent className="space-y-4 p-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={searchKeyword}
                onChange={(event) => {
                  setSearchKeyword(event.target.value);
                  setPage(0);
                }}
                placeholder={copy.searchPlaceholder}
                className="pl-10"
              />
            </div>
            <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
              {copy.catalogNotice}
            </p>
          </CardContent>
        </Card>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {copy.product}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {copy.category}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {copy.price}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {copy.stock}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {copy.sold}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {copy.action}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index}>
                      {Array.from({ length: 6 }).map((__, cellIndex) => (
                        <td key={cellIndex} className="px-6 py-4">
                          <Skeleton className="h-5 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center text-gray-500"
                    >
                      {copy.empty}
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100">
                            <ProductImage
                              src={resolveProductImageSource(product)}
                              fallbackSrc={getCategoryPlaceholderImage(
                                product.category?.name,
                              )}
                              alt={product.name}
                              width={48}
                              height={64}
                              sizes="48px"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {product.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {product.author}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.category?.name || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-blue-600">
                          {formatCurrency(product.currentPrice)}
                        </p>
                        {product.discountPercent &&
                        product.discountPercent > 0 ? (
                          <p className="text-xs text-gray-400 line-through">
                            {formatCurrency(product.price)}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.stockQuantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.soldCount ?? 0}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/products/${product.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={copy.view}
                              className="h-9 w-9"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={copy.delete}
                            className="h-9 w-9 text-red-500 hover:text-red-600"
                            onClick={() => {
                              if (
                                window.confirm(
                                  copy.deleteConfirm.replace(
                                    "{name}",
                                    product.name,
                                  ),
                                )
                              ) {
                                deleteMutation.mutate(product.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 ? (
            <div className="flex items-center justify-between border-t px-6 py-4">
              <p className="text-sm text-gray-500">
                {copy.page
                  .replace("{current}", String(page + 1))
                  .replace("{total}", String(totalPages))}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((value) => Math.max(0, value - 1))}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  {copy.prev}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() =>
                    setPage((value) => Math.min(totalPages - 1, value + 1))
                  }
                >
                  {copy.next}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
