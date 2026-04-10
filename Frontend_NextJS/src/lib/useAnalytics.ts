"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export function useAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    trackEvent("page_view", "navigation", pathname);
  }, [pathname]);

  const trackProductView = (productId: number, productName: string, price: number) => {
    trackEvent("view_item", "ecommerce", productName);
  };

  const trackAddToCart = (productId: number, productName: string, price: number, quantity: number) => {
    trackEvent("add_to_cart", "ecommerce", productName);
  };

  const trackRemoveFromCart = (productId: number, productName: string) => {
    trackEvent("remove_from_cart", "ecommerce", productName);
  };

  const trackCheckout = (total: number, itemCount: number) => {
    trackEvent("begin_checkout", "ecommerce", `${itemCount} items`);
  };

  const trackPurchase = (orderId: string, total: number) => {
    trackEvent("purchase", "ecommerce", orderId);
  };

  const trackSearch = (keyword: string, resultCount: number) => {
    trackEvent("search", "site", keyword);
  };

  const trackLogin = (method: string) => {
    trackEvent("login", "auth", method);
  };

  const trackRegister = (method: string) => {
    trackEvent("sign_up", "auth", method);
  };

  return {
    trackProductView,
    trackAddToCart,
    trackRemoveFromCart,
    trackCheckout,
    trackPurchase,
    trackSearch,
    trackLogin,
    trackRegister,
  };
}
