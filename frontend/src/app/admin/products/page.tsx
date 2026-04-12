"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useLanguage } from "@/components/providers/language-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/lib/types";
import { toast } from "@/components/ui/toaster";

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

const COPY = {
  vi: {
    title: "Quản lý sản phẩm",
    subtitle: "Tổng cộng {count} sản phẩm",
    addProduct: "Thêm sản phẩm",
    searchPlaceholder: "Tìm kiếm sản phẩm...",
    filter: "Bộ lọc",
    product: "Sản phẩm",
    category: "Danh mục",
    price: "Giá",
    stock: "Tồn kho",
    sold: "Đã bán",
    action: "Hành động",
    empty: "Không có sản phẩm nào",
    tableLoading: "Đang tải...",
    prev: "Trước",
    next: "Sau",
    page: "Trang {current} / {total}",
    deleteConfirm: 'Bạn có chắc muốn xóa sản phẩm này?',
    deleteSuccess: "Xóa sản phẩm thành công",
    deleteError: "Xóa sản phẩm thất bại",
  },
  en: {
    title: "Product management",
    subtitle: "{count} products in total",
    addProduct: "Add product",
    searchPlaceholder: "Search products...",
    filter: "Filter",
    product: "Product",
    category: "Category",
    price: "Price",
    stock: "Stock",
    sold: "Sold",
    action: "Action",
    empty: "No products found",
    tableLoading: "Loading...",
    prev: "Previous",
    next: "Next",
    page: "Page {current} / {total}",
    deleteConfirm: "Are you sure you want to delete this product?",
    deleteSuccess: "Product deleted successfully",
    deleteError: "Failed to delete product",
  },
} as const;

export default function AdminProductsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { locale } = useLanguage();
  const copy = COPY[locale];
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const { data: productsData, isLoading } = useQuery({
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
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success(copy.deleteSuccess);
    },
    onError: () => {
      toast.error(copy.deleteError);
    },
  });

  const products = productsData?.content || [];
  const totalPages = productsData?.totalPages || 0;
  const totalElements = productsData?.totalElements || 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{copy.title}</h1>
            <p className="text-gray-600 mt-1">{copy.subtitle.replace("{count}", String(totalElements))}</p>
          </div>
          <Button className="bg-primary">
            <Plus className="h-4 w-4 mr-2" />
            {copy.addProduct}
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder={copy.searchPlaceholder}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">{copy.filter}</Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{copy.product}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{copy.category}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{copy.price}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{copy.stock}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{copy.sold}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{copy.action}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {copy.empty}
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            {product.imageUrl && (
                              <Image
                                src={product.imageUrl}
                                alt={product.name}
                                width={48}
                                height={64}
                                unoptimized
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.author}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.category?.name || "-"}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-primary">{formatCurrency(product.currentPrice)}</p>
                          {product.discountPercent && product.discountPercent > 0 && (
                            <p className="text-xs text-gray-400 line-through">{formatCurrency(product.price)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm ${product.stockQuantity < 10 ? "text-red-600 font-medium" : "text-gray-600"}`}>
                          {product.stockQuantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.soldCount || 0}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/products/${product.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={product.name}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={copy.action}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={() => {
                              if (window.confirm(copy.deleteConfirm)) {
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <p className="text-sm text-gray-500">
                {copy.page
                  .replace("{current}", String(page + 1))
                  .replace("{total}", String(totalPages))}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {copy.prev}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
                  {copy.next}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
