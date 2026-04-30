import type { Metadata } from "next";
import { buildLocalizedRouteMetadata } from "@/lib/seo/route-metadata";

const copy = {
  vi: {
    title: "Admin Dashboard",
    description:
      "Khu vực quản trị BookStore Vietnam cho sản phẩm, đơn hàng, người dùng và trạng thái vận hành.",
  },
  en: {
    title: "Admin Dashboard",
    description:
      "BookStore Vietnam administration area for products, orders, users, and operational status.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedRouteMetadata({
    copy,
    path: "/admin",
    tags: ["admin", "bookstore operations", "order management"],
  });
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
