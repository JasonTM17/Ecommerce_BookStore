import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { WebVitals } from "@/components/seo/WebVitals";
import { OrganizationSchema, WebSiteSchema } from "@/components/seo/JsonLd";
import { SkipLink } from "@/components/a11y/SkipLink";
import { ClientChrome } from "@/components/layout/client-chrome";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { getRequestLocale } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://bookstore-web-dr1k.onrender.com";

function getLayoutMeta(locale: Locale) {
  if (locale === "en") {
    return {
      title: "BookStore Vietnam - Authentic Books, Better Prices",
      description:
        "A polished online bookstore with curated titles, weekly flash sales, and a modern shopping experience.",
      keywords: [
        "online bookstore",
        "authentic books",
        "weekly flash sale",
        "bookstore vietnam",
        "buy books online",
      ],
      ogLocale: "en_US",
      mainAriaLabel: "Main content",
    };
  }

  return {
    title: "BookStore Vietnam - Sách Chính Hãng, Giá Tốt",
    description:
      "Nền tảng bán sách trực tuyến với catalog tuyển chọn, flash sale hàng tuần và trải nghiệm mua sắm hiện đại.",
    keywords: [
      "mua sách online",
      "sách chính hãng",
      "flash sale sách",
      "nhà sách online",
      "bookstore vietnam",
    ],
    ogLocale: "vi_VN",
    mainAriaLabel: "Nội dung chính",
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const meta = getLayoutMeta(locale);

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: meta.title,
      template: "%s | BookStore Vietnam",
    },
    description: meta.description,
    keywords: meta.keywords,
    authors: [{ name: "BookStore Vietnam" }],
    creator: "BookStore Vietnam",
    publisher: "BookStore Vietnam",
    openGraph: {
      type: "website",
      locale: meta.ogLocale,
      url: BASE_URL,
      siteName: "BookStore Vietnam",
      title: meta.title,
      description: meta.description,
      images: [
        {
          url: `${BASE_URL}/og-image.svg`,
          width: 1200,
          height: 630,
          alt: "BookStore Vietnam",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [`${BASE_URL}/og-image.svg`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: BASE_URL,
      languages: {
        vi: BASE_URL,
        en: BASE_URL,
      },
    },
    manifest: "/manifest.json",
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
        { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
        { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
      ],
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffdf7" },
    { media: "(prefers-color-scheme: dark)", color: "#11100e" },
    { media: "(prefers-color-scheme: no-preference)", color: "#fffdf7" },
    { color: "#fffdf7" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();
  const meta = getLayoutMeta(locale);

  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body className={beVietnamPro.className}>
        <SkipLink
          label={
            locale === "en"
              ? "Skip to main content"
              : "Chuyển đến nội dung chính"
          }
        />
        <OrganizationSchema />
        <WebSiteSchema />
        <WebVitals />
        <ServiceWorkerRegistration />
        <Providers initialLocale={locale}>
          <main id="main-content" role="main" aria-label={meta.mainAriaLabel}>
            {children}
          </main>
          <ClientChrome />
          <Toaster position="top-right" closeButton />
        </Providers>
      </body>
    </html>
  );
}
