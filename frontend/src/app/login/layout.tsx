import type { Metadata } from "next";
import { buildLocalizedRouteMetadata } from "@/lib/seo/route-metadata";

const copy = {
  vi: {
    title: "Đăng nhập",
    description:
      "Đăng nhập BookStore Vietnam để quản lý giỏ hàng, theo dõi đơn hàng và tiếp tục mua sách nhanh hơn.",
  },
  en: {
    title: "Sign In",
    description:
      "Sign in to BookStore Vietnam to manage your cart, track orders, and continue shopping faster.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedRouteMetadata({ copy, path: "/login" });
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
