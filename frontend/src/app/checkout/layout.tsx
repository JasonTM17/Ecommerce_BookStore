import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { getRequestLocale } from "@/lib/i18n/server";

const copy = {
  vi: {
    title: "Thanh toán",
    description:
      "Hoàn tất đơn hàng BookStore Vietnam với địa chỉ giao hàng, phương thức vận chuyển, COD hoặc VNPay khi được cấu hình.",
  },
  en: {
    title: "Checkout",
    description:
      "Complete your BookStore Vietnam order with shipping details, delivery method, COD, or VNPay when configured.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = copy[locale];

  return buildMetadata({
    path: "/checkout",
    title: page.title,
    description: page.description,
  });
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
