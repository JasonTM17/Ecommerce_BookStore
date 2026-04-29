import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { getRequestLocale } from "@/lib/i18n/server";

const copy = {
  vi: {
    title: "Sản phẩm",
    description:
      "Khám phá catalog sách chính hãng tại BookStore Vietnam với tìm kiếm, lọc danh mục, giá tốt và trải nghiệm mua sắm hiện đại.",
  },
  en: {
    title: "Products",
    description:
      "Browse authentic books at BookStore Vietnam with search, category filters, better prices, and a polished shopping flow.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = copy[locale];

  return buildMetadata({
    path: "/products",
    title: page.title,
    description: page.description,
    tags: ["bookstore", "books", "catalog", "online shopping"],
  });
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
