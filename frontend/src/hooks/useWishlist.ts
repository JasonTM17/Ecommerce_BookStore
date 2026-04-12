"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistApi } from "@/lib/wishlist";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/ui/use-toast";
import { notifyToast } from "@/lib/toast";

export function useWishlist() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wishlistItems = [], isLoading, refetch } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => wishlistApi.getWishlist(),
    enabled: isAuthenticated,
  });

  const { data: wishlistCount = 0 } = useQuery({
    queryKey: ["wishlist-count"],
    queryFn: () => wishlistApi.getWishlistCount(),
    enabled: isAuthenticated,
  });

  const addMutation = useMutation({
    mutationFn: (productId: number) => wishlistApi.addToWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-count"] });
      notifyToast(toast, "success", "Đã thêm vào danh sách yêu thích", { description: "Thành công" });
    },
    onError: (error: any) => {
      notifyToast(toast, "error", error?.response?.data?.message || "Không thể thêm vào wishlist", {
        description: "Lỗi",
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (productId: number) => wishlistApi.removeFromWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-count"] });
      notifyToast(toast, "success", "Đã xóa khỏi danh sách yêu thích", { description: "Thành công" });
    },
    onError: (error: any) => {
      notifyToast(toast, "error", error?.response?.data?.message || "Không thể xóa khỏi wishlist", {
        description: "Lỗi",
      });
    },
  });

  const isInWishlist = useCallback(
    (productId: number): boolean => wishlistItems.some((item) => item.product.id === productId),
    [wishlistItems]
  );

  const addToWishlist = useCallback(
    async (productId: number) => {
      if (!isAuthenticated) {
        notifyToast(toast, "error", "Vui lòng đăng nhập để sử dụng tính năng này", {
          description: "Yêu cầu đăng nhập",
        });
        return;
      }
      await addMutation.mutateAsync(productId);
    },
    [isAuthenticated, addMutation, toast]
  );

  const removeFromWishlist = useCallback(async (productId: number) => {
    await removeMutation.mutateAsync(productId);
  }, [removeMutation]);

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
