import type { Metadata } from "next";
import { AlertCircle, FileText, Scale } from "lucide-react";
import { StaticInfoPageShell } from "@/components/static-info-page";
import { getRequestLocale } from "@/lib/i18n/server";

type Locale = "vi" | "en";

const copy = {
  vi: {
    metadata: {
      title: "Điều khoản sử dụng",
      description: "Các điều khoản và điều kiện áp dụng khi sử dụng BookStore.",
    },
    shell: {
      badgeText: "Điều khoản",
      breadcrumbs: [{ label: "Điều khoản sử dụng" }],
      description:
        "Khi sử dụng BookStore, bạn đồng ý tuân thủ các điều khoản và điều kiện dưới đây.",
      title: "Điều khoản sử dụng",
    },
    sections: [
      {
        title: "1. Giới thiệu",
        body:
          "Chào mừng bạn đến với BookStore. Khi truy cập hoặc sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản được nêu trong trang này.",
      },
      {
        title: "2. Tài khoản người dùng",
        items: [
          "Bạn chịu trách nhiệm bảo mật tài khoản và mật khẩu của mình.",
          "Bạn phải từ đủ 18 tuổi hoặc có sự đồng ý của người giám hộ.",
          "Thông tin đăng ký phải trung thực và chính xác.",
        ],
      },
      {
        title: "3. Mua sắm trên BookStore",
        items: [
          "Đặt hàng cho mục đích hợp pháp.",
          "Không đặt hàng với mục đích mua đi bán lại quy mô lớn.",
          "Cung cấp thông tin giao hàng chính xác và đầy đủ.",
        ],
      },
      {
        title: "4. Thanh toán và giá cả",
        body:
          "BookStore hỗ trợ thẻ, ví điện tử, chuyển khoản và thanh toán khi nhận hàng. Giá trên website đã bao gồm VAT, và có thể thay đổi theo từng thời điểm.",
      },
      {
        title: "5. Vận chuyển và giao hàng",
        items: [
          "Miễn phí vận chuyển cho đơn từ 200.000 VNĐ.",
          "Đơn nhỏ hơn có thể áp dụng phí theo khu vực giao hàng.",
          "Thời gian giao hàng phụ thuộc vào khu vực và đơn vị vận chuyển.",
        ],
      },
      {
        title: "6. Đổi trả và hoàn tiền",
        items: [
          "Yêu cầu đổi trả trong vòng 7 ngày sau khi nhận hàng.",
          "Sản phẩm phải còn nguyên trạng và đầy đủ phụ kiện.",
          "Một số sản phẩm giảm giá hoặc nội dung điện tử có thể không áp dụng đổi trả.",
        ],
      },
      {
        title: "7. Quyền sở hữu trí tuệ",
        body:
          "Toàn bộ nội dung trên BookStore, bao gồm văn bản, hình ảnh, logo và thiết kế, thuộc quyền sở hữu của BookStore hoặc nhà cung cấp nội dung của chúng tôi.",
      },
      {
        title: "8. Giới hạn trách nhiệm",
        body:
          "BookStore không chịu trách nhiệm cho các thiệt hại gián tiếp, đặc biệt, ngẫu nhiên hoặc do hậu quả phát sinh từ việc sử dụng website hoặc dịch vụ.",
      },
    ],
    contactTitle: "Liên hệ hỗ trợ",
    contactBody:
      "Nếu bạn có câu hỏi về điều khoản sử dụng, vui lòng liên hệ qua email support@bookstore.com hoặc hotline 0901 234 567.",
  },
  en: {
    metadata: {
      title: "Terms of use",
      description: "The terms and conditions that apply when you use BookStore.",
    },
    shell: {
      badgeText: "Terms",
      breadcrumbs: [{ label: "Terms of use" }],
      description: "By using BookStore, you agree to follow the terms and conditions below.",
      title: "Terms of use",
    },
    sections: [
      {
        title: "1. Introduction",
        body:
          "Welcome to BookStore. By accessing or using our service, you agree to the terms described on this page.",
      },
      {
        title: "2. User accounts",
        items: [
          "You are responsible for keeping your account and password secure.",
          "You must be at least 18 years old or have guardian consent.",
          "Registration information must be truthful and accurate.",
        ],
      },
      {
        title: "3. Shopping on BookStore",
        items: [
          "Place orders for lawful purposes.",
          "Do not place bulk orders for resale purposes.",
          "Provide accurate and complete shipping details.",
        ],
      },
      {
        title: "4. Payment and pricing",
        body:
          "BookStore supports cards, e-wallets, bank transfers, and cash on delivery. Prices shown on the site include VAT and may change over time.",
      },
      {
        title: "5. Shipping and delivery",
        items: [
          "Free shipping applies to orders from 200,000 VNĐ.",
          "Smaller orders may incur region-based delivery fees.",
          "Delivery time depends on your region and carrier.",
        ],
      },
      {
        title: "6. Returns and refunds",
        items: [
          "Return requests must be made within 7 days of delivery.",
          "Items should be kept in good condition with accessories included.",
          "Some discounted or digital items may not qualify for returns.",
        ],
      },
      {
        title: "7. Intellectual property",
        body:
          "All content on BookStore, including text, images, logos, and design, belongs to BookStore or our content providers.",
      },
      {
        title: "8. Limitation of liability",
        body:
          "BookStore is not liable for indirect, special, incidental, or consequential damages arising from the use of the website or service.",
      },
    ],
    contactTitle: "Support contact",
    contactBody:
      "If you have questions about these terms of use, please contact support@bookstore.com or call 0901 234 567.",
  },
} satisfies Record<Locale, any>;

export function generateMetadata(): Metadata {
  return copy[getRequestLocale()].metadata;
}

export default function TermsPage() {
  const locale = getRequestLocale();
  const page = copy[locale];

  return (
    <StaticInfoPageShell
      accentClassName="from-blue-900 via-blue-800 to-indigo-900"
      badgeText={page.shell.badgeText}
      breadcrumbs={page.shell.breadcrumbs}
      description={page.shell.description}
      icon={<FileText className="h-8 w-8" />}
      title={page.shell.title}
    >
      <div className="space-y-6">
        {page.sections.map((entry) => (
          <section key={entry.title} className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Scale className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{entry.title}</h2>
            </div>
            {entry.body ? <p className="mt-4 leading-7 text-gray-600">{entry.body}</p> : null}
            {entry.items ? (
              <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-600">
                {entry.items.map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        <section className="rounded-2xl border border-blue-100 bg-blue-50 p-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{page.contactTitle}</h2>
              <p className="mt-2 leading-7 text-gray-600">{page.contactBody}</p>
            </div>
          </div>
        </section>
      </div>
    </StaticInfoPageShell>
  );
}
