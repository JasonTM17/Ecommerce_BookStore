import Link from "next/link";
import { ArrowRight, BadgePercent, Package, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaticInfoPageShell } from "@/components/static-info-page";

const shippingOptions = [
  {
    title: "Standard delivery",
    desc: "Default shipping for normal orders.",
    meta: "3-5 business days",
  },
  {
    title: "Express delivery",
    desc: "Priority shipping for orders that need to arrive sooner.",
    meta: "1-2 business days",
  },
  {
    title: "Order tracking",
    desc: "Check the order page after checkout to follow the delivery state.",
    meta: "Updated on the order page",
  },
];

const notes = [
  "Orders are packed to reduce damage during transit.",
  "Delivery timing can vary by carrier and destination.",
  "Shipping fees may change with order value and location.",
];

export default function ShippingPage() {
  return (
    <StaticInfoPageShell
      accentClassName="from-sky-900 via-blue-800 to-cyan-900"
      badgeText="Shipping"
      breadcrumbs={[{ label: "Shipping" }]}
      description="A short delivery policy page that keeps fees, timing, and tracking easy to understand."
      icon={<Truck className="h-8 w-8" />}
      title="Shipping policy"
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
              <h2 className="text-2xl font-bold text-gray-900">Things to know</h2>
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
              <h2 className="text-2xl font-bold text-gray-900">Free shipping threshold</h2>
            </div>
            <p className="mt-4 leading-7 text-gray-600">
              Free shipping is applied in cart and checkout once the order reaches the current threshold.
            </p>
            <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Current offer</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">From 200,000 VND</p>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                A simple option for single books or bigger orders with multiple titles.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/products">
                <Button size="lg" className="gap-2">
                  Shop now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">
                  Contact support
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </StaticInfoPageShell>
  );
}
