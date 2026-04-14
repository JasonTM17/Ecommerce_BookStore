"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Star, ShoppingCart, Heart, BookOpen } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useLanguage } from "@/components/providers/language-provider";
import { useWishlist } from "@/hooks/useWishlist";
import { Product } from "@/lib/types";
import {
  resolveProductImageSource,
  getCategoryPlaceholderImage,
} from "@/lib/product-images";
import { buildLoginRedirect, cn, formatCurrency } from "@/lib/utils";
import { ProductImage } from "@/components/ui/ProductImage";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  isAddingToCart?: boolean;
}

export function ProductCard({
  product,
  onAddToCart,
  isAddingToCart = false,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { isInWishlist, toggleWishlist, isAdding, isRemoving } = useWishlist();

  const hasDiscount = product.discountPercent && product.discountPercent > 0;
  const addToCartDisabled = !product.inStock || !onAddToCart || isAddingToCart;
  const isWishlistPending = isAdding || isRemoving;
  const isWishlisted = isAuthenticated && isInWishlist(product.id);
  const productHref = `/products/${product.id}`;
  const imageSrc = resolveProductImageSource(product);
  const fallbackSrc = getCategoryPlaceholderImage(product.category?.name);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(buildLoginRedirect(pathname));
      return;
    }

    await toggleWishlist(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (addToCartDisabled) {
      return;
    }
    onAddToCart?.(product);
  };

  return (
    <div
      data-testid="product-card"
      className="group relative bg-white/70 backdrop-blur-xl rounded-2xl overflow-hidden shadow border border-white/60 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 ring-1 ring-black/5 hover:ring-blue-500/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-200 overflow-hidden">
        <Link href={productHref} scroll className="block h-full">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}

          {imageSrc ? (
            <ProductImage
              src={imageSrc}
              fallbackSrc={fallbackSrc}
              alt={product.name}
              fill
              className={cn(
                "object-cover transition-all duration-700",
                isHovered ? "scale-110" : "scale-100",
                !imageLoaded && "opacity-0",
              )}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              aria-label={t("common.noImage")}
            >
              <BookOpen className="h-16 w-16 text-gray-300" />
            </div>
          )}

          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-all duration-500",
              isHovered ? "opacity-100" : "opacity-0",
            )}
          />

          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {hasDiscount && (
              <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                -{product.discountPercent}%
              </span>
            )}
            {product.isNew && (
              <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                {t("common.newArrival")}
              </span>
            )}
            {product.isBestseller && (
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                {t("common.bestseller")}
              </span>
            )}
          </div>
        </Link>

        <button
          onClick={handleWishlist}
          disabled={isWishlistPending}
          data-testid="product-card-wishlist"
          aria-label={
            isWishlisted
              ? t("common.removeFromWishlist")
              : t("common.addToWishlist")
          }
          className={cn(
            "absolute top-3 right-3 z-10 w-10 h-10 bg-white/90 backdrop-blur-md hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-500",
            isWishlisted
              ? "text-red-500 shadow-red-500/20 scale-110"
              : "text-gray-400 hover:text-red-500 hover:scale-110 hover:shadow-xl",
            isHovered
              ? "pointer-events-auto opacity-100 translate-y-0"
              : "pointer-events-none opacity-0 -translate-y-4",
            isWishlistPending && "cursor-not-allowed opacity-80",
          )}
        >
          <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
        </button>

        <div
          className={cn(
            "absolute bottom-3 left-3 right-3 z-10 flex gap-2 transition-all duration-300",
            isHovered
              ? "pointer-events-auto opacity-100 translate-y-0"
              : "pointer-events-none opacity-0 translate-y-4",
          )}
        >
          <button
            onClick={handleAddToCart}
            disabled={addToCartDisabled}
            data-testid="product-card-add-to-cart"
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 transition-all duration-500 hover:from-blue-500 hover:to-indigo-500 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>
              {!product.inStock
                ? t("common.outOfStock")
                : isAddingToCart
                  ? t("common.addingToCart")
                  : t("common.addToCart")}
            </span>
          </button>
        </div>
      </div>

      <Link
        href={productHref}
        scroll
        className="block p-5 bg-gradient-to-b from-white/50 to-white/90"
      >
        {product.category && (
          <p className="text-xs text-blue-600 font-medium mb-2 uppercase tracking-wide">
            {product.category.name}
          </p>
        )}

        <h3 className="font-bold text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 group-hover:underline decoration-blue-200 underline-offset-4 transition-all duration-300 min-h-[2.5rem]">
          {product.name}
        </h3>

        {product.author && (
          <p className="text-sm text-gray-500 mb-3 truncate">
            {product.author}
          </p>
        )}

        {product.avgRating && product.avgRating > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={cn(
                    "transition-colors duration-200",
                    i < Math.round(product.avgRating!)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300",
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({product.reviewCount} {t("common.reviews")})
            </span>
          </div>
        )}

        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {formatCurrency(product.currentPrice)}
          </span>
          {hasDiscount && (
            <span className="text-sm font-medium text-red-500 line-through decoration-red-500/30">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          {product.inStock ? (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {t("common.inStock")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              {t("common.outOfStock")}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
