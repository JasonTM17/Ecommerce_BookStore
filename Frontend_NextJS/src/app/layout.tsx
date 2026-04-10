import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { WebVitals } from "@/components/seo/WebVitals";
import { OrganizationSchema, WebSiteSchema } from "@/components/seo/JsonLd";
import { SkipLink } from "@/components/a11y/SkipLink";
// Dynamic imports for performance - load below the fold
const ChatbotWidget = dynamic(
  () => import("@/components/chatbot").then((m) => ({ default: m.ChatbotWidget })),
  {
    ssr: false,
    loading: () => null,
  }
);

const FlashSaleBanner = dynamic(
  () => import("@/components/flashsale").then((m) => ({ default: m.FlashSaleBanner })),
  {
    ssr: false,
    loading: () => null,
  }
);

const inter = Inter({ subsets: ["latin"] });

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://bookstore.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "BookStore Vietnam - Sách Chính Hãng, Giá Tốt Nhất",
    template: "%s | BookStore Vietnam",
  },
  description:
    "Nền tảng bán sách trực tuyến hàng đầu Việt Nam. Hơn 10.000 đầu sách chính hãng: văn học, khoa học, kỹ năng sống, sách ngoại văn. Miễn phí vận chuyển, ưu đãi hấp dẫn.",
  keywords: [
    "mua sách online",
    "sách chính hãng",
    "sách giảm giá",
    "nhà sách online",
    "ebook",
    "sách tiếng anh",
    "sách văn học",
    "sách kỹ năng sống",
  ],
  authors: [{ name: "BookStore Vietnam" }],
  creator: "BookStore Vietnam",
  publisher: "BookStore Vietnam",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: BASE_URL,
    siteName: "BookStore Vietnam",
    title: "BookStore Vietnam - Sách Chính Hãng, Giá Tốt Nhất",
    description:
      "Nền tảng bán sách trực tuyến hàng đầu Việt Nam. Hơn 10.000 đầu sách chính hãng.",
    images: [
      {
        url: `${BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "BookStore Vietnam",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BookStore Vietnam - Sách Chính Hãng, Giá Tốt Nhất",
    description:
      "Nền tảng bán sách trực tuyến hàng đầu Việt Nam. Hơn 10.000 đầu sách chính hãng.",
    images: [`${BASE_URL}/og-image.jpg`],
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
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#1e40af" },
    { media: "(prefers-color-scheme: no-preference)", color: "#3b82f6" },
    { color: "#3b82f6" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <SkipLink />
        <OrganizationSchema />
        <WebSiteSchema />
        <WebVitals />
        <Providers>
          <FlashSaleBanner />
          <main id="main-content" role="main" aria-label="Nội dung chính">
            {children}
          </main>
          <ChatbotWidget />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
