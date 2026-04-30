import type { Metadata } from "next";
import { buildLocalizedRouteMetadata } from "@/lib/seo/route-metadata";

const copy = {
  vi: {
    title: "Giới thiệu",
    description:
      "Tìm hiểu BookStore Vietnam, định hướng sản phẩm và trải nghiệm mua sách trực tuyến hiện đại.",
  },
  en: {
    title: "About",
    description:
      "Learn about BookStore Vietnam, the product direction, and its modern online book shopping experience.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedRouteMetadata({ copy, path: "/about" });
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
