import Link from "next/link";
import { ArrowRight, CircleHelp, PackageCheck, RefreshCcw, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaticInfoPageShell } from "@/components/static-info-page";

const faqs = [
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
      "Ở bước checkout, hệ thống hiển thị các phương thức giao hàng được hỗ trợ và tính phí cuối cùng theo giá trị đơn cùng khu vực nhận hàng.",
  },
  {
    question: "Coupon được dùng ở đâu?",
    answer:
      "Trang Khuyến mãi là nơi để xem và sao chép coupon công khai. Việc áp dụng coupon vẫn diễn ra tại giỏ hàng hoặc checkout.",
  },
  {
    question: "Nếu cần hỗ trợ nhanh thì nên làm gì?",
    answer:
      "Hãy bắt đầu từ trang Liên hệ nếu bạn cần phản hồi trực tiếp. Trang Đơn hàng và FAQ cũng là các lối tắt tốt cho các câu hỏi phổ biến.",
  },
];

const serviceCards = [
  { icon: Truck, title: "Giao hàng", desc: "Xem thời gian giao, phí vận chuyển và hướng dẫn theo dõi đơn." },
  { icon: PackageCheck, title: "Đặt hàng", desc: "Giỏ hàng và checkout được giữ đơn giản, dễ theo dõi." },
  { icon: RefreshCcw, title: "Đổi trả", desc: "Điều kiện đổi trả được liệt kê rõ trước khi bạn cần liên hệ hỗ trợ." },
  { icon: ShieldCheck, title: "Riêng tư", desc: "Thông tin tài khoản và đơn hàng nằm trong những khu vực riêng tư, rõ ràng." },
];

export default function FaqPage() {
  return (
      <StaticInfoPageShell
        accentClassName="from-violet-900 via-purple-800 to-indigo-900"
        badgeText="Hỗ trợ nhanh"
        breadcrumbs={[{ label: "FAQ" }]}
        description="Những câu trả lời ngắn gọn cho các câu hỏi phổ biến nhất về mua sắm, thanh toán, giao hàng và theo dõi đơn."
        icon={<CircleHelp className="h-8 w-8" />}
        title="Câu hỏi thường gặp"
    >
      <div className="space-y-8">
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {serviceCards.map((card) => (
            <article key={card.title} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                <card.icon className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{card.title}</h2>
              <p className="mt-3 leading-7 text-gray-600">{card.desc}</p>
            </article>
          ))}
        </section>

        <section className="space-y-4">
          {faqs.map((item) => (
            <details key={item.question} className="group rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <summary className="cursor-pointer list-none text-lg font-semibold text-gray-900">
                {item.question}
              </summary>
              <p className="mt-4 max-w-4xl leading-7 text-gray-600">{item.answer}</p>
            </details>
          ))}
        </section>

        <section className="rounded-3xl border border-violet-100 bg-gradient-to-r from-violet-50 via-white to-indigo-50 p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Cần hỗ trợ thêm?</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">Nếu chưa thấy câu trả lời phù hợp, hãy liên hệ hỗ trợ trực tiếp.</h2>
              <p className="mt-3 leading-7 text-gray-600">
                FAQ được tạo ra để giảm các câu hỏi lặp lại. Nếu bạn cần phản hồi trực tiếp, Liên hệ là bước tiếp theo nhanh nhất.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact">
                <Button size="lg" className="gap-2">
                  Liên hệ ngay
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/shipping">
                <Button size="lg" variant="outline">
                  Xem giao hàng
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </StaticInfoPageShell>
  );
}
