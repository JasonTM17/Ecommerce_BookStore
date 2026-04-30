import type { Metadata } from "next";
import { buildLocalizedRouteMetadata } from "@/lib/seo/route-metadata";

const copy = {
  vi: {
    title: "Liên hệ",
    description:
      "Liên hệ BookStore Vietnam để được hỗ trợ về đơn hàng, sản phẩm, hợp tác và thông tin dịch vụ.",
  },
  en: {
    title: "Contact",
    description:
      "Contact BookStore Vietnam for support with orders, products, partnerships, and service information.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedRouteMetadata({ copy, path: "/contact" });
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
