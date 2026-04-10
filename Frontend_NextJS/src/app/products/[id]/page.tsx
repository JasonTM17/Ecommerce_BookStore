"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { isAxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, apiPublic } from "@/lib/api";
import { Product, Review, PageResponse } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import { useCartStore } from "@/lib/store";
import { useAuth } from "@/components/providers/auth-provider";
import { Star, ShoppingCart, Minus, Plus, Heart, Share2, Truck, Shield, RotateCcw } from "lucide-react";
import Image from "next/image";

function normalizeRouteParam(id: string | string[] | undefined): string | undefined {
  if (id === undefined || id === null) return undefined;
  return Array.isArray(id) ? id[0] : String(id);
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setCart } = useCartStore();
  const { isAuthenticated } = useAuth();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const productId = normalizeRouteParam(params.id as string | string[] | undefined);
  const numericId = productId !== undefined ? Number(productId) : NaN;
  const idValid = Boolean(productId && !Number.isNaN(numericId) && numericId > 0);

  const {
    data: product,
    isLoading,
    isError,
    error,
    isFetched,
  } = useQuery({
    queryKey: ["product", productId],
    enabled: idValid,
    queryFn: async () => {
      const response = await apiPublic.get(`/products/${productId}`);
      return response.data as Product;
    },
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ["related-products", productId, product?.category?.id],
    enabled: idValid && Boolean(product?.category?.id),
    queryFn: async () => {
      const catId = product!.category!.id;
      const response = await apiPublic.get(
        `/products/${productId}/related?categoryId=${catId}`
      );
      return response.data as Product[];
    },
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["reviews", productId],
    enabled: idValid,
    queryFn: async () => {
      const response = await apiPublic.get(
        `/reviews/product/${productId}?page=0&size=5`
      );
      return response.data as PageResponse<Review>;
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async (qty: number) => {
      const response = await api.post("/cart/items", {
        productId: parseInt(productId!),
        quantity: qty,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`${quantity} x ${product?.name} đã được thêm vào giỏ hàng`);
      setCart(data.items, data.totalItems, data.total);
    },
    onError: () => {
      toast.error("Không thể thêm sản phẩm vào giỏ hàng");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gray-200 h-96 rounded-lg" />
                <div className="space-y-4">
                  <div className="bg-gray-200 h-8 rounded w-3/4" />
                  <div className="bg-gray-200 h-6 rounded w-1/2" />
                  <div className="bg-gray-200 h-10 rounded w-1/3" />
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!idValid) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Đường dẫn sản phẩm không hợp lệ</h1>
            <Button onClick={() => router.push("/products")}>Quay lại trang sản phẩm</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isFetched && (isError || !product)) {
    const status = isAxiosError(error) ? error.response?.status : undefined;
    const notFound = status === 404;
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-16">
          <div className="container mx-auto max-w-lg px-4 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {notFound ? "Sản phẩm không tồn tại" : "Không thể tải sản phẩm"}
            </h1>
            <p className="text-gray-600 mb-6">
              {notFound
                ? "Sản phẩm có thể đã ngừng kinh doanh hoặc đã bị gỡ."
                : "Kiểm tra kết nối mạng và đảm bảo API backend đang chạy (NEXT_PUBLIC_API_URL)."}
            </p>
            <Button onClick={() => router.push("/products")}>Quay lại trang sản phẩm</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Đang tải sản phẩm...</p>
      </div>
    );
  }

  const hasDiscount = product.discountPercent && product.discountPercent > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm">
            <ol className="flex items-center gap-2 text-gray-600">
              <li><a href="/" className="hover:text-primary">Trang chủ</a></li>
              <li>/</li>
              <li><a href="/products" className="hover:text-primary">Sản phẩm</a></li>
              {product.category && (
                <>
                  <li>/</li>
                  <li><a href={`/products?categoryId=${product.category.id}`} className="hover:text-primary">{product.category.name}</a></li>
                </>
              )}
              <li>/</li>
              <li className="text-gray-900 font-medium">{product.name}</li>
            </ol>
          </nav>

          {/* Product Detail */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-9xl">📚</span>
                  </div>
                )}
                {hasDiscount && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-lg font-semibold">
                    -{product.discountPercent}%
                  </span>
                )}
              </div>
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === idx ? "border-primary" : "border-gray-200"
                      }`}
                    >
                      <Image src={img} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div>
                {product.category && (
                  <span className="text-sm text-gray-500">{product.category.name}</span>
                )}
                <h1 className="text-3xl font-bold text-gray-900 mt-1">{product.name}</h1>
                {product.author && (
                  <p className="text-lg text-gray-600 mt-2">Tác giả: {product.author}</p>
                )}
                {product.publisher && (
                  <p className="text-gray-500">Nhà xuất bản: {product.publisher}</p>
                )}
              </div>

              {/* Rating */}
              {product.avgRating && product.avgRating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.round(product.avgRating!)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">
                    {product.avgRating.toFixed(1)} ({product.reviewCount} đánh giá)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-primary">
                    {formatCurrency(product.currentPrice)}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="text-lg text-red-500 font-medium">
                        Tiết kiệm {formatCurrency(product.price - product.currentPrice)}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {product.inStock ? (
                    <span className="text-green-600">Còn hàng ({product.stockQuantity} sản phẩm)</span>
                  ) : (
                    <span className="text-red-600">Hết hàng</span>
                  )}
                </p>
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-gray-600">{product.shortDescription}</p>
              )}

              {/* Quantity & Add to Cart */}
              {product.inStock && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">Số lượng:</span>
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 hover:bg-gray-100"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 text-center border-x py-2"
                        min="1"
                        max={product.stockQuantity}
                      />
                      <button
                        onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                        className="p-2 hover:bg-gray-100"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <Button
                      size="lg"
                      onClick={() => addToCartMutation.mutate(quantity)}
                      disabled={addToCartMutation.isPending}
                      className="flex-1"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      {addToCartMutation.isPending ? "Đang thêm..." : "Thêm vào giỏ hàng"}
                    </Button>
                    <Button variant="outline" size="lg">
                      <Heart className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="lg">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="grid grid-cols-1 gap-3 pt-4 border-t">
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="h-5 w-5 text-gray-400" />
                  <span>Miễn phí giao hàng cho đơn từ 200.000đ</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <span>100% sản phẩm chính hãng</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <RotateCcw className="h-5 w-5 text-gray-400" />
                  <span>Đổi trả trong 7 ngày</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Mô Tả Sản Phẩm</h2>
              <div className="prose max-w-none">
                <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
              </div>
            </div>
          )}

          {/* Reviews */}
          {reviewsData && reviewsData.content.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Đánh Giá Sản Phẩm</h2>
              <div className="space-y-4">
                {reviewsData.content.map((review) => (
                  <div key={review.id} className="bg-white rounded-lg border p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {review.user.avatarUrl ? (
                          <Image src={review.user.avatarUrl} alt="" fill className="rounded-full" />
                        ) : (
                          <span className="text-gray-500 font-medium">
                            {review.user.fullName?.[0] || "U"}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{review.user.fullName || "Người dùng"}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          {review.isVerifiedPurchase && (
                            <span className="text-xs text-green-600">Đã mua hàng</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-600">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Products */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Sản Phẩm Liên Quan</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
