import Link from "next/link";
import { ArrowRight, BookOpen, Heart, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaticInfoPageShell } from "@/components/static-info-page";

const values = [
  {
    title: "Catalog được tuyển chọn",
    description:
      "Catalog được giữ gọn, dễ duyệt, dễ so sánh và dễ mua mà không gây rối mắt bởi những thành phần thừa.",
    icon: BookOpen,
  },
  {
    title: "Luồng mua hàng nhanh",
    description:
      "Từ tìm kiếm sản phẩm tới thanh toán, từng bước đều được tối ưu để giảm thao tác và giúp người dùng đi nhanh hơn.",
    icon: Truck,
  },
  {
    title: "Trải nghiệm mua sắm đáng tin cậy",
    description:
      "Thông tin đơn hàng, các bước checkout và điểm chạm hỗ trợ đều được trình bày rõ để người mua luôn biết điều gì diễn ra tiếp theo.",
    icon: ShieldCheck,
  },
];

const stats = [
  { value: "10K+", label: "đầu sách sẵn sàng để khám phá" },
  { value: "24/7", label: "truy cập sản phẩm và đơn hàng" },
  { value: "100%", label: "tập trung vào trải nghiệm đọc và mua" },
];

export default function AboutPage() {
  return (
      <StaticInfoPageShell
        accentClassName="from-blue-900 via-blue-800 to-indigo-900"
        badgeText="Về BookStore"
        breadcrumbs={[{ label: "Giới thiệu" }]}
        description="BookStore là nơi giúp bạn khám phá sách, so sánh lựa chọn và đặt hàng trong một luồng mua sắm gọn gàng, đáng tin cậy."
        icon={<Heart className="h-8 w-8" />}
        title="Giới thiệu BookStore"
    >
      <div className="space-y-8">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              <Sparkles className="h-4 w-4" />
              Một cách mua sách gọn gàng và dễ chịu hơn
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Chúng tôi xây dựng cửa hàng này để người dùng tập trung vào sách, không phải vào các thao tác rườm rà.
            </h2>
            <p className="mt-4 leading-7 text-gray-600">
              Bố cục được giữ trực diện: tìm kiếm, so sánh, thêm vào giỏ và hoàn tất thanh toán mà không phải nhảy qua những trang phụ không cần thiết.
            </p>
            <p className="mt-4 leading-7 text-gray-600">
              Người dùng có thể đi từ khám phá sản phẩm tới theo dõi đơn hàng trong cùng một route map rõ ràng, giúp trải nghiệm luôn dễ theo dõi.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-gray-100 bg-gray-50 p-6 shadow-sm">
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="mt-2 text-sm leading-6 text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {values.map((value) => (
            <article key={value.title} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <value.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{value.title}</h3>
              <p className="mt-3 leading-7 text-gray-600">{value.description}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Bắt đầu tại đây</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">Bắt đầu từ catalog hoặc đi thẳng vào danh mục.</h2>
              <p className="mt-3 leading-7 text-gray-600">
                Nếu muốn tiếp tục mua sắm, đây là hai route nhanh nhất để bắt đầu.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/products">
                <Button size="lg" className="gap-2">
                  Xem sản phẩm
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/categories">
                <Button size="lg" variant="outline">
                  Xem danh mục
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </StaticInfoPageShell>
  );
}
