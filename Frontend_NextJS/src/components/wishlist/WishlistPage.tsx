"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2, ShoppingCart, Star, Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { wishlistItems, isLoading, removeFromWishlist, isRemoving } = useWishlist();
  const [removingId, setRemovingId] = useState<number | null>(null);

  const handleRemove = async (productId: number) => {
    setRemovingId(productId);
    await removeFromWishlist(productId);
    setRemovingId(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Đăng nhập để xem wishlist
        </h1>
        <p className="text-gray-500 mb-6">
          Vui lòng đăng nhập để xem danh sách yêu thích của bạn
        </p>
        <Button onClick={() => router.push("/login")} className="bg-blue-600">
          Đăng nhập
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Danh Sách Yêu Thích</h1>
          <p className="text-gray-500 mt-1">
            {wishlistItems.length} sản phẩm trong wishlist
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Chưa có sản phẩm nào
          </h2>
          <p className="text-gray-500 mb-6">
            Hãy thêm sản phẩm bạn thích vào danh sách yêu thích
          </p>
          <Link href="/products">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Khám phá sản phẩm
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Product Image */}
              <Link href={`/products/${item.product.id}`} className="block relative">
                <div className="aspect-[3/4] relative bg-gray-100">
                  {item.product.imageUrl ? (
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {item.product.isNew && (
                    <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-md">
                      Mới
                    </span>
                  )}
                  {item.product.isBestseller && (
                    <span className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-md">
                      Bán chạy
                    </span>
                  )}
                  {item.product.discountPercent > 0 && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-md">
                      -{item.product.discountPercent}%
                    </span>
                  )}
                </div>

                {/* Out of Stock Overlay */}
                {!item.isInStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="px-4 py-2 bg-white text-gray-900 font-medium rounded-lg">
                      Hết hàng
                    </span>
                  </div>
                )}
              </Link>

              {/* Product Info */}
              <div className="p-4">
                <Link href={`/products/${item.product.id}`}>
                  <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors mb-1">
                    {item.product.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500 mb-2">{item.product.author}</p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium ml-1">
                      {item.product.avgRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">
                    ({item.product.reviewCount} đánh giá)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-lg font-bold text-blue-600">
                      {formatPrice(item.product.currentPrice || item.product.price)}
                    </span>
                    {item.product.currentPrice &&
                      item.product.currentPrice < item.product.price && (
                        <span className="text-sm text-gray-400 line-through ml-2">
                          {formatPrice(item.product.price)}
                        </span>
                      )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={!item.isInStock}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Thêm vào giỏ
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemove(item.product.id)}
                    disabled={removingId === item.product.id}
                    className="border-red-200 text-red-500 hover:bg-red-50"
                  >
                    {removingId === item.product.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Notes */}
                {item.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <Bell className="h-3 w-3" />
                      Ghi chú
                    </div>
                    <p className="text-sm text-gray-700">{item.notes}</p>
                  </div>
                )}

                {/* Added Date */}
                <p className="text-xs text-gray-400 mt-3">
                  Thêm ngày {formatDate(item.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
