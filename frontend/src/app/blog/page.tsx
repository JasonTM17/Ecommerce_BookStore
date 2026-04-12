import Link from "next/link";
import { ArrowRight, BookOpenText, CalendarDays, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaticInfoPageShell } from "@/components/static-info-page";

const articles = [
  {
    title: "Chọn sách theo mục tiêu học tập như thế nào?",
    excerpt:
      "Một hướng dẫn ngắn để ghép đầu sách với nhu cầu học, làm việc hoặc phát triển bản thân.",
    meta: "Hướng dẫn",
    tag: "Lộ trình đọc",
  },
  {
    title: "Năm nhóm sách đáng có trong tủ sách cá nhân",
    excerpt:
      "Danh sách ngắn những nhóm sách hữu ích, phù hợp với thói quen đọc hàng ngày và hầu hết tủ sách gia đình.",
    meta: "Gợi ý nhanh",
    tag: "Nổi bật",
  },
  {
    title: "Mua sách nhanh hơn với bộ lọc tốt hơn",
    excerpt:
      "Dùng danh mục, tác giả và từ khóa để rút ngắn thời gian tìm kiếm và đi tới đúng trang sản phẩm nhanh hơn.",
    meta: "Mẹo mua sắm",
    tag: "Tìm kiếm",
  },
];

const highlights = [
  "Bài viết được chọn lọc để hỗ trợ nhu cầu đọc và mua sắm",
  "Route public gọn nhẹ nhưng vẫn đủ chỉn chu cho bản demo hiện tại",
  "Chưa cần blog engine nặng, chỉ cần một trang công khai sạch và dễ đọc",
];

export default function BlogPage() {
  return (
      <StaticInfoPageShell
        accentClassName="from-slate-900 via-slate-800 to-indigo-900"
        badgeText="Góc đọc & chọn sách"
        breadcrumbs={[{ label: "Blog" }]}
        description="Không gian nội dung nhẹ nhàng cho gợi ý sách, mẹo mua sắm và cảm hứng đọc đơn giản."
        icon={<BookOpenText className="h-8 w-8" />}
        title="Blog BookStore"
    >
      <div className="space-y-8">
        <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-3">
            {highlights.map((item) => (
              <div key={item} className="rounded-2xl bg-gray-50 p-5 text-sm leading-7 text-gray-600">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {articles.map((article) => (
            <article
              key={article.title}
              className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">
                  <Tag className="h-3 w-3" />
                  {article.tag}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Cập nhật gần đây
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{article.title}</h2>
              <p className="mt-3 leading-7 text-gray-600">{article.excerpt}</p>
              <p className="mt-5 text-sm font-medium text-gray-500">{article.meta}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-slate-50 p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Tiếp tục khám phá</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">Muốn mua sách ngay sau khi đọc?</h2>
              <p className="mt-3 leading-7 text-gray-600">
                Đi thẳng tới catalog hoặc danh mục để tiếp tục khám phá mà không cần thêm thao tác vòng vo.
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
