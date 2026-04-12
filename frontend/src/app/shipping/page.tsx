import Link from "next/link";
import { ArrowRight, BadgePercent, Package, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaticInfoPageShell } from "@/components/static-info-page";

const shippingOptions = [
  {
    title: "Giao hàng tiêu chuẩn",
    desc: "Phương thức giao mặc định cho các đơn hàng thông thường.",
    meta: "3-5 ngày làm việc",
  },
  {
    title: "Giao hàng nhanh",
    desc: "Ưu tiên cho các đơn cần nhận sớm hơn.",
    meta: "1-2 ngày làm việc",
  },
  {
    title: "Theo dõi đơn hàng",
    desc: "Xem trang đơn hàng sau khi checkout để theo dõi trạng thái giao vận.",
    meta: "Cập nhật trực tiếp trên trang đơn hàng",
  },
];

const notes = [
  "Đơn hàng được đóng gói kỹ để giảm rủi ro hư hỏng trong quá trình vận chuyển.",
  "Thời gian giao nhận có thể thay đổi theo đơn vị vận chuyển và điểm đến.",
  "Phí giao hàng có thể thay đổi theo giá trị đơn và khu vực nhận hàng.",
];

export default function ShippingPage() {
  return (
      <StaticInfoPageShell
        accentClassName="from-sky-900 via-blue-800 to-cyan-900"
        badgeText="Giao hàng"
        breadcrumbs={[{ label: "Giao hàng" }]}
        description="Trang chính sách giao hàng ngắn gọn, giúp người dùng nắm nhanh phí ship, thời gian giao và cách theo dõi."
        icon={<Truck className="h-8 w-8" />}
        title="Chính sách giao hàng"
    >
      <div className="space-y-8">
        <section className="grid gap-5 md:grid-cols-3">
          {shippingOptions.map((option, index) => (
            <article key={option.title} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                {index === 0 ? <Truck className="h-6 w-6" /> : index === 1 ? <Package className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{option.title}</h2>
              <p className="mt-3 leading-7 text-gray-600">{option.desc}</p>
              <p className="mt-4 text-sm font-medium text-sky-700">{option.meta}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-sky-700" />
              <h2 className="text-2xl font-bold text-gray-900">Điều cần biết</h2>
            </div>
            <ul className="mt-5 space-y-3 text-gray-600">
              {notes.map((note) => (
                <li key={note} className="rounded-2xl bg-gray-50 px-4 py-3 leading-7">
                  {note}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-gradient-to-br from-sky-50 to-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <BadgePercent className="h-6 w-6 text-sky-700" />
              <h2 className="text-2xl font-bold text-gray-900">Ngưỡng miễn phí vận chuyển</h2>
            </div>
            <p className="mt-4 leading-7 text-gray-600">
              Miễn phí vận chuyển sẽ được áp dụng ở giỏ hàng và bước checkout khi đơn hàng đạt ngưỡng hiện tại.
            </p>
            <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Ưu đãi hiện tại</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">Từ 200.000đ</p>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Phù hợp cho cả đơn mua lẻ một cuốn lẫn những đơn lớn hơn với nhiều đầu sách.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/products">
                <Button size="lg" className="gap-2">
                  Mua sắm ngay
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">
                  Liên hệ hỗ trợ
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </StaticInfoPageShell>
  );
}
