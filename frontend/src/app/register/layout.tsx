import type { Metadata } from "next";
import { buildLocalizedRouteMetadata } from "@/lib/seo/route-metadata";

const copy = {
  vi: {
    title: "Đăng ký",
    description:
      "Tạo tài khoản BookStore Vietnam để lưu wishlist, checkout nhanh và nhận ưu đãi sách phù hợp.",
  },
  en: {
    title: "Create Account",
    description:
      "Create a BookStore Vietnam account to save wishlists, check out faster, and receive relevant book offers.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedRouteMetadata({ copy, path: "/register" });
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
