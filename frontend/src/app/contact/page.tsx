import Link from "next/link";
import { ArrowRight, Clock3, Mail, MapPin, MessageSquareText, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaticInfoPageShell } from "@/components/static-info-page";

const contactItems = [
  {
    icon: Phone,
    label: "Hotline",
    value: "0901 234 567",
    href: "tel:+84901234567",
    note: "Hỗ trợ đơn hàng và hướng dẫn thanh toán",
  },
  {
    icon: Mail,
    label: "Email",
    value: "support@bookstore.com",
    href: "mailto:support@bookstore.com",
    note: "Câu hỏi chung và đề xuất hợp tác",
  },
  {
    icon: MapPin,
    label: "Địa chỉ",
    value: "123 Đường ABC, Quận 1, TP. Hồ Chí Minh",
    href: "https://maps.google.com/?q=123%20ABC%20Street%2C%20District%201%2C%20HCMC",
    note: "Văn phòng và điểm liên hệ hỗ trợ",
  },
];

const supportHours = [
  "Thứ Hai đến Thứ Bảy: 8:00 - 20:00",
  "Chủ Nhật: 9:00 - 18:00",
  "Yêu cầu hỗ trợ đơn hàng được phản hồi trong vòng một ngày làm việc",
];

export default function ContactPage() {
  return (
      <StaticInfoPageShell
        accentClassName="from-emerald-900 via-teal-800 to-cyan-900"
        badgeText="Hỗ trợ"
        breadcrumbs={[{ label: "Liên hệ" }]}
        description="Cần hỗ trợ về đơn hàng, thanh toán hoặc tài khoản? Đây là những kênh liên hệ chính thức và nhanh nhất."
        icon={<MessageSquareText className="h-8 w-8" />}
        title="Liên hệ BookStore"
    >
      <div className="space-y-8">
        <section className="grid gap-5 lg:grid-cols-3">
          {contactItems.map((item) => (
            <article
              key={item.label}
              className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <item.icon className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{item.label}</h2>
              <p className="mt-2 text-base font-medium text-gray-800">{item.value}</p>
              <p className="mt-2 leading-7 text-gray-600">{item.note}</p>
              <a
                href={item.href}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
              >
                Liên hệ ngay
                <ArrowRight className="h-4 w-4" />
              </a>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-gray-100 bg-gray-50 p-8 shadow-sm">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm">
              <Clock3 className="h-4 w-4 text-emerald-600" />
              Khung giờ hỗ trợ
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Khung giờ hỗ trợ rõ ràng, không cần form phức tạp.</h2>
            <ul className="mt-4 space-y-3 text-gray-600">
              {supportHours.map((item) => (
                <li key={item} className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">Cần lối tắt tới đơn hàng hoặc FAQ?</h2>
            <p className="mt-4 leading-7 text-gray-600">
              Nếu bạn đang kiểm tra trạng thái đơn hàng hoặc cần một câu trả lời nhanh, đây thường là hai route hữu ích nhất.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/orders">
                <Button size="lg">Xem đơn hàng</Button>
              </Link>
              <Link href="/faq">
                <Button size="lg" variant="outline">
                  Xem FAQ
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              Hoặc quay lại <Link href="/products" className="font-semibold text-emerald-700 hover:text-emerald-800">catalog sản phẩm</Link> để tiếp tục mua sắm.
            </p>
          </div>
        </section>
      </div>
    </StaticInfoPageShell>
  );
}
