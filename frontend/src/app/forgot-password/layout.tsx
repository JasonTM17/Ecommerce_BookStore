import type { Metadata } from "next";
import { buildLocalizedRouteMetadata } from "@/lib/seo/route-metadata";

const copy = {
  vi: {
    title: "Quên mật khẩu",
    description:
      "Khôi phục quyền truy cập tài khoản BookStore Vietnam bằng quy trình đặt lại mật khẩu rõ ràng và an toàn.",
  },
  en: {
    title: "Forgot Password",
    description:
      "Recover access to your BookStore Vietnam account with a clear and secure password reset flow.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedRouteMetadata({ copy, path: "/forgot-password" });
}

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
