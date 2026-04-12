"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Clock, Mail, MapPin, Phone } from "lucide-react";
import { interpolate } from "@/lib/i18n";
import { useLanguage } from "@/components/providers/language-provider";

export function Footer() {
  const { t } = useLanguage();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const handleNewsletterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const email = newsletterEmail.trim();
    if (!email) {
      return;
    }

    const subject = encodeURIComponent(t("footer.newsletterSubject"));
    const body = encodeURIComponent(interpolate(t("footer.newsletterBody"), { email }));

    window.open(`mailto:contact@bookstore.com?subject=${subject}&body=${body}`, "_self");
    setNewsletterSubmitted(true);
  };

  return (
    <footer
      role="contentinfo"
      aria-label={t("footer.ariaLabel")}
      className="relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-gray-300"
    >
      <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600" />

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-6" role="region" aria-labelledby="footer-brand">
            <h2 id="footer-brand" className="sr-only">
              {t("footer.brandHeading")}
            </h2>
            <Link href="/" className="flex items-center group">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-500/30 transition-all duration-300 group-hover:scale-105 group-hover:shadow-blue-500/50">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-white transition-colors group-hover:text-blue-400">
                BookStore
              </span>
            </Link>
            <p className="leading-relaxed text-gray-400">{t("footer.brandDescription")}</p>
            <div className="flex flex-wrap gap-3" aria-label={t("footer.projectLinks")}>
              {[
                { href: "/about", label: t("footer.projectAbout") },
                { href: "/contact", label: t("footer.contact") },
                { href: "/faq", label: t("footer.support") },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-gray-700 px-4 py-2 text-sm text-gray-300 transition-colors hover:border-blue-500 hover:text-blue-400"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <nav aria-labelledby="footer-nav-heading" className="space-y-6">
            <h2 id="footer-nav-heading" className="relative inline-block text-lg font-semibold text-white">
              {t("footer.projectLinks")}
              <span className="absolute -bottom-1 left-0 h-0.5 w-12 bg-gradient-to-r from-blue-600 to-transparent" />
            </h2>
            <ul className="space-y-3">
              {[
                { href: "/products", label: t("nav.products") },
                { href: "/categories", label: t("nav.categories") },
                { href: "/about", label: t("nav.about") },
                { href: "/contact", label: t("nav.contact") },
                { href: "/blog", label: t("nav.blog") },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center text-gray-400 transition-colors duration-300 hover:text-blue-400"
                  >
                    <span className="mr-0 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:mr-2 group-hover:w-2" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-service-heading" className="space-y-6">
            <h2 id="footer-service-heading" className="relative inline-block text-lg font-semibold text-white">
              {t("footer.customerService")}
              <span className="absolute -bottom-1 left-0 h-0.5 w-12 bg-gradient-to-r from-blue-600 to-transparent" />
            </h2>
            <ul className="space-y-3">
              {[
                { href: "/faq", label: t("nav.faq") },
                { href: "/shipping", label: t("nav.shipping") },
                { href: "/returns", label: t("nav.returns") },
                { href: "/privacy", label: t("nav.privacy") },
                { href: "/terms", label: t("nav.terms") },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center text-gray-400 transition-colors duration-300 hover:text-blue-400"
                  >
                    <span className="mr-0 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:mr-2 group-hover:w-2" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <section aria-labelledby="footer-contact-heading" className="space-y-6">
            <h2 id="footer-contact-heading" className="relative inline-block text-lg font-semibold text-white">
              {t("footer.contact")}
              <span className="absolute -bottom-1 left-0 h-0.5 w-12 bg-gradient-to-r from-blue-600 to-transparent" />
            </h2>
            <ul className="space-y-4">
              <li className="group flex items-start space-x-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-800 transition-colors duration-300 group-hover:bg-blue-600/20">
                  <MapPin className="h-5 w-5 text-blue-500 transition-colors group-hover:text-blue-400" />
                </div>
                <span className="text-gray-400 transition-colors group-hover:text-gray-300">{t("footer.address")}</span>
              </li>
              <li className="group flex items-start space-x-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-800 transition-colors duration-300 group-hover:bg-blue-600/20">
                  <Phone className="h-5 w-5 text-blue-500 transition-colors group-hover:text-blue-400" />
                </div>
                <span className="text-gray-400 transition-colors group-hover:text-gray-300">0901 234 567</span>
              </li>
              <li className="group flex items-start space-x-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-800 transition-colors duration-300 group-hover:bg-blue-600/20">
                  <Mail className="h-5 w-5 text-blue-500 transition-colors group-hover:text-blue-400" />
                </div>
                <span className="text-gray-400 transition-colors group-hover:text-gray-300">contact@bookstore.com</span>
              </li>
              <li className="group flex items-start space-x-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-800 transition-colors duration-300 group-hover:bg-blue-600/20">
                  <Clock className="h-5 w-5 text-blue-500 transition-colors group-hover:text-blue-400" />
                </div>
                <span className="text-gray-400 transition-colors group-hover:text-gray-300">{t("footer.businessHours")}</span>
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-16 rounded-2xl border border-gray-700/50 bg-gradient-to-r from-gray-800/50 via-gray-800 to-gray-800/50 p-8">
          <h2 className="mb-2 text-xl font-semibold text-white">{t("footer.newsletterTitle")}</h2>
          <p className="mb-4 text-gray-400">{t("footer.newsletterDescription")}</p>
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleNewsletterSubmit}>
            <label htmlFor="newsletter-email" className="sr-only">
              {t("footer.newsletterInput")}
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={newsletterEmail}
              onChange={(event) => {
                setNewsletterEmail(event.target.value);
                if (newsletterSubmitted) {
                  setNewsletterSubmitted(false);
                }
              }}
              required
              placeholder={t("footer.newsletterInput")}
              aria-label={t("footer.newsletterInput")}
              className="h-12 flex-1 rounded-lg border border-gray-700 bg-gray-900/50 px-4 text-white placeholder-gray-500 transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-80 sm:flex-none"
            />
            <button
              type="submit"
              aria-label={t("footer.newsletterSubmit")}
              className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-medium text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/50"
            >
              {t("footer.newsletterSubmit")}
            </button>
          </form>
          {newsletterSubmitted ? (
            <p className="mt-3 text-sm text-blue-300" data-testid="newsletter-confirmation">
              {t("footer.newsletterConfirmation")}
            </p>
          ) : null}
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} <span className="text-blue-500">BookStore</span>. {t("footer.copyright")}
            </p>
            <p className="text-sm text-gray-500">
              {t("footer.portfolioBy")} <span className="text-blue-400">Nguyễn Sơn</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
