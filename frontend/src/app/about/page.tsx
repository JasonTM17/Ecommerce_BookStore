import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Heart,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaticInfoPageShell } from "@/components/static-info-page";
import { getRequestLocale } from "@/lib/i18n/server";

type Locale = "vi" | "en";

const copy = {
  vi: {
    metadata: {
      title: "Giới thiệu BookStore",
      description:
        "BookStore mang đến trải nghiệm mua sách gọn gàng, đáng tin cậy và dễ khám phá.",
    },
    shell: {
      badgeText: "Về BookStore",
      breadcrumbs: [{ label: "Giới thiệu" }],
      description:
        "BookStore giúp bạn khám phá sách, so sánh lựa chọn và đặt hàng trong một luồng mua sắm rõ ràng, hiện đại.",
      title: "Giới thiệu BookStore",
    },
    introBadge: "Một cách mua sách gọn gàng và dễ chịu hơn",
    introTitle:
      "Chúng tôi xây dựng cửa hàng này để người dùng tập trung vào sách, không phải thao tác rườm rà.",
    introBody:
      "Bố cục được giữ trực diện: tìm kiếm, so sánh, thêm vào giỏ và hoàn tất thanh toán mà không phải đi qua những trang phụ không cần thiết.",
    introBodyTwo:
      "Người dùng có thể đi từ khám phá sản phẩm tới theo dõi đơn hàng trong cùng một route map rõ ràng, giúp trải nghiệm dễ theo dõi hơn.",
    ctaHeading: "Bắt đầu từ catalog hoặc đi thẳng vào danh mục.",
    ctaDescription:
      "Nếu muốn tiếp tục mua sắm, đây là hai route nhanh nhất để bắt đầu.",
    ctaProducts: "Xem sản phẩm",
    ctaCategories: "Xem danh mục",
    stats: [
      { value: "10K+", label: "đầu sách sẵn sàng để khám phá" },
      { value: "24/7", label: "truy cập sản phẩm và đơn hàng" },
      { value: "100%", label: "tập trung vào trải nghiệm đọc và mua" },
    ],
    values: [
      {
        title: "Catalog được tuyển chọn",
        description:
          "Danh mục được giữ gọn, dễ duyệt và dễ so sánh để người mua không bị lạc trong quá nhiều tầng thông tin.",
        icon: BookOpen,
      },
      {
        title: "Luồng mua hàng nhanh",
        description:
          "Từ tìm kiếm tới thanh toán, mọi bước đều được tối ưu để giảm thao tác thừa và giúp người dùng đi nhanh hơn.",
        icon: Truck,
      },
      {
        title: "Trải nghiệm đáng tin cậy",
        description:
          "Thông tin đơn hàng, các bước checkout và điểm chạm hỗ trợ đều được trình bày rõ để người mua luôn biết điều gì xảy ra tiếp theo.",
        icon: ShieldCheck,
      },
    ],
  },
  en: {
    metadata: {
      title: "About BookStore",
      description:
        "BookStore delivers a clean, trustworthy, and easy-to-browse shopping experience.",
    },
    shell: {
      badgeText: "About BookStore",
      breadcrumbs: [{ label: "About" }],
      description:
        "BookStore helps you discover books, compare options, and place orders in one clear, modern shopping flow.",
      title: "About BookStore",
    },
    introBadge: "A cleaner, calmer way to buy books",
    introTitle:
      "We built this store so people can focus on books, not repetitive clicks.",
    introBody:
      "The layout stays direct: search, compare, add to cart, and check out without extra detours or dead-end pages.",
    introBodyTwo:
      "Users can move from product discovery to order tracking within one easy-to-follow route map, keeping the experience simple to navigate.",
    ctaHeading: "Start with the catalog or jump into categories.",
    ctaDescription:
      "If you want to keep shopping, these are the two fastest routes to begin.",
    ctaProducts: "View products",
    ctaCategories: "View categories",
    stats: [
      { value: "10K+", label: "titles ready to explore" },
      { value: "24/7", label: "access to products and orders" },
      { value: "100%", label: "focused on reading and buying" },
    ],
    values: [
      {
        title: "Curated catalog",
        description:
          "The catalog stays compact, easy to browse, and easy to compare so shoppers do not get buried in extra noise.",
        icon: BookOpen,
      },
      {
        title: "Fast shopping flow",
        description:
          "From search to checkout, every step is tuned to remove friction and help people move faster.",
        icon: Truck,
      },
      {
        title: "Trusted experience",
        description:
          "Order details, checkout steps, and support touchpoints are laid out clearly so shoppers always know what happens next.",
        icon: ShieldCheck,
      },
    ],
  },
} satisfies Record<Locale, any>;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return copy[locale].metadata;
}

