import Link from "next/link";
import { ArrowRight, BookOpenText, CalendarDays, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaticInfoPageShell } from "@/components/static-info-page";

const articles = [
  {
    title: "How to pick books by learning goal",
    excerpt:
      "A short guide for matching books to study, work, or personal development goals.",
    meta: "Guide",
    tag: "Reading path",
  },
  {
    title: "Five book types worth keeping on hand",
    excerpt:
      "A simple list of practical categories that fit most home libraries and daily reading habits.",
    meta: "Quick picks",
    tag: "Top picks",
  },
  {
    title: "Shop faster with better filters",
    excerpt:
      "Use categories, authors, and keywords to reduce search time and reach the right product page faster.",
    meta: "Shopping tip",
    tag: "Search",
  },
];

const highlights = [
  "Curated articles that match reading and shopping needs",
  "Lightweight route is ready now, even before a full CMS exists",
  "No heavy blog engine in this pass, just a clean public page",
];

export default function BlogPage() {
  return (
    <StaticInfoPageShell
      accentClassName="from-slate-900 via-slate-800 to-indigo-900"
      badgeText="Editorial"
      breadcrumbs={[{ label: "Blog" }]}
      description="A light editorial space for book picks, shopping tips, and simple reading ideas."
      icon={<BookOpenText className="h-8 w-8" />}
      title="BookStore Blog"
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
                  Updated now
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
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Keep going</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">Want to shop after reading?</h2>
              <p className="mt-3 leading-7 text-gray-600">
                Jump to the catalog or categories to keep browsing without extra clicks.
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
