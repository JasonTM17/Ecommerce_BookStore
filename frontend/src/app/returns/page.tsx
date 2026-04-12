import Link from "next/link";
import { ArrowRight, ClipboardCheck, RefreshCcw, ShieldAlert, TimerReset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaticInfoPageShell } from "@/components/static-info-page";

const returnSteps = [
  "Check the return window within 7 days after delivery.",
  "Contact support to confirm the item state and return reason.",
  "Keep the product, accessories, and invoice in good condition if possible.",
  "Send the item back using the support instructions and wait for confirmation.",
];

const policies = [
  {
    title: "Accepted",
    desc: "Unused items, wrong items, print defects, or transit damage.",
  },
  {
    title: "Not accepted",
    desc: "Used items, missing pages, missing accessories, or late requests.",
  },
  {
    title: "Processing time",
    desc: "Refunds or replacements are handled after inspection in about 7-14 business days.",
  },
];

export default function ReturnsPage() {
  return (
    <StaticInfoPageShell
      accentClassName="from-rose-900 via-red-800 to-orange-900"
      badgeText="Returns"
      breadcrumbs={[{ label: "Returns" }]}
      description="A short return policy page that makes conditions, steps, and timelines easy to scan."
      icon={<RefreshCcw className="h-8 w-8" />}
      title="Returns policy"
    >
      <div className="space-y-8">
        <section className="grid gap-5 md:grid-cols-3">
          {policies.map((policy, index) => (
            <article key={policy.title} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
                {index === 0 ? <ClipboardCheck className="h-6 w-6" /> : index === 1 ? <ShieldAlert className="h-6 w-6" /> : <TimerReset className="h-6 w-6" />}
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{policy.title}</h2>
              <p className="mt-3 leading-7 text-gray-600">{policy.desc}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">Return request steps</h2>
            <div className="mt-6 space-y-4">
              {returnSteps.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-2xl bg-gray-50 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-700">
                    {index + 1}
                  </div>
                  <p className="leading-7 text-gray-600">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-gradient-to-br from-rose-50 to-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">Need a fast reply?</h2>
            <p className="mt-4 leading-7 text-gray-600">
              If you need to confirm an order before submitting a return, use Contact or open Orders first.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact">
                <Button size="lg" className="gap-2">
                  Contact support
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/orders">
                <Button size="lg" variant="outline">
                  View orders
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </StaticInfoPageShell>
  );
}
