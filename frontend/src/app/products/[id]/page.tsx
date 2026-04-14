"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Share2,
  Shield,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { FlashSaleCountdownCard } from "@/components/flashsale/FlashSaleCountdownCard";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/ui/ProductImage";
import { useAddToCart } from "@/hooks/useAddToCart";
import { useWishlist } from "@/hooks/useWishlist";
import { apiPublic } from "@/lib/api";
import {
  getCategoryPlaceholderImage,
  resolveProductImageSource,
} from "@/lib/product-images";
import { notifyToast } from "@/lib/toast";
import type { PageResponse, Product, Review } from "@/lib/types";
import { buildLoginRedirect, cn, formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";

function normalizeRouteParam(
  id: string | string[] | undefined,
): string | undefined {
  if (id === undefined || id === null) {
    return undefined;
  }

  return Array.isArray(id) ? id[0] : String(id);
}

const COPY = {
  vi: {
    invalidRoute: "Đường dẫn sản phẩm không hợp lệ",
    backToProducts: "Quay lại trang sản phẩm",
    notFoundTitle: "Sản phẩm không tồn tại",
    loadErrorTitle: "Không thể tải sản phẩm",
    loadErrorDescription:
      "Kiểm tra kết nối mạng và đảm bảo API backend đang chạy đúng cấu hình.",
    loading: "Đang tải sản phẩm...",
    breadcrumbHome: "Trang chủ",
    breadcrumbProducts: "Sản phẩm",
    authorPrefix: "Tác giả:",
    publisherPrefix: "Nhà xuất bản:",
    ratingSuffix: "đánh giá",
    savePrefix: "Tiết kiệm",
    inStock: (count: number) => `Còn hàng (${count} sản phẩm)`,
    outOfStock: "Hết hàng",
    quantity: "Số lượng:",
    addToCart: "Thêm vào giỏ hàng",
    addingToCart: "Đang thêm...",
    wishlistAdd: "Thêm vào danh sách yêu thích",
    wishlistRemove: "Xóa khỏi danh sách yêu thích",
    share: "Chia sẻ sản phẩm",
    freeShipping: "Miễn phí giao hàng cho đơn từ 200.000đ",
    authentic: "100% sản phẩm chính hãng",
    returns: "Đổi trả trong 7 ngày",
    description: "Mô tả sản phẩm",
    reviews: "Đánh giá sản phẩm",
    related: "Sản phẩm liên quan",
    productUnavailable: "Sản phẩm không còn khả dụng",
    noImage: "Ảnh sản phẩm",
    copied: "Đã sao chép liên kết sản phẩm",
    copyHint: "Bạn có thể chia sẻ ngay bây giờ.",
    shareFailed: "Không thể chia sẻ sản phẩm",
    shareFailedHint: "Vui lòng thử lại sau.",
    reviewFallbackUser: "Người dùng",
    verifiedPurchase: "Đã mua hàng",
  },
  en: {
    invalidRoute: "Invalid product route",
    backToProducts: "Back to products",
    notFoundTitle: "Product does not exist",
    loadErrorTitle: "Unable to load product",
    loadErrorDescription:
      "Check your network connection and make sure the backend API is running.",
    loading: "Loading product...",
    breadcrumbHome: "Home",
    breadcrumbProducts: "Products",
    authorPrefix: "Author:",
    publisherPrefix: "Publisher:",
    ratingSuffix: "reviews",
    savePrefix: "Save",
    inStock: (count: number) => `In stock (${count} items)`,
    outOfStock: "Out of stock",
    quantity: "Quantity:",
    addToCart: "Add to cart",
    addingToCart: "Adding...",
    wishlistAdd: "Add to wishlist",
    wishlistRemove: "Remove from wishlist",
    share: "Share product",
    freeShipping: "Free shipping on orders over 200,000đ",
    authentic: "100% authentic products",
    returns: "7-day returns",
    description: "Product description",
    reviews: "Product reviews",
    related: "Related products",
    productUnavailable: "This product is no longer available",
    noImage: "Product image",
    copied: "Product link copied",
    copyHint: "You can share it right away.",
    shareFailed: "Unable to share product",
    shareFailedHint: "Please try again later.",
    reviewFallbackUser: "User",
    verifiedPurchase: "Verified purchase",
  },
} as const;

export default function ProductDetailPage() {
  const { locale } = useLanguage();
  const copy = COPY[locale];
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const { addToCart, isAddingToCart } = useAddToCart();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist, isAdding, isRemoving } = useWishlist();
  const { toast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const productId = normalizeRouteParam(
    params.id as string | string[] | undefined,
  );
  const numericId = productId !== undefined ? Number(productId) : Number.NaN;
  const idValid = Boolean(
    productId && !Number.isNaN(numericId) && numericId > 0,
  );

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [productId]);

  const {
    data: product,
    isLoading,
    isError,
    error,
    isFetched,
    refetch: refetchProduct,
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
      const response = await apiPublic.get(
        `/products/${productId}/related?categoryId=${product!.category!.id}`,
      );
      return response.data as Product[];
    },
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["reviews", productId],
    enabled: idValid,
    queryFn: async () => {
      const response = await apiPublic.get(
        `/reviews/product/${productId}?page=0&size=5`,
      );
      return response.data as PageResponse<Review>;
    },
  });

  const handleToggleWishlist = async () => {
    if (!product) {
      return;
    }

    if (!isAuthenticated) {
      router.push(buildLoginRedirect(pathname || `/products/${product.id}`));
      return;
    }

    await toggleWishlist(product.id);
  };

  const handleShare = async () => {
    if (!product) {
      return;
    }

    const shareUrl =
      typeof window === "undefined"
        ? `/products/${product.id}`
        : window.location.href;

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.shortDescription || product.name,
          url: shareUrl,
        });
        return;
      }

      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        notifyToast(toast, "success", copy.copied, {
          description: copy.copyHint,
        });
        return;
      }

      throw new Error("Clipboard API is unavailable");
    } catch {
      notifyToast(toast, "error", copy.shareFailed, {
        description: copy.shareFailedHint,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="aspect-square rounded-3xl bg-gray-200" />
                <div className="space-y-4">
                  <div className="h-6 w-32 rounded bg-gray-200" />
                  <div className="h-10 w-3/4 rounded bg-gray-200" />
                  <div className="h-8 w-1/2 rounded bg-gray-200" />
                  <div className="h-40 rounded-3xl bg-gray-200" />
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
            <h1 className="mb-4 text-2xl font-bold text-gray-900">
              {copy.invalidRoute}
            </h1>
            <Button onClick={() => router.push("/products")}>
              {copy.backToProducts}
            </Button>
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
            <h1 className="mb-4 text-2xl font-bold text-gray-900">
              {notFound ? copy.notFoundTitle : copy.loadErrorTitle}
            </h1>
            <p className="mb-6 text-gray-600">
              {notFound ? copy.productUnavailable : copy.loadErrorDescription}
            </p>
            <Button onClick={() => router.push("/products")}>
              {copy.backToProducts}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">{copy.loading}</p>
      </div>
    );
  }

  const hasDiscount = Boolean(
    product.discountPercent && product.discountPercent > 0,
  );
  const isWishlistPending = isAdding || isRemoving;
  const isWishlisted = isAuthenticated && isInWishlist(product.id);
  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : product.imageUrl
        ? [product.imageUrl]
        : [resolveProductImageSource(product)];
  const selectedGalleryImage = galleryImages[selectedImage] || galleryImages[0];
  const fallbackSrc = getCategoryPlaceholderImage(product.category?.name);
  const hasActiveFlashSaleCountdown =
    Boolean(product.activeFlashSale) &&
    product.currentPrice < product.price &&
    new Date(product.activeFlashSale!.endTime).getTime() > Date.now();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <nav className="mb-6 text-sm">
            <ol className="flex flex-wrap items-center gap-2 text-gray-600">
              <li>
                <Link href="/" className="hover:text-primary">
                  {copy.breadcrumbHome}
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/products" className="hover:text-primary">
                  {copy.breadcrumbProducts}
                </Link>
              </li>
              {product.category ? (
                <>
                  <li>/</li>
                  <li>
                    <Link
                      href={`/products?categoryId=${product.category.id}`}
                      className="hover:text-primary"
                    >
                      {product.category.name}
                    </Link>
                  </li>
                </>
              ) : null}
              <li>/</li>
              <li className="font-medium text-gray-900">{product.name}</li>
            </ol>
          </nav>

          <div className="mb-12 grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-3xl bg-gray-100 shadow-sm">
                <ProductImage
                  src={selectedGalleryImage}
                  fallbackSrc={fallbackSrc}
                  alt={product.name || copy.noImage}
                  fill
                  className="object-cover"
                  priority
                />
                {hasDiscount ? (
                  <span className="absolute left-4 top-4 rounded-xl bg-red-500 px-3 py-1.5 text-sm font-semibold text-white shadow-lg">
                    -{product.discountPercent}%
                  </span>
                ) : null}
              </div>

              {galleryImages.length > 1 ? (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {galleryImages.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        "relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-gray-100 transition",
                        selectedImage === index
                          ? "border-primary"
                          : "border-gray-200",
                      )}
                    >
                      <ProductImage
                        src={image}
                        fallbackSrc={fallbackSrc}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="space-y-6">
              <div>
                {product.category ? (
                  <span className="text-sm font-medium text-gray-500">
                    {product.category.name}
                  </span>
                ) : null}
                <h1 className="mt-1 text-3xl font-bold text-gray-900">
                  {product.name}
                </h1>
                {product.author ? (
                  <p className="mt-2 text-lg text-gray-600">
                    {copy.authorPrefix} {product.author}
                  </p>
                ) : null}
                {product.publisher ? (
                  <p className="text-gray-500">
                    {copy.publisherPrefix} {product.publisher}
                  </p>
                ) : null}
              </div>

              {product.avgRating && product.avgRating > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        className={cn(
                          "h-5 w-5",
                          index < Math.round(product.avgRating ?? 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300",
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">
                    {product.avgRating.toFixed(1)} ({product.reviewCount}{" "}
                    {copy.ratingSuffix})
                  </span>
                </div>
              ) : null}

              <div
                className="rounded-3xl bg-gray-50 p-6"
                data-testid="product-detail-price-panel"
              >
                <div className="flex flex-wrap items-baseline gap-3">
                  <span
                    className="text-4xl font-bold text-primary"
                    data-testid="product-detail-current-price"
                  >
                    {formatCurrency(product.currentPrice)}
                  </span>
                  {hasDiscount ? (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="text-lg font-medium text-red-500">
                        {copy.savePrefix}{" "}
                        {formatCurrency(product.price - product.currentPrice)}
                      </span>
                    </>
                  ) : null}
                </div>
                <p className="mt-2 text-sm">
                  {product.inStock ? (
                    <span className="text-green-600">
                      {copy.inStock(product.stockQuantity)}
                    </span>
                  ) : (
                    <span className="text-red-600">{copy.outOfStock}</span>
                  )}
                </p>
              </div>

              {hasActiveFlashSaleCountdown && product.activeFlashSale ? (
                <FlashSaleCountdownCard
                  locale={locale}
                  endTime={product.activeFlashSale.endTime}
                  remainingStock={product.activeFlashSale.remainingStock}
                  maxPerUser={product.activeFlashSale.maxPerUser}
                  stockLimit={product.activeFlashSale.stockLimit}
                  soldCount={product.activeFlashSale.soldCount}
                  onExpire={() => {
                    void refetchProduct();
                  }}
                />
              ) : null}

              {product.shortDescription ? (
                <p className="text-lg leading-8 text-gray-600">
                  {product.shortDescription}
                </p>
              ) : null}

              {product.inStock ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">{copy.quantity}</span>
                    <div className="flex items-center rounded-2xl border border-gray-200 bg-white">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-3 hover:bg-gray-50"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(event) =>
                          setQuantity(
                            Math.max(
                              1,
                              Number.parseInt(event.target.value, 10) || 1,
                            ),
                          )
                        }
                        className="w-20 border-x border-gray-200 py-3 text-center"
                        min="1"
                        max={product.stockQuantity}
                      />
                      <button
                        onClick={() =>
                          setQuantity(
                            Math.min(product.stockQuantity, quantity + 1),
                          )
                        }
                        className="p-3 hover:bg-gray-50"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <Button
                      size="lg"
                      onClick={() => addToCart(product, quantity)}
                      disabled={isAddingToCart}
                      data-testid="product-detail-add-to-cart"
                      className="min-w-[220px] flex-1"
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      {isAddingToCart ? copy.addingToCart : copy.addToCart}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleToggleWishlist}
                      disabled={isWishlistPending}
                      data-testid="product-detail-wishlist"
                      aria-label={
                        isWishlisted ? copy.wishlistRemove : copy.wishlistAdd
                      }
                      className={cn(
                        "h-12 w-12 px-0",
                        isWishlisted &&
                          "border-red-200 text-red-500 hover:bg-red-50",
                      )}
                    >
                      <Heart
                        className={cn(
                          "h-5 w-5",
                          isWishlisted && "fill-current",
                        )}
                      />
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleShare}
                      data-testid="product-detail-share"
                      aria-label={copy.share}
                      className="h-12 w-12 px-0"
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-3 border-t border-gray-100 pt-4">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck className="h-5 w-5 text-gray-400" />
                  <span>{copy.freeShipping}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <span>{copy.authentic}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <RotateCcw className="h-5 w-5 text-gray-400" />
                  <span>{copy.returns}</span>
                </div>
              </div>
            </div>
          </div>

          {product.description ? (
            <section className="mb-12">
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                {copy.description}
              </h2>
              <div className="prose max-w-none text-gray-600">
                <p className="whitespace-pre-line">{product.description}</p>
              </div>
            </section>
          ) : null}

          {reviewsData && reviewsData.content.length > 0 ? (
            <section className="mb-12">
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                {copy.reviews}
              </h2>
              <div className="space-y-4">
                {reviewsData.content.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-2xl border border-gray-100 bg-white p-4"
                  >
                    <div className="mb-2 flex items-center gap-3">
                      <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                        {review.user.avatarUrl ? (
                          <Image
                            src={review.user.avatarUrl}
                            alt=""
                            fill
                            className="rounded-full"
                          />
                        ) : (
                          <span className="font-medium text-gray-500">
                            {review.user.fullName?.[0] || "U"}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {review.user.fullName || copy.reviewFallbackUser}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, index) => (
                              <Star
                                key={index}
                                className={cn(
                                  "h-4 w-4",
                                  index < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300",
                                )}
                              />
                            ))}
                          </div>
                          {review.isVerifiedPurchase ? (
                            <span className="text-xs text-green-600">
                              {copy.verifiedPurchase}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    {review.comment ? (
                      <p className="text-gray-600">{review.comment}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {relatedProducts && relatedProducts.length > 0 ? (
            <section>
              <h2 className="mb-6 text-xl font-bold text-gray-900">
                {copy.related}
              </h2>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-5">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                    onAddToCart={(productToAdd) => addToCart(productToAdd, 1)}
                    isAddingToCart={isAddingToCart}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
