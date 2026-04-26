import type { Metadata } from "next";
import {
  AlertCircle,
  Eye,
  FileText,
  Lock,
  Shield,
  UserCheck,
} from "lucide-react";
import { StaticInfoPageShell } from "@/components/static-info-page";
import { getRequestLocale } from "@/lib/i18n/server";

type Locale = "vi" | "en";

const copy = {
  vi: {
    metadata: {
      title: "Chính sách bảo mật",
      description:
        "Cách BookStore thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.",
    },
    shell: {
      badgeText: "Bảo mật",
      breadcrumbs: [{ label: "Chính sách bảo mật" }],
      description:
        "BookStore cam kết bảo vệ dữ liệu cá nhân của bạn bằng các quy trình rõ ràng, an toàn và phù hợp với pháp luật hiện hành.",
      title: "Chính sách bảo mật",
    },
    sections: [
      {
        title: "1. Thông tin chúng tôi thu thập",
        icon: UserCheck,
        body: "Khi bạn đăng ký và sử dụng BookStore, chúng tôi có thể thu thập thông tin cá nhân, thông tin tài khoản, lịch sử đơn hàng và thông tin giao hàng cần thiết để phục vụ dịch vụ.",
      },
      {
        title: "2. Mục đích sử dụng thông tin",
        icon: Eye,
        items: [
          "Xử lý đơn hàng",
          "Hỗ trợ khách hàng",
          "Cải thiện dịch vụ",
          "Bảo mật và chống gian lận",
        ],
      },
      {
        title: "3. Bảo mật thông tin",
        icon: Lock,
        items: [
          "Mã hóa SSL",
          "Tường lửa và giám sát",
          "Mã hóa mật khẩu",
          "Sao lưu dữ liệu định kỳ",
        ],
      },
      {
        title: "4. Chia sẻ thông tin",
        icon: FileText,
        body: "Chúng tôi không bán dữ liệu cá nhân. Thông tin chỉ được chia sẻ cho đối tác vận chuyển, nhà cung cấp thanh toán hoặc cơ quan có thẩm quyền khi pháp luật yêu cầu.",
      },
      {
        title: "5. Quyền của bạn",
        icon: Shield,
        items: ["Truy cập", "Chỉnh sửa", "Xóa", "Phản đối xử lý marketing"],
      },
      {
        title: "6. Cookies",
        icon: FileText,
        body: "Cookies được dùng để ghi nhớ đăng nhập, phân tích truy cập và giữ trải nghiệm mua sắm ổn định hơn. Bạn có thể tắt cookies trong trình duyệt nếu muốn.",
      },
    ],
    contactTitle: "Liên hệ với chúng tôi",
    contactBody:
      "Nếu bạn có câu hỏi về chính sách bảo mật hoặc muốn thực hiện quyền của mình, vui lòng liên hệ BookStore qua email hoặc hotline bên dưới.",
  },
  en: {
    metadata: {
      title: "Privacy policy",
      description:
        "How BookStore collects, uses, and protects your personal information.",
    },
    shell: {
      badgeText: "Privacy",
      breadcrumbs: [{ label: "Privacy policy" }],
      description:
        "BookStore is committed to protecting your personal data with clear, secure, and compliant handling practices.",
      title: "Privacy policy",
    },
    sections: [
      {
        title: "1. Information we collect",
        icon: UserCheck,
        body: "When you register and use BookStore, we may collect personal details, account information, order history, and delivery details needed to operate the service.",
      },
      {
        title: "2. How we use information",
        icon: Eye,
        items: [
          "Order processing",
          "Customer support",
          "Service improvement",
          "Security and fraud prevention",
        ],
      },
      {
        title: "3. Protecting information",
        icon: Lock,
        items: [
          "SSL encryption",
          "Firewalls and monitoring",
          "Password hashing",
          "Regular backups",
        ],
      },
      {
        title: "4. Sharing information",
        icon: FileText,
        body: "We do not sell personal data. Information is shared only with delivery partners, payment providers, or authorities when required by law.",
      },
      {
        title: "5. Your rights",
        icon: Shield,
        items: ["Access", "Edit", "Delete", "Opt out of marketing"],
      },
      {
        title: "6. Cookies",
        icon: FileText,
        body: "Cookies help remember sign-in, analyze traffic, and keep the shopping experience stable. You can disable cookies in your browser if you prefer.",
      },
    ],
    contactTitle: "Contact us",
    contactBody:
      "If you have questions about this privacy policy or want to exercise your rights, reach out to BookStore through the email or hotline below.",
  },
} satisfies Record<Locale, any>;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return copy[locale].metadata;
}

export default async function PrivacyPage() {
  const locale = await getRequestLocale();
  const page = copy[locale];

  return (
    <StaticInfoPageShell
      accentClassName="from-green-900 via-green-800 to-emerald-900"
      badgeText={page.shell.badgeText}
      breadcrumbs={page.shell.breadcrumbs}
      description={page.shell.description}
      icon={<Shield className="h-8 w-8" />}
      title={page.shell.title}
    >
      <div className="space-y-6">
        {page.sections.map((entry) => (
          <section
            key={entry.title}
            className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
                <entry.icon className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{entry.title}</h2>
            </div>
            {entry.body ? (
              <p className="mt-4 leading-7 text-gray-600">{entry.body}</p>
            ) : null}
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
              <h2 className="text-xl font-bold text-gray-900">
                {page.contactTitle}
              </h2>
              <p className="mt-2 leading-7 text-gray-600">{page.contactBody}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="text-blue-600">privacy@bookstore.com</p>
                </div>
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <p className="font-medium text-gray-900">Hotline</p>
                  <p className="text-blue-600">0901 234 567</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </StaticInfoPageShell>
  );
}
