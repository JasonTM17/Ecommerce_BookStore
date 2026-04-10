"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore, useCartStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Sparkles, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { isAuthenticated } = useAuthStore();
  const { items, total, totalItems, setCart, clearCart, updateQuantity, removeItem } = useCartStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch cart from backend
  const { data: cartData, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await api.get("/cart");
      return response.data as import("@/lib/store").CartResponse;
    },
    enabled: isAuthenticated,
  });

  // Sync backend cart to Zustand on load
  useEffect(() => {
    if (cartData && isAuthenticated) {
      setCart(cartData.items, cartData.totalItems, cartData.total);
    }
  }, [cartData, isAuthenticated]);

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      const response = await api.post("/cart/items", { productId, quantity });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // Update cart item mutation
  const updateCartMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      const response = await api.put(`/cart/items/${itemId}?quantity=${quantity}`, {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await api.delete(`/cart/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await api.delete("/cart");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const handleQuantityChange = (itemId: number, productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCartMutation.mutate(itemId);
    } else if (isAuthenticated) {
      updateCartMutation.mutate({ itemId, quantity: newQuantity });
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemove = (itemId: number) => {
    if (isAuthenticated) {
      removeFromCartMutation.mutate(itemId);
    } else {
      removeItem(itemId);
    }
  };

  const handleClearCart = () => {
    if (isAuthenticated) {
      clearCartMutation.mutate();
    }
    clearCart();
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const shippingFee = subtotal >= 200000 ? 0 : 25000;
  const estimatedTax = Math.round(subtotal * 0.1);
  const grandTotal = subtotal + shippingFee + estimatedTax;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Giỏ Hàng Trống</h1>
          <p className="text-gray-600 mb-8">Vui lòng đăng nhập để xem giỏ hàng của bạn</p>
          <Link href="/login">
            <Button size="lg">Đăng Nhập</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 p-4 bg-white rounded-lg">
                <div className="w-24 h-32 bg-gray-200 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Giỏ Hàng Trống</h1>
          <p className="text-gray-600 mb-8">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
          <Link href="/products">
            <Button size="lg">
              Khám Phá Sách
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Giỏ Hàng ({totalItems} sản phẩm)
          </h1>
          <Button
            variant="ghost"
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa toàn bộ
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <Link href={`/products/${item.product.id}`}>
                  <div className="relative w-24 h-32 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {item.product.imageUrl ? (
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <BookOpen className="h-8 w-8 text-gray-300" />
                    )}
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product.id}`}>
                    <h3 className="font-medium text-gray-900 hover:text-primary line-clamp-2 mb-1">
                      {item.product.name}
                    </h3>
                  </Link>
                  {item.product.author && (
                    <p className="text-sm text-gray-500 mb-2">by {item.product.author}</p>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    {item.product.discountPercent && item.product.discountPercent > 0 ? (
                      <>
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(item.product.currentPrice)}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {formatCurrency(item.product.price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(item.product.currentPrice)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          handleQuantityChange(
                            item.id,
                            item.product.id,
                            item.quantity - 1
                          )
                        }
                        disabled={updateCartMutation.isPending || removeFromCartMutation.isPending}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          handleQuantityChange(
                            item.id,
                            item.product.id,
                            item.quantity + 1
                          )
                        }
                        disabled={
                          item.quantity >= item.product.stockQuantity ||
                          updateCartMutation.isPending ||
                          removeFromCartMutation.isPending
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Subtotal & Remove */}
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(item.subtotal)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemove(item.id)}
                        disabled={removeFromCartMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tổng Quan Đơn Hàng</h2>

              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính ({totalItems} sản phẩm)</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium">
                    {shippingFee === 0 ? (
                      <span className="text-green-600">Miễn phí</span>
                    ) : (
                      formatCurrency(shippingFee)
                    )}
                  </span>
                </div>

                {shippingFee > 0 && (
                  <p className="text-xs text-gray-500 -mt-2">
                    Miễn phí vận chuyển cho đơn từ 200.000đ
                  </p>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Thuế (VAT 10%)</span>
                  <span className="font-medium">{formatCurrency(estimatedTax)}</span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Tổng cộng</span>
                    <span className="text-primary">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => router.push("/checkout")}
                >
                  Tiến Hành Thanh Toán
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <Link href="/products" className="block">
                  <Button variant="outline" className="w-full">
                    Tiếp Tục Mua Sắm
                  </Button>
                </Link>

                {/* Promotional Banner */}
                <div className="bg-primary/5 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-primary">
                    <Sparkles className="w-4 h-4 mr-1 inline-block" />
                    Mua thêm {formatCurrency(200000 - subtotal)} để được miễn phí vận chuyển!
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min((subtotal / 200000) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
