import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { getRequestLocale } from "@/lib/i18n/server";

const copy = {
  vi: {
    title: "Giỏ hàng",
    description:
      "Xem sách đã chọn, cập nhật số lượng, áp dụng ưu đãi và chuyển sang checkout an toàn tại BookStore Vietnam.",
  },
  en: {
    title: "Cart",
    description:
      "Review selected books, update quantities, apply offers, and continue to secure checkout at BookStore Vietnam.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = copy[locale];

  return buildMetadata({
    path: "/cart",
    title: page.title,
    description: page.description,
  });
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
