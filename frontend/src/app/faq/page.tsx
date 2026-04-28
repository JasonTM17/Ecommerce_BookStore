import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CircleHelp,
  PackageCheck,
  RefreshCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaticInfoPageShell } from "@/components/static-info-page";
import { getRequestLocale } from "@/lib/i18n/server";

type Locale = "vi" | "en";

const copy = {
  vi: {
    metadata: {
      title: "Câu hỏi thường gặp",
      description:
        "Các câu trả lời ngắn gọn cho những câu hỏi phổ biến nhất về BookStore.",
    },
    shell: {
      badgeText: "Hỗ trợ nhanh",
      breadcrumbs: [{ label: "FAQ" }],
      description:
        "Những câu trả lời ngắn gọn cho các câu hỏi phổ biến nhất về mua sắm, thanh toán và giao hàng.",
      title: "Câu hỏi thường gặp",
    },
    serviceCards: [
      {
        icon: Truck,
        title: "Giao hàng",
        desc: "Xem thời gian giao, phí vận chuyển và hướng dẫn theo dõi đơn.",
      },
      {
        icon: PackageCheck,
        title: "Đặt hàng",
        desc: "Giỏ hàng và checkout được giữ đơn giản, dễ theo dõi.",
      },
      {
        icon: RefreshCcw,
        title: "Đổi trả",
        desc: "Điều kiện đổi trả được liệt kê rõ trước khi bạn cần liên hệ hỗ trợ.",
      },
      {
        icon: ShieldCheck,
        title: "Riêng tư",
        desc: "Thông tin tài khoản và đơn hàng nằm trong các khu vực riêng tư, rõ ràng.",
      },
    ],
    faqs: [
      {
        question: "Làm sao để tìm sách nhanh hơn?",
        answer:
          "Hãy dùng trang sản phẩm, bộ lọc danh mục và ô tìm kiếm để thu hẹp kết quả. Phím tắt / và Ctrl/Cmd+K cũng mở tìm kiếm nhanh.",
      },
      {
        question: "Tôi kiểm tra đơn hàng ở đâu?",
        answer:
          "Sau khi đăng nhập, mở trang Đơn hàng để xem danh sách đơn và từng trang chi tiết đơn để theo dõi trạng thái cập nhật.",
      },
      {
        question: "Shop có hỗ trợ đổi trả không?",
        answer:
          "Có. Trang Đổi trả trình bày ngắn gọn về thời hạn, điều kiện sản phẩm và các bước cần làm khi cần hỗ trợ.",
      },
      {
        question: "Hiện có những lựa chọn giao hàng nào?",
        answer:
          "Ở bước checkout, hệ thống hiển thị các phương thức giao hàng được hỗ trợ và tính phí cuối cùng theo giá trị đơn và khu vực nhận hàng.",
      },
      {
        question: "Coupon được dùng ở đâu?",
        answer:
          "Trang Khuyến mãi là nơi để xem và sao chép coupon công khai. Việc áp dụng coupon vẫn diễn ra tại giỏ hàng hoặc checkout.",
      },
      {
        question: "Nếu cần hỗ trợ nhanh thì nên làm gì?",
        answer:
          "Hãy bắt đầu từ trang Liên hệ nếu bạn cần phản hồi trực tiếp. Trang Đơn hàng và FAQ cũng là những lối tắt tốt cho các câu hỏi phổ biến.",
      },
    ],
    ctaHeading: "Cần hỗ trợ thêm?",
    ctaTitle:
      "Nếu chưa thấy câu trả lời phù hợp, hãy liên hệ hỗ trợ trực tiếp.",
    ctaBody:
      "FAQ được tạo ra để giảm các câu hỏi lặp lại. Nếu bạn cần phản hồi trực tiếp, Liên hệ là bước tiếp theo nhanh nhất.",
    ctaContact: "Liên hệ ngay",
    ctaShipping: "Xem giao hàng",
  },
  en: {
    metadata: {
      title: "Frequently Asked Questions",
      description:
        "Short answers to the most common BookStore shopping questions.",
    },
    shell: {
      badgeText: "Quick help",
      breadcrumbs: [{ label: "FAQ" }],
      description:
        "Short answers to the most common questions about shopping, payment, and shipping.",
      title: "Frequently Asked Questions",
    },
    serviceCards: [
      {
        icon: Truck,
        title: "Shipping",
        desc: "See delivery times, shipping fees, and tracking guidance.",
      },
      {
        icon: PackageCheck,
        title: "Orders",
        desc: "Cart and checkout stay simple and easy to follow.",
      },
      {
        icon: RefreshCcw,
        title: "Returns",
        desc: "Return conditions are listed clearly before you need support.",
      },
      {
        icon: ShieldCheck,
        title: "Privacy",
        desc: "Account and order details stay in clearly separated private areas.",
      },
    ],
    faqs: [
      {
        question: "How can I find books faster?",
        answer:
          "Use the products page, category filters, and search box to narrow results. The / and Ctrl/Cmd+K shortcuts also open search quickly.",
      },
      {
        question: "Where do I check my orders?",
        answer:
          "After signing in, open the Orders page to review your order list and each order detail page for live status updates.",
      },
      {
        question: "Does the shop support returns?",
        answer:
          "Yes. The Returns page explains the time limit, product conditions, and the steps to take when you need help.",
      },
      {
        question: "Which shipping options are available?",
        answer:
          "At checkout, the system shows the supported delivery methods and calculates the final fee by order value and region.",
      },
      {
        question: "Where do I use coupons?",
        answer:
          "The Promotions page is where you browse and copy public coupons. Coupon application still happens in cart or checkout.",
      },
      {
        question: "What should I do if I need help quickly?",
        answer:
          "Start with Contact if you need a direct response. Orders and FAQ are also useful shortcuts for common questions.",
      },
    ],
    ctaHeading: "Need more help?",
    ctaTitle:
      "If you still do not see the right answer, contact support directly.",
    ctaBody:
      "FAQ exists to reduce repeat questions. If you need a direct response, Contact is the quickest next step.",
    ctaContact: "Contact now",
    ctaShipping: "View shipping",
  },
} satisfies Record<Locale, any>;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return copy[locale].metadata;
}

