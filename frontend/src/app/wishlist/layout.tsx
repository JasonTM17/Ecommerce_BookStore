import type { Metadata } from "next";
import { buildLocalizedRouteMetadata } from "@/lib/seo/route-metadata";

const copy = {
  vi: {
    title: "Wishlist",
    description:
      "Lưu lại các tựa sách yêu thích và quay lại mua nhanh hơn tại BookStore Vietnam.",
  },
  en: {
    title: "Wishlist",
    description:
      "Save favorite books and return to them faster at BookStore Vietnam.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedRouteMetadata({ copy, path: "/wishlist" });
}

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
