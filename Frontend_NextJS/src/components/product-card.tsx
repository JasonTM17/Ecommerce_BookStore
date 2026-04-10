import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Star, ShoppingCart, Heart, Eye, BookOpen } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const hasDiscount = product.discountPercent && product.discountPercent > 0;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product);
  };

  return (
    <div 
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.id}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
          {/* Skeleton loader */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className={cn(
                "object-cover transition-all duration-700",
                isHovered ? "scale-110" : "scale-100",
                !imageLoaded && "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-gray-300" />
            </div>
          )}

          {/* Overlay on hover */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )} />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {hasDiscount && (
              <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                -{product.discountPercent}%
              </span>
            )}
            {product.isNew && (
              <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                Mới
              </span>
            )}
            {product.isBestseller && (
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                Bán chạy
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className={cn(
              "absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
              isWishlisted ? "text-red-500 scale-110" : "text-gray-400 hover:text-red-500",
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
            )}
          >
            <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
          </button>

          {/* Quick actions on hover */}
          <div className={cn(
            "absolute bottom-3 left-3 right-3 flex gap-2 transition-all duration-300",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Thêm vào giỏ</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          {product.category && (
            <p className="text-xs text-blue-600 font-medium mb-2 uppercase tracking-wide">
              {product.category.name}
            </p>
          )}

          {/* Title */}
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors duration-300 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Author */}
          {product.author && (
            <p className="text-sm text-gray-500 mb-3 truncate">
              {product.author}
            </p>
          )}

          {/* Rating */}
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
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                ({product.reviewCount} đánh giá)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              {formatCurrency(product.currentPrice)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="mt-3 flex items-center gap-2">
            {product.inStock ? (
              <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Còn hàng
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                Hết hàng
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
