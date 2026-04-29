import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { getRequestLocale } from "@/lib/i18n/server";

const copy = {
  vi: {
    title: "Khuyến mãi",
    description:
      "Cập nhật coupon công khai, ưu đãi đơn hàng và chương trình khuyến mãi sách đang khả dụng tại BookStore Vietnam.",
  },
  en: {
    title: "Promotions",
    description:
      "Find public coupons, order offers, and active book promotions available at BookStore Vietnam.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = copy[locale];

  return buildMetadata({
    path: "/promotions",
    title: page.title,
    description: page.description,
    tags: ["coupons", "book promotions", "discount codes"],
  });
}

export default function PromotionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
