import type { Metadata } from "next";
import { buildLocalizedRouteMetadata } from "@/lib/seo/route-metadata";

const copy = {
  vi: {
    title: "Điều khoản sử dụng",
    description:
      "Điều khoản sử dụng dịch vụ, mua hàng và tài khoản tại BookStore Vietnam.",
  },
  en: {
    title: "Terms of Use",
    description:
      "Terms for using BookStore Vietnam services, shopping flows, and accounts.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedRouteMetadata({ copy, path: "/terms" });
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