export default async function AboutPage() {
  const locale = await getRequestLocale();
  const page = copy[locale];

  return (
    <StaticInfoPageShell
      accentClassName="from-[#f5f2ef] via-white to-[#f5f5f5]"
      badgeText={page.shell.badgeText}
      breadcrumbs={page.shell.breadcrumbs}
      description={page.shell.description}
      icon={<Heart className="h-8 w-8" />}
      tone="light"
      title={page.shell.title}
    >
      <div className="space-y-8">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[24px] bg-white p-8 shadow-[rgba(0,0,0,0.06)_0px_0px_0px_1px,rgba(0,0,0,0.04)_0px_1px_2px,rgba(0,0,0,0.04)_0px_2px_4px]">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[rgba(245,242,239,0.8)] px-4 py-2 text-sm font-medium text-black shadow-[rgba(78,50,23,0.04)_0px_6px_16px]">
              <Sparkles className="h-4 w-4" />
              {page.introBadge}
            </div>
            <h2 className="text-3xl font-light leading-tight text-black md:text-4xl">
              {page.introTitle}
            </h2>
            <p className="mt-5 leading-7 tracking-[0.16px] text-[#4e4e4e]">
              {page.introBody}
            </p>
            <p className="mt-4 leading-7 tracking-[0.16px] text-[#4e4e4e]">
              {page.introBodyTwo}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {page.stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[20px] bg-white p-6 shadow-[rgba(0,0,0,0.075)_0px_0px_0px_0.5px_inset,rgba(0,0,0,0.04)_0px_4px_4px]"
              >
                <div className="text-3xl font-light text-black">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm leading-6 tracking-[0.14px] text-[#777169]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {page.values.map((value) => (
            <article
              key={value.title}
              className="rounded-[20px] bg-white p-6 shadow-[rgba(0,0,0,0.06)_0px_0px_0px_1px,rgba(0,0,0,0.04)_0px_1px_2px,rgba(0,0,0,0.04)_0px_2px_4px]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(245,242,239,0.8)] text-black shadow-[rgba(78,50,23,0.04)_0px_6px_16px]">
                <value.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-light text-black">{value.title}</h3>
              <p className="mt-3 leading-7 tracking-[0.16px] text-[#4e4e4e]">
                {value.description}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-[24px] bg-[rgba(245,242,239,0.8)] p-8 shadow-[rgba(78,50,23,0.04)_0px_6px_16px,rgba(0,0,0,0.075)_0px_0px_0px_0.5px_inset]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black">
                {page.ctaHeading}
              </p>
              <p className="mt-3 leading-7 tracking-[0.16px] text-[#4e4e4e]">
                {page.ctaDescription}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/products">
                <Button
                  size="lg"
                  className="gap-2 rounded-full bg-black px-6 text-white hover:bg-black/85"
                >
                  {page.ctaProducts}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/categories">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-transparent bg-white px-6 text-black shadow-[rgba(0,0,0,0.4)_0px_0px_1px,rgba(0,0,0,0.04)_0px_4px_4px] hover:bg-white"
                >
                  {page.ctaCategories}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </StaticInfoPageShell>
  );
}
