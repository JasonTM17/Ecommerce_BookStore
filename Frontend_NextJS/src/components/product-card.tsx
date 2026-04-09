import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Star, ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const hasDiscount = product.discountPercent && product.discountPercent > 0;

  return (
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl text-gray-300">📚</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {hasDiscount && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                -{product.discountPercent}%
              </span>
            )}
            {product.isNew && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                Mới
              </span>
            )}
            {product.isBestseller && (
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">
                Bán chạy
              </span>
            )}
          </div>

          {/* Quick Add to Cart */}
          {onAddToCart && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToCart(product);
              }}
              className="absolute bottom-2 right-2 w-10 h-10 bg-primary text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-primary/90"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="p-4">
          {/* Category */}
          {product.category && (
            <p className="text-xs text-gray-500 mb-1">{product.category.name}</p>
          )}

          {/* Title */}
          <h3 className="font-medium text-gray-900 line-clamp-2 mb-1 hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Author */}
          {product.author && (
            <p className="text-sm text-gray-600 mb-2">{product.author}</p>
          )}

          {/* Rating */}
          {product.avgRating && product.avgRating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.round(product.avgRating!)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                ({product.reviewCount} đánh giá)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">
              {formatCurrency(product.currentPrice)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="mt-2">
            {product.inStock ? (
              <span className="text-xs text-green-600">Còn hàng</span>
            ) : (
              <span className="text-xs text-red-600">Hết hàng</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
