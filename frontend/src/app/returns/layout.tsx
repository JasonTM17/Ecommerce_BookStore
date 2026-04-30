import type { Metadata } from "next";
import { buildLocalizedRouteMetadata } from "@/lib/seo/route-metadata";

const copy = {
  vi: {
    title: "Chính sách đổi trả",
    description:
      "Quy định đổi trả, hoàn tiền và hỗ trợ sau mua hàng tại BookStore Vietnam.",
  },
  en: {
    title: "Returns Policy",
    description:
      "Return, refund, and after-purchase support policy for BookStore Vietnam.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedRouteMetadata({ copy, path: "/returns" });
}

export default function ReturnsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
