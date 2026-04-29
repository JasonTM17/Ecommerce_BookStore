import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { getRequestLocale } from "@/lib/i18n/server";

const copy = {
  vi: {
    title: "Flash Sale sách",
    description:
      "Theo dõi flash sale sách theo khung giờ, deal đang bán, lịch mở bán và mức giảm nổi bật tại BookStore Vietnam.",
  },
  en: {
    title: "Book Flash Sale",
    description:
      "Track timed book deals, live campaigns, upcoming launches, and best discounts at BookStore Vietnam.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = copy[locale];

  return buildMetadata({
    path: "/flash-sale",
    title: page.title,
    description: page.description,
    tags: ["flash sale", "book deals", "discount books"],
  });
}

export default function FlashSaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
