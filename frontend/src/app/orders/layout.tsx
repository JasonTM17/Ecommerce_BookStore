import type { Metadata } from "next";
import { buildLocalizedRouteMetadata } from "@/lib/seo/route-metadata";

const copy = {
  vi: {
    title: "Đơn hàng",
    description:
      "Theo dõi lịch sử đơn hàng, trạng thái thanh toán và tiến trình mua sách tại BookStore Vietnam.",
  },
  en: {
    title: "Orders",
    description:
      "Track order history, payment status, and book purchase progress at BookStore Vietnam.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedRouteMetadata({ copy, path: "/orders" });
}

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