export default async function FaqPage() {
  const locale = await getRequestLocale();
  const page = copy[locale];

  return (
    <StaticInfoPageShell
      accentClassName="from-stone-950 via-red-900 to-orange-900"
      badgeText={page.shell.badgeText}
      breadcrumbs={page.shell.breadcrumbs}
      description={page.shell.description}
      icon={<CircleHelp className="h-8 w-8" />}
      title={page.shell.title}
    >
      <div className="space-y-8">
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {page.serviceCards.map((card) => (
            <article
              key={card.title}
              className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-700">
                <card.icon className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                {card.title}
              </h2>
              <p className="mt-3 leading-7 text-gray-600">{card.desc}</p>
            </article>
          ))}
        </section>

        <section className="space-y-4">
          {page.faqs.map((item) => (
            <details
              key={item.question}
              className="group rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <summary className="cursor-pointer list-none text-lg font-semibold text-gray-900">
                {item.question}
              </summary>
              <p className="mt-4 max-w-4xl leading-7 text-gray-600">
                {item.answer}
              </p>
            </details>
          ))}
        </section>

        <section className="rounded-3xl border border-red-100 bg-gradient-to-r from-red-50 via-white to-orange-50 p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
                {page.ctaHeading}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {page.ctaTitle}
              </h2>
              <p className="mt-3 leading-7 text-gray-600">{page.ctaBody}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact">
                <Button size="lg" className="gap-2">
                  {page.ctaContact}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/shipping">
                <Button size="lg" variant="outline">
                  {page.ctaShipping}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </StaticInfoPageShell>
  );
}
