import type { Metadata } from "next";
import { buildLocalizedRouteMetadata } from "@/lib/seo/route-metadata";

const copy = {
  vi: {
    title: "Chính sách bảo mật",
    description:
      "Chính sách bảo mật dữ liệu và quyền riêng tư khi sử dụng BookStore Vietnam.",
  },
  en: {
    title: "Privacy Policy",
    description:
      "Data privacy and protection policy for using BookStore Vietnam.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedRouteMetadata({ copy, path: "/privacy" });
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
