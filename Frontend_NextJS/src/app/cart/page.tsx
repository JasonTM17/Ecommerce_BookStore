"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCartStore } from "@/lib/store";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { setCart } = useCartStore();

  const { data: cart, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await api.get("/cart");
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      const response = await api.put(`/cart/items/${itemId}?quantity=${quantity}`);
      return response.data;
    },
    onSuccess: (data) => {
      setCart(data.items, data.totalItems, data.total);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const response = await api.delete(`/cart/items/${itemId}`);
      return response.data;
    },
    onSuccess: (data) => {
      setCart(data.items, data.totalItems, data.total);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast({
        title: "Đã xóa sản phẩm",
        description: "Sản phẩm đã được xóa khỏi giỏ hàng",
      });
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      await api.delete("/cart");
    },
    onSuccess: () => {
      setCart([], 0, 0);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast({
        title: "Đã xóa giỏ hàng",
        description: "Tất cả sản phẩm đã được xóa khỏi giỏ hàng",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-16">
          <div className="container mx-auto px-4 text-center">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h1>
            <p className="text-gray-600 mb-6">Bạn cần đăng nhập để xem giỏ hàng</p>
            <Button onClick={() => router.push("/login")}>Đăng Nhập</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 p-4 bg-gray-100 rounded-lg">
                    <div className="w-24 h-24 bg-gray-200 rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-16">
          <div className="container mx-auto px-4 text-center">
            <ShoppingBag className="h-20 w-20 text-gray-300 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng trống</h1>
            <p className="text-gray-600 mb-6">Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
            <Link href="/products">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tiếp tục mua sắm
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Giỏ Hàng ({cart.totalItems} sản phẩm)</h1>
            <Button variant="outline" onClick={() => clearMutation.mutate()} disabled={clearMutation.isPending}>
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa tất cả
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item: any) => (
                <div key={item.id} className="flex gap-4 bg-white p-4 rounded-lg shadow-sm">
                  <Link href={`/products/${item.product.id}`}>
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden relative">
                      {item.product.imageUrl ? (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-4xl">📚</span>
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex-1">
                    <Link href={`/products/${item.product.id}`}>
                      <h3 className="font-medium text-gray-900 hover:text-primary">
                        {item.product.name}
                      </h3>
                    </Link>
                    {item.product.author && (
                      <p className="text-sm text-gray-500">{item.product.author}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateMutation.mutate({
                              itemId: item.id,
                              quantity: Math.max(1, item.quantity - 1),
                            })
                          }
                          disabled={updateMutation.isPending}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateMutation.mutate({
                              itemId: item.id,
                              quantity: item.quantity + 1,
                            })
                          }
                          disabled={updateMutation.isPending}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-bold text-primary">
                          {formatCurrency(item.subtotal)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeMutation.mutate(item.id)}
                          disabled={removeMutation.isPending}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
                <h2 className="font-semibold text-gray-900 mb-4">Tóm Tắt Đơn Hàng</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính ({cart.totalItems} sản phẩm)</span>
                    <span>{formatCurrency(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giảm giá</span>
                    <span className="text-green-600">-0đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí giao hàng</span>
                    <span>{cart.subtotal >= 200000 ? "Miễn phí" : "25.000đ"}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span>Tổng cộng</span>
                    <span className="text-primary">{formatCurrency(cart.total)}</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-6"
                  size="lg"
                  onClick={() => router.push("/checkout")}
                >
                  Tiến Hành Thanh Toán
                </Button>

                <Link href="/products" className="block mt-4">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Tiếp tục mua sắm
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
