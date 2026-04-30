import type { Metadata } from "next";
import { buildLocalizedRouteMetadata } from "@/lib/seo/route-metadata";

const copy = {
  vi: {
    title: "Câu hỏi thường gặp",
    description:
      "Giải đáp các câu hỏi phổ biến về mua sách, thanh toán, giao hàng và tài khoản BookStore Vietnam.",
  },
  en: {
    title: "Frequently Asked Questions",
    description:
      "Answers to common questions about book shopping, payment, delivery, and BookStore Vietnam accounts.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedRouteMetadata({ copy, path: "/faq" });
}

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
