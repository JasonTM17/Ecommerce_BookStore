import Link from "next/link";
import { ArrowRight, Clock3, Mail, MapPin, MessageSquareText, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaticInfoPageShell } from "@/components/static-info-page";

const contactItems = [
  {
    icon: Phone,
    label: "Hotline",
    value: "0901 234 567",
    href: "tel:+84901234567",
    note: "Order support and checkout guidance",
  },
  {
    icon: Mail,
    label: "Email",
    value: "support@bookstore.com",
    href: "mailto:support@bookstore.com",
    note: "General questions and partnership requests",
  },
  {
    icon: MapPin,
    label: "Address",
    value: "123 ABC Street, District 1, HCMC",
    href: "https://maps.google.com/?q=123%20ABC%20Street%2C%20District%201%2C%20HCMC",
    note: "Office and support contact point",
  },
];

const supportHours = [
  "Mon to Sat: 8:00 - 20:00",
  "Sunday: 9:00 - 18:00",
  "Order support replies within one business day",
];

export default function ContactPage() {
  return (
    <StaticInfoPageShell
      accentClassName="from-emerald-900 via-teal-800 to-cyan-900"
      badgeText="Support"
      breadcrumbs={[{ label: "Contact" }]}
      description="Need help with an order, payment, or account? These are the fastest official contact paths."
      icon={<MessageSquareText className="h-8 w-8" />}
      title="Contact BookStore"
    >
      <div className="space-y-8">
        <section className="grid gap-5 lg:grid-cols-3">
          {contactItems.map((item) => (
            <article
              key={item.label}
              className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <item.icon className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{item.label}</h2>
              <p className="mt-2 text-base font-medium text-gray-800">{item.value}</p>
              <p className="mt-2 leading-7 text-gray-600">{item.note}</p>
              <a
                href={item.href}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
              >
                Contact now
                <ArrowRight className="h-4 w-4" />
              </a>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-gray-100 bg-gray-50 p-8 shadow-sm">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm">
              <Clock3 className="h-4 w-4 text-emerald-600" />
              Support hours
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Clear support hours, no form required.</h2>
            <ul className="mt-4 space-y-3 text-gray-600">
              {supportHours.map((item) => (
                <li key={item} className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">Need an order or FAQ shortcut?</h2>
            <p className="mt-4 leading-7 text-gray-600">
              If you are checking order status or want a fast answer, these two routes are usually the best next step.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/orders">
                <Button size="lg">View orders</Button>
              </Link>
              <Link href="/faq">
                <Button size="lg" variant="outline">
                  View FAQ
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              Or go back to the <Link href="/products" className="font-semibold text-emerald-700 hover:text-emerald-800">product catalog</Link> and keep shopping.
            </p>
          </div>
        </section>
      </div>
    </StaticInfoPageShell>
  );
}
