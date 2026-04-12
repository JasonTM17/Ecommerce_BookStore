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
import { useLanguage } from "@/components/providers/language-provider";

const COPY = {
  vi: {
    emptyTitle: "Giỏ Hàng Trống",
    emptyDescription: "Vui lòng đăng nhập để xem giỏ hàng của bạn",
    emptyBrowse: "Khám Phá Sách",
    loadingTitle: "Giỏ Hàng Trống",
    loadingDescription: "Đang tải giỏ hàng của bạn...",
    title: (count: number) => `Giỏ Hàng (${count} sản phẩm)`,
    clearCart: "Xóa toàn bộ",
    summaryTitle: "Tổng Quan Đơn Hàng",
    subtotal: "Tạm tính",
    shipping: "Phí vận chuyển",
    freeShipping: "Miễn phí",
    freeShippingNote: "Miễn phí vận chuyển cho đơn từ 200.000đ",
    tax: "Thuế (VAT 10%)",
    total: "Tổng cộng",
    checkout: "Tiến Hành Thanh Toán",
    continueShopping: "Tiếp Tục Mua Sắm",
    shippingPromo: (amount: string) => `Mua thêm ${amount} để được miễn phí vận chuyển!`,
    remove: "Xóa",
    noImage: "Không có ảnh",
    byAuthor: (author: string) => `Tác giả: ${author}`,
  },
  en: {
    emptyTitle: "Your Cart Is Empty",
    emptyDescription: "Please sign in to view your cart",
    emptyBrowse: "Browse books",
    loadingTitle: "Loading Cart",
    loadingDescription: "Loading your cart...",
    title: (count: number) => `Cart (${count} items)`,
    clearCart: "Clear all",
    summaryTitle: "Order Summary",
    subtotal: "Subtotal",
    shipping: "Shipping",
    freeShipping: "Free",
    freeShippingNote: "Free shipping on orders over 200,000đ",
    tax: "Tax (VAT 10%)",
    total: "Total",
    checkout: "Proceed to checkout",
    continueShopping: "Continue shopping",
    shippingPromo: (amount: string) => `Add ${amount} more to get free shipping!`,
    remove: "Remove",
    noImage: "No image",
    byAuthor: (author: string) => `by ${author}`,
  },
} as const;

export default function CartPage() {
  const { locale } = useLanguage();
  const copy = COPY[locale];
  const { isAuthenticated } = useAuthStore();
  const { items, totalItems, setCart, clearCart, updateQuantity, removeItem } = useCartStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: cartData, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await api.get("/cart");
      return response.data as import("@/lib/store").CartResponse;
    },
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (cartData && isAuthenticated) {
      setCart(cartData.items, cartData.totalItems, cartData.total);
    }
  }, [cartData, isAuthenticated, setCart]);

  const updateCartMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      const response = await api.put(`/cart/items/${itemId}?quantity=${quantity}`, {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await api.delete(`/cart/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

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

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const shippingFee = subtotal >= 200000 ? 0 : 25000;
  const estimatedTax = Math.round(subtotal * 0.1);
  const grandTotal = subtotal + shippingFee + estimatedTax;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="mx-auto mb-6 h-24 w-24 text-gray-300" />
          <h1 className="mb-4 text-2xl font-bold text-gray-900">{copy.emptyTitle}</h1>
          <p className="mb-8 text-gray-600">{copy.emptyDescription}</p>
          <Link href="/login?redirect=%2Fcart">
            <Button size="lg">{locale === "vi" ? "Đăng Nhập" : "Sign in"}</Button>
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
              <div key={i} className="flex gap-4 rounded-lg bg-white p-4">
                <div className="h-32 w-24 rounded bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                  <div className="h-4 w-1/4 rounded bg-gray-200" />
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
          <ShoppingBag className="mx-auto mb-6 h-24 w-24 text-gray-300" />
          <h1 className="mb-4 text-2xl font-bold text-gray-900">{copy.emptyTitle}</h1>
          <p className="mb-8 text-gray-600">{locale === "vi" ? "Bạn chưa có sản phẩm nào trong giỏ hàng" : "You have no items in your cart yet"}</p>
          <Link href="/products">
            <Button size="lg">
              {copy.emptyBrowse}
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
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{copy.title(totalItems)}</h1>
          <Button
            variant="ghost"
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {copy.clearCart}
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                <Link href={`/products/${item.product.id}`}>
                  <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                    {item.product.imageUrl ? (
                      <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" />
                    ) : (
                      <BookOpen className="h-8 w-8 text-gray-300" />
                    )}
                  </div>
                </Link>

                <div className="min-w-0 flex-1">
                  <Link href={`/products/${item.product.id}`}>
                    <h3 className="mb-1 line-clamp-2 font-medium text-gray-900 hover:text-primary">
                      {item.product.name}
                    </h3>
                  </Link>
                  {item.product.author && <p className="mb-2 text-sm text-gray-500">{copy.byAuthor(item.product.author)}</p>}

                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">{formatCurrency(item.product.currentPrice)}</span>
                    {item.product.discountPercent && item.product.discountPercent > 0 ? (
                      <span className="text-sm text-gray-400 line-through">{formatCurrency(item.product.price)}</span>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(item.id, item.product.id, item.quantity - 1)}
                        disabled={updateCartMutation.isPending || removeFromCartMutation.isPending}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(item.id, item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stockQuantity || updateCartMutation.isPending || removeFromCartMutation.isPending}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-gray-900">{formatCurrency(item.subtotal)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleRemove(item.id)}
                        disabled={removeFromCartMutation.isPending}
                        aria-label={copy.remove}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-lg border border-white/50 bg-white/70 p-6 shadow-sm backdrop-blur-md">
              <h2 className="mb-6 text-xl font-bold text-gray-900">{copy.summaryTitle}</h2>

              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>{copy.subtotal} ({totalItems} {locale === "vi" ? "sản phẩm" : "items"})</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>{copy.shipping}</span>
                  <span className="font-medium">
                    {shippingFee === 0 ? <span className="text-green-600">{copy.freeShipping}</span> : formatCurrency(shippingFee)}
                  </span>
                </div>

                {shippingFee > 0 && (
                  <p className="text-xs text-gray-500 -mt-2">{copy.freeShippingNote}</p>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>{copy.tax}</span>
                  <span className="font-medium">{formatCurrency(estimatedTax)}</span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>{copy.total}</span>
                    <span className="text-primary">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={() => router.push("/checkout")}>
                  {copy.checkout}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <Link href="/products" className="block">
                  <Button variant="outline" className="w-full">
                    {copy.continueShopping}
                  </Button>
                </Link>

                <div className="bg-primary/5 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-primary">
                    <Sparkles className="mr-1 inline-block w-4 h-4" />
                    {copy.shippingPromo(formatCurrency(Math.max(200000 - subtotal, 0)))}
                  </p>
                  <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min((subtotal / 200000) * 100, 100)}%` }}
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
