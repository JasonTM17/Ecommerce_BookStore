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
  tone?: "dark" | "light";
  title: string;
  children: ReactNode;
}

export function StaticInfoPageShell({
  accentClassName,
  badgeText,
  breadcrumbs = [],
  description,
  icon,
  tone = "dark",
  title,
  children,
}: StaticInfoPageShellProps) {
  const locale = getRequestLocale();
  const homeLabel = locale === "en" ? "Home" : "Trang chủ";
  const breadcrumbLabel = locale === "en" ? "Breadcrumb" : "Điều hướng trang";
  const isLight = tone === "light";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section
          className={`relative overflow-hidden bg-gradient-to-br ${accentClassName} ${
            isLight ? "border-b border-black/[0.05] py-14" : "py-16"
          }`}
        >
          <div className="container mx-auto px-4 relative z-10">
            <nav
              className={`mb-4 flex items-center gap-2 text-sm ${isLight ? "text-[#777169]" : "text-white/75"}`}
              aria-label={breadcrumbLabel}
            >
              <Link
                href="/"
                className={
                  isLight
                    ? "transition-colors hover:text-black"
                    : "hover:text-white transition-colors"
                }
              >
                {homeLabel}
              </Link>
              {breadcrumbs.map((crumb) => (
                <div key={crumb.label} className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4" />
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className={
                        isLight
                          ? "transition-colors hover:text-black"
                          : "hover:text-white transition-colors"
                      }
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={isLight ? "text-black" : "text-white"}>
                      {crumb.label}
                    </span>
                  )}
                </div>
              ))}
            </nav>

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-3xl">
                <div
                  className={`mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                    isLight
                      ? "bg-[rgba(245,242,239,0.8)] text-black shadow-[rgba(78,50,23,0.04)_0px_6px_16px,rgba(0,0,0,0.075)_0px_0px_0px_0.5px_inset]"
                      : "bg-white/10 text-white backdrop-blur-sm"
                  }`}
                >
                  <span className={isLight ? "text-black" : "text-yellow-300"}>
                    {badgeText}
                  </span>
                </div>
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-3xl ${
                      isLight
                        ? "bg-white text-black shadow-[rgba(0,0,0,0.06)_0px_0px_0px_1px,rgba(0,0,0,0.04)_0px_4px_4px]"
                        : "bg-white/10 text-white backdrop-blur-sm shadow-lg shadow-black/10"
                    }`}
                  >
                    {icon}
                  </div>
                  <div>
                    <h1
                      className={`text-4xl font-light leading-tight md:text-5xl ${
                        isLight ? "text-black" : "tracking-tight text-white"
                      }`}
                    >
                      {title}
                    </h1>
                    <p
                      className={`mt-4 max-w-2xl text-base leading-7 md:text-lg ${
                        isLight ? "text-[#4e4e4e]" : "text-white/85"
                      }`}
                    >
                      {description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={isLight ? "bg-[#f5f5f5] py-12" : "py-12"}>
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">{children}</div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
