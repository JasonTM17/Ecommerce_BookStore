import Link from "next/link";
import { ArrowRight, BookOpen, Heart, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaticInfoPageShell } from "@/components/static-info-page";

const values = [
  {
    title: "Curated catalog",
    description:
      "We keep the catalog focused on books that are easy to browse, compare, and buy without extra clutter.",
    icon: BookOpen,
  },
  {
    title: "Fast buying flow",
    description:
      "From product search to checkout, every step is designed to reduce friction and help users move quickly.",
    icon: Truck,
  },
  {
    title: "Trusted shopping",
    description:
      "Order details, checkout steps, and support entry points stay clear so buyers always know what happens next.",
    icon: ShieldCheck,
  },
];

const stats = [
  { value: "10K+", label: "books ready to browse" },
  { value: "24/7", label: "product and order access" },
  { value: "100%", label: "focus on reading and buying" },
];

export default function AboutPage() {
  return (
    <StaticInfoPageShell
      accentClassName="from-blue-900 via-blue-800 to-indigo-900"
      badgeText="About BookStore"
      breadcrumbs={[{ label: "About" }]}
      description="BookStore is a simple place to discover books, compare options, and place an order with a clean and trustworthy flow."
      icon={<Heart className="h-8 w-8" />}
      title="About BookStore"
    >
      <div className="space-y-8">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              <Sparkles className="h-4 w-4" />
              A calmer way to shop for books
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              We built this store to keep the buying experience focused on books, not friction.
            </h2>
            <p className="mt-4 leading-7 text-gray-600">
              The layout stays direct: search, compare, add to cart, and complete checkout without jumping through extra pages.
            </p>
            <p className="mt-4 leading-7 text-gray-600">
              Users can move from discovery to order tracking with the same route map, so the experience stays easy to follow.
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
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Start here</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">Browse the catalog or jump straight into categories.</h2>
              <p className="mt-3 leading-7 text-gray-600">
                If you want to keep shopping, these two routes are the fastest way to continue.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/products">
                <Button size="lg" className="gap-2">
                  View products
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/categories">
                <Button size="lg" variant="outline">
                  View categories
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </StaticInfoPageShell>
  );
}
