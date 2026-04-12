"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { toast } from "@/components/ui/toaster";
import { api } from "@/lib/api";
import { useCartStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import { buildLoginRedirect } from "@/lib/utils";

interface CartPayload {
  items: import("@/lib/store").CartItem[];
  totalItems: number;
  total: number;
}

interface AddToCartInput {
  productId: number;
  quantity: number;
  productName: string;
}

function getCurrentRedirectPath(fallbackPath: string) {
  if (typeof window === "undefined") {
    return fallbackPath;
  }

  const { pathname, search } = window.location;
  return `${pathname}${search}`;
}

export function useAddToCart(fallbackRedirectPath = "/products") {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { setCart } = useCartStore();

  const mutation = useMutation({
    mutationFn: async ({ productId, quantity }: AddToCartInput) => {
      const response = await api.post("/cart/items", { productId, quantity });
      return response.data as CartPayload;
    },
    onSuccess: (data, variables) => {
      setCart(data.items, data.totalItems, data.total);
      queryClient.setQueryData(["cart"], data);
      queryClient.invalidateQueries({ queryKey: ["cart"] });

      toast.success(
        variables.quantity > 1
          ? `Đã thêm ${variables.quantity} cuốn "${variables.productName}" vào giỏ hàng`
          : `Đã thêm "${variables.productName}" vào giỏ hàng`
      );
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Không thể thêm sản phẩm vào giỏ hàng";
      toast.error(message);
    },
  });

  const addToCart = (product: Product, quantity = 1) => {
    if (!product.inStock) {
      toast.error("Sản phẩm hiện đang hết hàng");
      return;
    }

    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      router.push(buildLoginRedirect(getCurrentRedirectPath(fallbackRedirectPath)));
      return;
    }

    mutation.mutate({
      productId: product.id,
      quantity,
      productName: product.name,
    });
  };

  return {
    addToCart,
    isAddingToCart: mutation.isPending,
  };
}
