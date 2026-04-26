import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  RefreshCcw,
  ShieldAlert,
  TimerReset,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaticInfoPageShell } from "@/components/static-info-page";
import { getRequestLocale } from "@/lib/i18n/server";

type Locale = "vi" | "en";

const copy = {
  vi: {
    metadata: {
      title: "Chính sách đổi trả",
      description:
        "Điều kiện, quy trình và thời gian xử lý cho yêu cầu đổi trả tại BookStore.",
    },
    shell: {
      badgeText: "Đổi trả",
      breadcrumbs: [{ label: "Đổi trả" }],
      description:
        "Trang chính sách đổi trả ngắn gọn, giúp người dùng nắm nhanh điều kiện, quy trình và thời gian xử lý.",
      title: "Chính sách đổi trả",
    },
    returnSteps: [
      "Kiểm tra thời hạn đổi trả trong vòng 7 ngày sau khi giao hàng thành công.",
      "Liên hệ hỗ trợ để xác nhận tình trạng sản phẩm và lý do đổi trả.",
      "Giữ sản phẩm, phụ kiện và hóa đơn trong tình trạng tốt nếu có thể.",
      "Gửi hàng hoàn lại theo hướng dẫn từ bộ phận hỗ trợ và chờ xác nhận xử lý.",
    ],
    policies: [
      {
        title: "Được chấp nhận",
        desc: "Sản phẩm chưa sử dụng, giao sai hàng, lỗi in ấn hoặc hư hỏng trong vận chuyển.",
      },
      {
        title: "Không chấp nhận",
        desc: "Sản phẩm đã qua sử dụng, thiếu trang, thiếu phụ kiện hoặc yêu cầu gửi quá hạn.",
      },
      {
        title: "Thời gian xử lý",
        desc: "Hoàn tiền hoặc đổi sản phẩm sẽ được xử lý sau khi kiểm tra trong khoảng 7-14 ngày làm việc.",
      },
    ],
    ctaTitle: "Cần phản hồi nhanh?",
    ctaBody:
      "Nếu bạn cần xác nhận thông tin đơn hàng trước khi gửi yêu cầu đổi trả, hãy dùng trang Liên hệ hoặc mở Đơn hàng trước.",
    ctaContact: "Liên hệ hỗ trợ",
    ctaOrders: "Xem đơn hàng",
  },
  en: {
    metadata: {
      title: "Returns policy",
      description:
        "The conditions, process, and timing for return requests at BookStore.",
    },
    shell: {
      badgeText: "Returns",
      breadcrumbs: [{ label: "Returns" }],
      description:
        "A concise returns policy page that quickly explains conditions, process, and timing.",
      title: "Returns policy",
    },
    returnSteps: [
      "Check the return window within 7 days after a successful delivery.",
      "Contact support to confirm the item condition and the reason for return.",
      "Keep the product, accessories, and invoice in good condition if possible.",
      "Send the item back using support instructions and wait for processing confirmation.",
    ],
    policies: [
      {
        title: "Accepted",
        desc: "Unused products, wrong items, print defects, or shipping damage.",
      },
      {
        title: "Not accepted",
        desc: "Used products, missing pages, missing accessories, or late requests.",
      },
      {
        title: "Processing time",
        desc: "Refunds or replacements are handled after inspection within 7-14 business days.",
      },
    ],
    ctaTitle: "Need a quick reply?",
    ctaBody:
      "If you need order confirmation before sending a return request, start with Contact or open your Orders page first.",
    ctaContact: "Contact support",
    ctaOrders: "View orders",
  },
} satisfies Record<Locale, any>;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return copy[locale].metadata;
}

export default async function ReturnsPage() {
  const locale = await getRequestLocale();
  const page = copy[locale];

  return (
    <StaticInfoPageShell
      accentClassName="from-rose-900 via-red-800 to-orange-900"
      badgeText={page.shell.badgeText}
      breadcrumbs={page.shell.breadcrumbs}
      description={page.shell.description}
      icon={<RefreshCcw className="h-8 w-8" />}
      title={page.shell.title}
    >
      <div className="space-y-8">
        <section className="grid gap-5 md:grid-cols-3">
          {page.policies.map((policy, index) => (
            <article
              key={policy.title}
              className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
                {index === 0 ? (
                  <ClipboardCheck className="h-6 w-6" />
                ) : index === 1 ? (
                  <ShieldAlert className="h-6 w-6" />
                ) : (
                  <TimerReset className="h-6 w-6" />
                )}
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                {policy.title}
              </h2>
              <p className="mt-3 leading-7 text-gray-600">{policy.desc}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">
              {locale === "en"
                ? "Steps to submit a return request"
                : "Các bước gửi yêu cầu đổi trả"}
            </h2>
            <div className="mt-6 space-y-4">
              {page.returnSteps.map((step, index) => (
                <div
                  key={step}
                  className="flex gap-4 rounded-2xl bg-gray-50 p-4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-700">
                    {index + 1}
                  </div>
                  <p className="leading-7 text-gray-600">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-gradient-to-br from-rose-50 to-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">
              {page.ctaTitle}
            </h2>
            <p className="mt-4 leading-7 text-gray-600">{page.ctaBody}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact">
                <Button size="lg" className="gap-2">
                  {page.ctaContact}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/orders">
                <Button size="lg" variant="outline">
                  {page.ctaOrders}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </StaticInfoPageShell>
  );
}
