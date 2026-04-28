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
  resolveProductFallbackImage,
} from "@/lib/product-images";
import { buildLoginRedirect, cn, formatCurrency } from "@/lib/utils";
import { ProductImage } from "@/components/ui/ProductImage";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  isAddingToCart?: boolean;
  imagePriority?: boolean;
  imageSizes?: string;
}

const DEFAULT_PRODUCT_CARD_IMAGE_SIZES =
  "(min-width: 1536px) 16vw, (min-width: 1280px) 18vw, (min-width: 1024px) 22vw, (min-width: 768px) 25vw, 50vw";

export function ProductCard({
  product,
  onAddToCart,
  isAddingToCart = false,
  imagePriority = false,
  imageSizes = DEFAULT_PRODUCT_CARD_IMAGE_SIZES,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { isInWishlist, toggleWishlist, isAdding, isRemoving } = useWishlist();

  const hasDiscount = Boolean(
    product.discountPercent && product.discountPercent > 0,
  );
  const hasRating = Boolean(product.avgRating && product.avgRating > 0);
  const addToCartDisabled = !product.inStock || !onAddToCart || isAddingToCart;
  const isWishlistPending = isAdding || isRemoving;
  const isWishlisted = isAuthenticated && isInWishlist(product.id);
  const productHref = `/products/${product.id}`;
  const imageSrc = resolveProductImageSource(product);
  const fallbackSrc = resolveProductFallbackImage(product);

  const handleProductNavigation = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

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
      className="eleven-surface group relative overflow-hidden rounded-[26px] bg-white transition-transform duration-300 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f5f2ef]">
        <Link
          href={productHref}
          scroll
          onClick={handleProductNavigation}
          className="block h-full"
        >
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-[#e8dfd6]" />
          )}

          {imageSrc ? (
            <ProductImage
              src={imageSrc}
              fallbackSrc={fallbackSrc}
              alt={product.name}
              fill
              sizes={imageSizes}
              priority={imagePriority}
              className={cn(
                "object-contain p-4 transition-all duration-700",
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
              <BookOpen className="h-16 w-16 text-[#b7a99b]" />
            </div>
          )}

          <div
            className={cn(
              "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent transition-opacity duration-300",
              isHovered ? "opacity-100" : "opacity-0",
            )}
          />

          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {hasDiscount && (
              <span className="rounded-full bg-black px-3 py-1.5 text-xs font-bold text-white shadow-[rgba(0,0,0,0.12)_0_6px_16px]">
                -{product.discountPercent}%
              </span>
            )}
            {product.isNew && (
              <span className="eleven-pill-white px-3 py-1.5 text-xs font-bold">
                {t("common.newArrival")}
              </span>
            )}
            {product.isBestseller && (
              <span className="eleven-pill-stone px-3 py-1.5 text-xs font-bold">
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
            "absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/94 shadow-[rgba(0,0,0,0.12)_0_6px_18px] transition-all duration-300 hover:bg-white",
            isWishlisted
              ? "scale-105 text-red-500"
              : "text-[#777169] hover:scale-105 hover:text-red-500",
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
            className="eleven-pill-black flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-transform duration-300 hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
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
        onClick={handleProductNavigation}
        className="block bg-white p-5"
      >
        {product.category && (
          <p className="mb-2 line-clamp-1 text-xs font-bold tracking-[0.02em] text-[#777169]">
            {product.category.name}
          </p>
        )}

        <h3 className="mb-1 line-clamp-2 min-h-[2.5rem] font-medium leading-tight text-black underline-offset-4 transition-all duration-300 group-hover:underline">
          {product.name}
        </h3>

        {product.author && (
          <p className="eleven-muted mb-3 truncate text-sm">{product.author}</p>
        )}

        {hasRating && (
          <div className="mb-3 flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={cn(
                    "transition-colors duration-200",
                    i < Math.round(product.avgRating!)
                      ? "fill-[#b7a99b] text-[#b7a99b]"
                      : "text-[#ddd7d0]",
                  )}
                />
              ))}
            </div>
            <span className="eleven-muted text-xs">
              ({product.reviewCount} {t("common.reviews")})
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-xl font-semibold text-black">
            {formatCurrency(product.currentPrice)}
          </span>
          {hasDiscount && (
            <span className="text-sm font-medium text-[#a64b4b] line-through decoration-[#a64b4b]/30">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          {product.inStock ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#3f7a4f]">
              <span className="h-2 w-2 rounded-full bg-[#3f7a4f]" />
              {t("common.inStock")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#a64b4b]">
              <span className="h-2 w-2 rounded-full bg-[#a64b4b]" />
              {t("common.outOfStock")}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
