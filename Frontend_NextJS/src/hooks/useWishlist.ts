"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistApi, WishlistItem } from "@/lib/wishlist";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/ui/use-toast";

export function useWishlist() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get wishlist items
  const {
    data: wishlistItems = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => wishlistApi.getWishlist(),
    enabled: isAuthenticated,
  });

  // Get wishlist count
  const { data: wishlistCount = 0 } = useQuery({
    queryKey: ["wishlist-count"],
    queryFn: () => wishlistApi.getWishlistCount(),
    enabled: isAuthenticated,
  });

  // Add to wishlist mutation
  const addMutation = useMutation({
    mutationFn: (productId: number) => wishlistApi.addToWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-count"] });
      toast.success("Đã thêm vào danh sách yêu thích", { description: "Thành công" });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Không thể thêm vào wishlist", { description: "Lỗi" });
    },
  });

  // Remove from wishlist mutation
  const removeMutation = useMutation({
    mutationFn: (productId: number) => wishlistApi.removeFromWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-count"] });
      toast.success("Đã xóa khỏi danh sách yêu thích", { description: "Thành công" });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Không thể xóa khỏi wishlist", { description: "Lỗi" });
    },
  });

  // Check if product is in wishlist
  const isInWishlist = useCallback(
    (productId: number): boolean => {
      return wishlistItems.some((item) => item.product.id === productId);
    },
    [wishlistItems]
  );

  // Add to wishlist
  const addToWishlist = useCallback(
    async (productId: number) => {
      if (!isAuthenticated) {
        toast.error("Vui lòng đăng nhập để sử dụng tính năng này", { description: "Yêu cầu đăng nhập" });
        return;
      }
      await addMutation.mutateAsync(productId);
    },
    [isAuthenticated, addMutation, toast]
  );

  // Remove from wishlist
  const removeFromWishlist = useCallback(
    async (productId: number) => {
      await removeMutation.mutateAsync(productId);
    },
    [removeMutation]
  );

  // Toggle wishlist
  const toggleWishlist = useCallback(
    async (productId: number) => {
      if (isInWishlist(productId)) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    },
    [isInWishlist, addToWishlist, removeFromWishlist]
  );

  return {
    wishlistItems,
    wishlistCount,
    isLoading,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    refetch,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
