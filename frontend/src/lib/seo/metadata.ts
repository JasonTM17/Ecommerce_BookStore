import type { Metadata } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://bookstore-web-dr1k.onrender.com";
const SITE_NAME = "BookStore Vietnam";
const DEFAULT_DESCRIPTION =
  "Mua sách trực tuyến với giá tốt nhất. Hơn 10.000 đầu sách từ nhiều thể loại: văn học, khoa học, kỹ năng sống, sách ngoại văn.";
const LOGO_URL = `${BASE_URL}/logo.png`;

export interface PageSeoParams {
  title?: string;
  description?: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
}

function buildUrl(path: string): string {
  return `${BASE_URL}${path}`;
}

export function buildMetadata(params: PageSeoParams): Metadata {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    path,
    image = `${BASE_URL}/og-image.jpg`,
    type = "website",
    publishedTime,
    modifiedTime,
    authors,
    tags,
  } = params;

  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const url = buildUrl(path);

  const base: Metadata = {
    metadataBase: new URL(BASE_URL),
    title: fullTitle,
    description,
    keywords: tags,
    authors: authors ? [{ name: authors.join(", ") }] : undefined,
    openGraph: {
      type,
      locale: "vi_VN",
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
      languages: {
        vi: url,
        en: `${url}?lang=en`,
      },
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
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
        { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
      ],
      apple: [{ url: "/apple-touch-icon.png" }],
    },
  };

  return base;
}

export const HOME_METADATA: Metadata = buildMetadata({
  path: "/",
  title: undefined,
  description:
    "BookStore Vietnam - Nền tảng bán sách trực tuyến hàng đầu Việt Nam. Hơn 10.000 đầu sách chính hãng, giao hàng nhanh, giá tốt nhất.",
});

export const PRODUCT_METADATA = (
  name: string,
  description: string,
  image: string,
) =>
  buildMetadata({
    title: name,
    description,
    path: "/products",
    image,
    type: "website",
  });

export const CATEGORY_METADATA = (categoryName: string) =>
  buildMetadata({
    title: `Sách ${categoryName}`,
    description: `Khám phá bộ sưu tập sách ${categoryName} chính hãng tại BookStore Vietnam. Giá tốt, giao nhanh.`,
    path: "/categories",
  });

export const CART_METADATA = buildMetadata({
  title: "Giỏ Hàng",
  description: "Xem và quản lý giỏ hàng của bạn tại BookStore Vietnam.",
  path: "/cart",
});

export const LOGIN_METADATA = buildMetadata({
  title: "Đăng Nhập",
  description:
    "Đăng nhập vào tài khoản BookStore Vietnam để mua sắm và theo dõi đơn hàng.",
  path: "/login",
});

export const REGISTER_METADATA = buildMetadata({
  title: "Đăng Ký",
  description:
    "Tạo tài khoản BookStore Vietnam để nhận ưu đãi và mua sắm dễ dàng.",
  path: "/register",
});
