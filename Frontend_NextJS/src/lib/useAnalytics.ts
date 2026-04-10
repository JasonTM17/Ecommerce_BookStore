"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export function useAnalytics() {
  const pathname = usePathname();

  // Track page views on route change
  useEffect(() => {
    if (typeof window === "undefined") return;

    trackEvent("page_view", "navigation", pathname);
  }, [pathname]);

  const trackProductView = (productId: number, productName: string, price: number) => {
    trackEvent("view_item", "ecommerce", productName);
    trackEvent("product_view", "product", `${productId}`, price);
  };

  const trackAddToCart = (productId: number, productName: string, price: number, quantity: number) => {
    trackEvent("add_to_cart", "ecommerce", productName);
    trackEvent("add_to_cart", "cart", `${productId}`, quantity);
  };

  const trackRemoveFromCart = (productId: number, productName: string) => {
    trackEvent("remove_from_cart", "ecommerce", productName);
  };

  const trackCheckout = (total: number, itemCount: number) => {
    trackEvent("begin_checkout", "ecommerce", `${itemCount} items`);
    trackEvent("checkout", "cart", `${itemCount} items`, total);
  };

  const trackPurchase = (orderId: string, total: number, itemCount: number) => {
    trackEvent("purchase", "ecommerce", orderId, total);
  };

  const trackSearch = (keyword: string, resultCount: number) => {
    trackEvent("search", "site", keyword, resultCount);
  };

  const trackWishlistAdd = (productId: number, productName: string) => {
    trackEvent("add_to_wishlist", "ecommerce", productName);
  };

  const trackCouponApply = (couponCode: string, discount: number) => {
    trackEvent("apply_coupon", "promotion", couponCode, discount);
  };

  const trackLogin = (method: "email" | "google" | "facebook") => {
    trackEvent("login", "authentication", method);
  };

  const trackRegister = (method: "email" | "google" | "facebook") => {
    trackEvent("sign_up", "authentication", method);
  };

  return {
    trackProductView,
    trackAddToCart,
    trackRemoveFromCart,
    trackCheckout,
    trackPurchase,
    trackSearch,
    trackWishlistAdd,
    trackCouponApply,
    trackLogin,
    trackRegister,
  };
}
