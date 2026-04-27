"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, Clock, Mail, MapPin, Phone } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { interpolate } from "@/lib/i18n";

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
    const body = encodeURIComponent(
      interpolate(t("footer.newsletterBody"), { email }),
    );

    window.open(
      `mailto:contact@bookstore.com?subject=${subject}&body=${body}`,
      "_self",
    );
    setNewsletterSubmitted(true);
  };

  const projectLinks = [
    { href: "/products", label: t("nav.products") },
    { href: "/categories", label: t("nav.categories") },
    { href: "/about", label: t("nav.about") },
    { href: "/contact", label: t("nav.contact") },
    { href: "/blog", label: t("nav.blog") },
  ];

  const serviceLinks = [
    { href: "/faq", label: t("nav.faq") },
    { href: "/shipping", label: t("nav.shipping") },
    { href: "/returns", label: t("nav.returns") },
    { href: "/privacy", label: t("nav.privacy") },
    { href: "/terms", label: t("nav.terms") },
  ];

  const quickLinks = [
    { href: "/about", label: t("footer.projectAbout") },
    { href: "/contact", label: t("footer.contact") },
    { href: "/faq", label: t("footer.support") },
  ];

  return (
    <footer
      role="contentinfo"
      aria-label={t("footer.ariaLabel")}
      className="border-t border-black/[0.06] bg-[#fffdfb] text-[#4e4e4e]"
    >
      <div className="container mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div
            className="space-y-6"
            role="region"
            aria-labelledby="footer-brand"
          >
            <h2 id="footer-brand" className="sr-only">
              {t("footer.brandHeading")}
            </h2>
            <Link href="/" className="group flex items-center">
              <div className="eleven-warm-surface relative flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105">
                <BookOpen className="h-6 w-6 text-black" />
              </div>
              <span className="ml-3 text-xl font-semibold text-black">
                BookStore
              </span>
            </Link>
            <p className="eleven-body leading-relaxed">
              {t("footer.brandDescription")}
            </p>
            <div
              className="flex flex-wrap gap-3"
              aria-label={t("footer.projectLinks")}
            >
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="eleven-pill-stone px-4 py-2 text-sm font-medium transition-colors hover:bg-[#eee9e4]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <nav aria-labelledby="footer-nav-heading" className="space-y-6">
            <h2 id="footer-nav-heading" className="eleven-kicker">
              {t("footer.projectLinks")}
            </h2>
            <ul className="space-y-3">
              {projectLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center text-[#4e4e4e] transition-colors duration-300 hover:text-black"
                  >
                    <span className="mr-0 h-0.5 w-0 bg-black transition-all duration-300 group-hover:mr-2 group-hover:w-2" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-service-heading" className="space-y-6">
            <h2 id="footer-service-heading" className="eleven-kicker">
              {t("footer.customerService")}
            </h2>
            <ul className="space-y-3">
              {serviceLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center text-[#4e4e4e] transition-colors duration-300 hover:text-black"
                  >
                    <span className="mr-0 h-0.5 w-0 bg-black transition-all duration-300 group-hover:mr-2 group-hover:w-2" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <section
            aria-labelledby="footer-contact-heading"
            className="space-y-6"
          >
            <h2 id="footer-contact-heading" className="eleven-kicker">
              {t("footer.contact")}
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <div className="eleven-warm-surface flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                  <MapPin className="h-5 w-5 text-black" />
                </div>
                <span className="eleven-body">{t("footer.address")}</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="eleven-warm-surface flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                  <Phone className="h-5 w-5 text-black" />
                </div>
                <span className="eleven-body">0901 234 567</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="eleven-warm-surface flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                  <Mail className="h-5 w-5 text-black" />
                </div>
                <span className="eleven-body">contact@bookstore.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="eleven-warm-surface flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                  <Clock className="h-5 w-5 text-black" />
                </div>
                <span className="eleven-body">{t("footer.businessHours")}</span>
              </li>
            </ul>
          </section>
        </div>

        <div className="eleven-surface mt-16 rounded-[26px] bg-white p-6 md:p-8">
          <h2 className="mb-2 text-2xl font-light text-black">
            {t("footer.newsletterTitle")}
          </h2>
          <p className="eleven-body mb-5">
            {t("footer.newsletterDescription")}
          </p>
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={handleNewsletterSubmit}
          >
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
              className="h-12 flex-1 rounded-full border border-black/[0.08] bg-[#f8f6f3] px-5 text-black placeholder-[#777169] transition-colors duration-300 focus:border-black/30 focus:bg-white focus:outline-none sm:w-80 sm:flex-none"
            />
            <button
              type="submit"
              aria-label={t("footer.newsletterSubmit")}
              className="eleven-pill-black px-6 py-3 font-medium transition-transform duration-300 hover:scale-[1.02]"
            >
              {t("footer.newsletterSubmit")}
            </button>
          </form>
          {newsletterSubmitted ? (
            <p
              className="mt-3 text-sm font-medium text-[#3f7a4f]"
              data-testid="newsletter-confirmation"
            >
              {t("footer.newsletterConfirmation")}
            </p>
          ) : null}
        </div>

        <div className="mt-12 border-t border-black/[0.06] pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="eleven-muted text-sm">
              © {new Date().getFullYear()}{" "}
              <span className="text-black">BookStore</span>.{" "}
              {t("footer.copyright")}
            </p>
            <p className="eleven-muted text-sm">
              {t("footer.portfolioBy")}{" "}
              <span className="text-black">Nguyễn Sơn</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
