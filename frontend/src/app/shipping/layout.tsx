import type { Metadata } from "next";
import { buildLocalizedRouteMetadata } from "@/lib/seo/route-metadata";

const copy = {
  vi: {
    title: "Chính sách giao hàng",
    description:
      "Thông tin giao hàng, thời gian xử lý và khu vực vận chuyển của BookStore Vietnam.",
  },
  en: {
    title: "Shipping Policy",
    description:
      "Shipping information, processing time, and delivery coverage for BookStore Vietnam.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedRouteMetadata({ copy, path: "/shipping" });
}

export default function ShippingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
