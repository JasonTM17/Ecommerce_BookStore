import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { getRequestLocale } from "@/lib/i18n/server";

const copy = {
  vi: {
    title: "Danh mục sách",
    description:
      "Duyệt sách theo danh mục, chủ đề và nhà xuất bản để tìm nhanh đầu sách phù hợp tại BookStore Vietnam.",
  },
  en: {
    title: "Book categories",
    description:
      "Explore books by category, topic, and publisher to find the right title quickly at BookStore Vietnam.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = copy[locale];

  return buildMetadata({
    path: "/categories",
    title: page.title,
    description: page.description,
    tags: ["book categories", "book topics", "publishers"],
  });
}

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
