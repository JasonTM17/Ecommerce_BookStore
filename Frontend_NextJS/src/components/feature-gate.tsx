"use client";

import { ReactNode } from "react";
import { isFeatureEnabled } from "@/lib/flags";

interface FeatureGateProps {
  flag: "enableChatbot" | "enableFlashSale" | "enableBookClub" | "enableReadingTracker" | "enableWishlistNotifications" | "enableCoupon" | "enableRating" | "enableDarkMode" | "maintenanceMode";
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({ flag, children, fallback = null }: FeatureGateProps) {
  if (!isFeatureEnabled(flag)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
