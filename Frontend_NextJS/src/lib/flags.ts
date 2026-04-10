const flags = {
  enableChatbot: process.env.NEXT_PUBLIC_FLAG_ENABLE_CHATBOT === "true",
  enableFlashSale: process.env.NEXT_PUBLIC_FLAG_ENABLE_FLASH_SALE === "true",
  enableBookClub: process.env.NEXT_PUBLIC_FLAG_ENABLE_BOOK_CLUB === "true",
  enableReadingTracker: process.env.NEXT_PUBLIC_FLAG_ENABLE_READING_TRACKER === "true",
  enableWishlistNotifications: process.env.NEXT_PUBLIC_FLAG_ENABLE_WISHLIST_NOTIFICATIONS === "true",
  enableCoupon: process.env.NEXT_PUBLIC_FLAG_ENABLE_COUPON === "true",
  enableRating: process.env.NEXT_PUBLIC_FLAG_ENABLE_RATING === "true",
  enableDarkMode: process.env.NEXT_PUBLIC_FLAG_ENABLE_DARK_MODE === "true",
  maintenanceMode: process.env.NEXT_PUBLIC_FLAG_MAINTENANCE_MODE === "true",
} as const;

export type FeatureFlag = keyof typeof flags;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return flags[flag] ?? false;
}

export function getAllFlags() {
  return { ...flags };
}

export { flags };
