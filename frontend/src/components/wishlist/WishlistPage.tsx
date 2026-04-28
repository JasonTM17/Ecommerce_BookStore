"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Trash2, ShoppingCart, Star, Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useAddToCart } from "@/hooks/useAddToCart";
import type { Product } from "@/lib/types";
import { buildLoginRedirect } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";
import { ProductImage } from "@/components/ui/ProductImage";
import {
  getCategoryPlaceholderImage,
  resolveProductImageSource,
} from "@/lib/product-images";

const COPY = {
  vi: {
    loginRequiredTitle: "Đăng nhập để xem wishlist",
    loginRequiredDescription:
      "Vui lòng đăng nhập để xem danh sách yêu thích của bạn",
    loginButton: "Đăng nhập",
    title: "Danh Sách Yêu Thích",
    subtitle: (count: number) => `${count} sản phẩm trong wishlist`,
    loading: "Đang tải...",
    emptyTitle: "Chưa có sản phẩm nào",
    emptyDescription: "Hãy thêm sản phẩm bạn thích vào danh sách yêu thích",
    browseProducts: "Khám phá sản phẩm",
    outOfStock: "Hết hàng",
    ratingSuffix: "đánh giá",
    addToCart: "Thêm vào giỏ",
    addingToCart: "Đang thêm...",
    noteTitle: "Ghi chú",
    addedAt: (date: string) => `Thêm ngày ${date}`,
  },
  en: {
    loginRequiredTitle: "Sign in to view your wishlist",
    loginRequiredDescription: "Please sign in to see your saved favorites",
    loginButton: "Sign in",
    title: "Wishlist",
    subtitle: (count: number) => `${count} items in your wishlist`,
    loading: "Loading...",
    emptyTitle: "No saved items yet",
    emptyDescription: "Add products you love to your wishlist",
    browseProducts: "Browse products",
    outOfStock: "Out of stock",
    ratingSuffix: "reviews",
    addToCart: "Add to cart",
    addingToCart: "Adding...",
    noteTitle: "Note",
    addedAt: (date: string) => `Added on ${date}`,
  },
} as const;

export function WishlistPage() {
  const { locale } = useLanguage();
  const copy = COPY[locale];
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { wishlistItems, isLoading, removeFromWishlist } = useWishlist();
  const { addToCart, isAddingToCart } = useAddToCart("/wishlist");
  const [removingId, setRemovingId] = useState<number | null>(null);

  const handleRemove = async (productId: number) => {
    setRemovingId(productId);
    await removeFromWishlist(productId);
    setRemovingId(null);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart className="mx-auto mb-4 h-16 w-16 text-gray-300" />
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          {copy.loginRequiredTitle}
        </h1>
        <p className="mb-6 text-gray-500">{copy.loginRequiredDescription}</p>
        <Button
          onClick={() => router.push(buildLoginRedirect("/wishlist"))}
          className="bg-red-600"
        >
          {copy.loginButton}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{copy.title}</h1>
          <p className="mt-1 text-gray-500">
            {copy.subtitle(wishlistItems.length)}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          <span className="sr-only">{copy.loading}</span>
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="py-16 text-center">
          <Heart className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            {copy.emptyTitle}
          </h2>
          <p className="mb-6 text-gray-500">{copy.emptyDescription}</p>
          <Link href="/products">
            <Button className="bg-red-600 hover:bg-red-700">
              {copy.browseProducts}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              data-testid="wishlist-item"
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-lg"
            >
              <Link
                href={`/products/${item.product.id}`}
                className="block relative"
              >
                <div className="relative aspect-[3/4] bg-gray-100">
                  <ProductImage
                    src={resolveProductImageSource(item.product as Product)}
                    fallbackSrc={getCategoryPlaceholderImage(
                      (item.product as Product).category?.name,
                    )}
                    alt={item.product.name}
                    fill
                    sizes="(min-width: 1280px) 18vw, (min-width: 1024px) 22vw, (min-width: 768px) 30vw, 50vw"
                    className="object-cover"
                  />
                </div>

                <div className="absolute left-3 top-3 flex flex-col gap-2">
                  {item.product.isNew && (
                    <span className="rounded-md bg-green-500 px-2 py-1 text-xs font-medium text-white">
                      Mới
                    </span>
                  )}
                  {item.product.isBestseller && (
                    <span className="rounded-md bg-orange-500 px-2 py-1 text-xs font-medium text-white">
                      Bán chạy
                    </span>
                  )}
                  {item.product.discountPercent > 0 && (
                    <span className="rounded-md bg-red-500 px-2 py-1 text-xs font-medium text-white">
                      -{item.product.discountPercent}%
                    </span>
                  )}
                </div>

                {!item.isInStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="rounded-lg bg-white px-4 py-2 font-medium text-gray-900">
                      {copy.outOfStock}
                    </span>
                  </div>
                )}
              </Link>

              <div className="p-4">
                <Link href={`/products/${item.product.id}`}>
                  <h3 className="mb-1 line-clamp-2 font-semibold text-gray-900 transition-colors hover:text-red-600">
                    {item.product.name}
                  </h3>
                </Link>
                <p className="mb-2 text-sm text-gray-500">
                  {item.product.author}
                </p>

                <div className="mb-3 flex items-center gap-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 text-sm font-medium">
                      {item.product.avgRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">
                    ({item.product.reviewCount} {copy.ratingSuffix})
                  </span>
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-red-600">
                      {formatPrice(
                        item.product.currentPrice || item.product.price,
                      )}
                    </span>
                    {item.product.currentPrice &&
                      item.product.currentPrice < item.product.price && (
                        <span className="ml-2 text-sm text-gray-400 line-through">
                          {formatPrice(item.product.price)}
                        </span>
                      )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    disabled={!item.isInStock || isAddingToCart}
                    data-testid="wishlist-add-to-cart"
                    onClick={() =>
                      addToCart(
                        {
                          ...(item.product as Product),
                          inStock: item.isInStock,
                        },
                        1,
                      )
                    }
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {isAddingToCart ? copy.addingToCart : copy.addToCart}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemove(item.product.id)}
                    disabled={removingId === item.product.id}
                    data-testid="wishlist-remove"
                    className="border-red-200 text-red-500 hover:bg-red-50"
                  >
                    {removingId === item.product.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {item.notes && (
                  <div className="mt-3 rounded-lg bg-gray-50 p-3">
                    <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                      <Bell className="h-3 w-3" />
                      {copy.noteTitle}
                    </div>
                    <p className="text-sm text-gray-700">{item.notes}</p>
                  </div>
                )}

                <p className="mt-3 text-xs text-gray-400">
                  {copy.addedAt(formatDate(item.createdAt))}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
