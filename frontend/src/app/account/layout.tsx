import type { Metadata } from "next";
import { buildLocalizedRouteMetadata } from "@/lib/seo/route-metadata";

const copy = {
  vi: {
    title: "Tài khoản",
    description:
      "Quản lý thông tin tài khoản, bảo mật và trải nghiệm mua sách cá nhân tại BookStore Vietnam.",
  },
  en: {
    title: "Account",
    description:
      "Manage account details, security, and your personalized BookStore Vietnam shopping experience.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedRouteMetadata({ copy, path: "/account" });
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
