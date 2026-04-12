import Link from "next/link";
import { ArrowRight, CircleHelp, PackageCheck, RefreshCcw, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaticInfoPageShell } from "@/components/static-info-page";

const faqs = [
  {
    question: "How do I find books quickly?",
    answer:
      "Use the product page, category filters, and search input to narrow results. The / shortcut and Ctrl/Cmd+K also open search.",
  },
  {
    question: "Where can I check my order?",
    answer:
      "After logging in, open the Orders page to see the list of orders and each order detail page for status updates.",
  },
  {
    question: "Do you support returns?",
    answer:
      "Yes. The Returns page explains the time window, product condition, and support steps in a short and readable format.",
  },
  {
    question: "Which shipping options are available?",
    answer:
      "Checkout shows the shipping options we support and calculates the final fee based on order value and location.",
  },
  {
    question: "Where do coupons belong?",
    answer:
      "Promotions is the browse page for public coupons. The actual apply flow still happens in cart or checkout.",
  },
  {
    question: "What if I need help fast?",
    answer:
      "Start with Contact if you need a direct reply. Orders and FAQ are also good shortcuts for common questions.",
  },
];

const serviceCards = [
  { icon: Truck, title: "Shipping", desc: "See delivery timing, fees, and tracking guidance." },
  { icon: PackageCheck, title: "Ordering", desc: "Cart and checkout stay simple and easy to follow." },
  { icon: RefreshCcw, title: "Returns", desc: "Return conditions are clearly listed before you ask for help." },
  { icon: ShieldCheck, title: "Privacy", desc: "Account and order information stay in clear, private areas." },
];

export default function FaqPage() {
  return (
    <StaticInfoPageShell
      accentClassName="from-violet-900 via-purple-800 to-indigo-900"
      badgeText="Quick help"
      breadcrumbs={[{ label: "FAQ" }]}
      description="Short answers for the most common shopping, payment, shipping, and order-tracking questions."
      icon={<CircleHelp className="h-8 w-8" />}
      title="Frequently asked questions"
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
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Need more help?</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">If you did not find the answer, contact support directly.</h2>
              <p className="mt-3 leading-7 text-gray-600">
                FAQ is meant to reduce repeated questions. For a direct reply, Contact is the fastest next step.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact">
                <Button size="lg" className="gap-2">
                  Contact now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/shipping">
                <Button size="lg" variant="outline">
                  View shipping
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </StaticInfoPageShell>
  );
}
