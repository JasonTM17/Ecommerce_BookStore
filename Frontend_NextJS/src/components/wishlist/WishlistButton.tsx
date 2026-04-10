"use client";

import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

export function WishlistButton({
  productId,
  size = "md",
  variant = "outline",
  className,
}: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist, isAdding, isRemoving } = useWishlist();
  const [isToggling, setIsToggling] = useState(false);

  const inWishlist = isInWishlist(productId);
  const isLoading = isAdding || isRemoving || isToggling;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsToggling(true);
    try {
      await toggleWishlist(productId);
    } finally {
      setIsToggling(false);
    }
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "rounded-full transition-all duration-200",
        inWishlist
          ? "bg-red-500 hover:bg-red-600 border-red-500 text-white"
          : "bg-white/80 hover:bg-white border-gray-200 text-gray-600 hover:text-red-500",
        sizeClasses[size],
        className
      )}
      title={inWishlist ? "Xóa khỏi wishlist" : "Thêm vào wishlist"}
    >
      {isLoading ? (
        <Loader2 className={cn(iconSizes[size], "animate-spin")} />
      ) : (
        <Heart
          className={cn(
            iconSizes[size],
            "transition-transform duration-200",
            inWishlist && "fill-current scale-110"
          )}
        />
      )}
    </Button>
  );
}
