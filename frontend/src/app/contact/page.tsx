import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaticInfoPageShell } from "@/components/static-info-page";
import { getRequestLocale } from "@/lib/i18n/server";

type Locale = "vi" | "en";

const copy = {
  vi: {
    metadata: {
      title: "Liên hệ BookStore",
      description:
        "Kênh liên hệ chính thức của BookStore cho đơn hàng, tài khoản và hỗ trợ chung.",
    },
    shell: {
      badgeText: "Hỗ trợ",
      breadcrumbs: [{ label: "Liên hệ" }],
      description:
        "Cần hỗ trợ về đơn hàng, thanh toán hoặc tài khoản? Đây là các kênh liên hệ nhanh nhất.",
      title: "Liên hệ BookStore",
    },
    contactItems: [
      {
        label: "Hotline",
        value: "0901 234 567",
        href: "tel:+84901234567",
        note: "Hỗ trợ đơn hàng và hướng dẫn thanh toán",
      },
      {
        label: "Email",
        value: "support@bookstore.com",
        href: "mailto:support@bookstore.com",
        note: "Câu hỏi chung và đề xuất hợp tác",
      },
      {
        label: "Địa chỉ",
        value: "123 Đường ABC, Quận 1, TP. Hồ Chí Minh",
        href: "https://maps.google.com/?q=123%20ABC%20Street%2C%20District%201%2C%20HCMC",
        note: "Văn phòng và điểm liên hệ hỗ trợ",
      },
    ],
    supportHours: [
      "Thứ Hai đến Thứ Bảy: 8:00 - 20:00",
      "Chủ Nhật: 9:00 - 18:00",
      "Yêu cầu hỗ trợ đơn hàng được phản hồi trong một ngày làm việc",
    ],
    quickHeading: "Cần lối tắt tới đơn hàng hoặc FAQ?",
    quickBody:
      "Nếu bạn đang kiểm tra trạng thái đơn hàng hoặc cần một câu trả lời nhanh, đây thường là hai route hữu ích nhất.",
    quickOrders: "Xem đơn hàng",
    quickFaq: "Xem FAQ",
    quickFooter: "Hoặc quay lại catalog sản phẩm để tiếp tục mua sắm.",
  },
  en: {
    metadata: {
      title: "Contact BookStore",
      description:
        "BookStore's official contact page for orders, account help, and general support.",
    },
    shell: {
      badgeText: "Support",
      breadcrumbs: [{ label: "Contact" }],
      description:
        "Need help with orders, payments, or your account? These are the quickest support channels.",
      title: "Contact BookStore",
    },
    contactItems: [
      {
        label: "Hotline",
        value: "0901 234 567",
        href: "tel:+84901234567",
        note: "Order help and payment guidance",
      },
      {
        label: "Email",
        value: "support@bookstore.com",
        href: "mailto:support@bookstore.com",
        note: "General questions and partnership ideas",
      },
      {
        label: "Address",
        value: "123 ABC Street, District 1, Ho Chi Minh City",
        href: "https://maps.google.com/?q=123%20ABC%20Street%2C%20District%201%2C%20HCMC",
        note: "Office and support contact point",
      },
    ],
    supportHours: [
      "Monday to Saturday: 8:00 AM - 8:00 PM",
      "Sunday: 9:00 AM - 6:00 PM",
      "Order support requests are answered within one business day",
    ],
    quickHeading: "Need a shortcut to orders or FAQ?",
    quickBody:
      "If you're checking an order status or need a fast answer, these are usually the two most useful routes.",
    quickOrders: "View orders",
    quickFaq: "View FAQ",
    quickFooter: "Or go back to the product catalog and keep shopping.",
  },
} satisfies Record<Locale, any>;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return copy[locale].metadata;
}

export default async function ContactPage() {
  const locale = await getRequestLocale();
  const page = copy[locale];

  return (
    <StaticInfoPageShell
      accentClassName="from-emerald-900 via-teal-800 to-cyan-900"
      badgeText={page.shell.badgeText}
      breadcrumbs={page.shell.breadcrumbs}
      description={page.shell.description}
      icon={<MessageSquareText className="h-8 w-8" />}
      title={page.shell.title}
    >
      <div className="space-y-8">
        <section className="grid gap-5 lg:grid-cols-3">
          {page.contactItems.map((item) => (
            <article
              key={item.label}
              className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                {item.label === "Hotline" ? (
                  <Phone className="h-6 w-6" />
                ) : item.label === "Email" ? (
                  <Mail className="h-6 w-6" />
                ) : (
                  <MapPin className="h-6 w-6" />
                )}
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                {item.label}
              </h2>
              <p className="mt-2 text-base font-medium text-gray-800">
                {item.value}
              </p>
              <p className="mt-2 leading-7 text-gray-600">{item.note}</p>
              <a
                href={item.href}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
              >
                {locale === "en" ? "Contact now" : "Liên hệ ngay"}
                <ArrowRight className="h-4 w-4" />
              </a>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-gray-100 bg-gray-50 p-8 shadow-sm">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm">
              <Clock3 className="h-4 w-4 text-emerald-600" />
              {page.shell.badgeText}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {locale === "en"
                ? "Clear support hours, no complicated form required."
                : "Khung giờ hỗ trợ rõ ràng, không cần form phức tạp."}
            </h2>
            <ul className="mt-4 space-y-3 text-gray-600">
              {page.supportHours.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl bg-white px-4 py-3 shadow-sm"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">
              {page.quickHeading}
            </h2>
            <p className="mt-4 leading-7 text-gray-600">{page.quickBody}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/orders">
                <Button size="lg">{page.quickOrders}</Button>
              </Link>
              <Link href="/faq">
                <Button size="lg" variant="outline">
                  {page.quickFaq}
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              {locale === "en" ? "Or return to the " : "Hoặc quay lại "}
              <Link
                href="/products"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                {locale === "en" ? "product catalog" : "catalog sản phẩm"}
              </Link>
              {locale === "en" ? " to keep shopping." : " để tiếp tục mua sắm."}
            </p>
          </div>
        </section>
      </div>
    </StaticInfoPageShell>
  );
}
