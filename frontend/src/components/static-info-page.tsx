import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getRequestLocale } from "@/lib/i18n/server";

type Breadcrumb = {
  label: string;
  href?: string;
};

interface StaticInfoPageShellProps {
  accentClassName: string;
  badgeText: string;
  breadcrumbs?: Breadcrumb[];
  description: string;
  icon: ReactNode;
  title: string;
  children: ReactNode;
}

export function StaticInfoPageShell({
  accentClassName,
  badgeText,
  breadcrumbs = [],
  description,
  icon,
  title,
  children,
}: StaticInfoPageShellProps) {
  const locale = getRequestLocale();
  const homeLabel = locale === "en" ? "Home" : "Trang chủ";
  const breadcrumbLabel = locale === "en" ? "Breadcrumb" : "Điều hướng trang";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50/70 to-white">
      <Header />

      <main className="flex-1">
        <section className={`relative overflow-hidden bg-gradient-to-br ${accentClassName} py-16`}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-black/10 blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <nav className="mb-4 flex items-center gap-2 text-sm text-white/75" aria-label={breadcrumbLabel}>
              <Link href="/" className="hover:text-white transition-colors">
                {homeLabel}
              </Link>
              {breadcrumbs.map((crumb) => (
                <div key={crumb.label} className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4" />
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-white transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-white">{crumb.label}</span>
                  )}
                </div>
              ))}
            </nav>

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                  <span className="text-yellow-300">{badgeText}</span>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-sm shadow-lg shadow-black/10">
                    {icon}
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">{title}</h1>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-white/85 md:text-lg">{description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">{children}</div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
