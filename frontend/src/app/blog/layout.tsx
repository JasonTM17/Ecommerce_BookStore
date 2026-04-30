import type { Metadata } from "next";
import { buildLocalizedRouteMetadata } from "@/lib/seo/route-metadata";

const copy = {
  vi: {
    title: "Blog",
    description:
      "Cập nhật nội dung đọc sách, gợi ý lựa chọn sách và câu chuyện sản phẩm từ BookStore Vietnam.",
  },
  en: {
    title: "Blog",
    description:
      "Read book recommendations, product stories, and reading updates from BookStore Vietnam.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedRouteMetadata({ copy, path: "/blog" });
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
