"use client";

import { useEffect, useState } from "react";

interface JsonLdProps {
  schema: Record<string, unknown>;
}

export function JsonLd({ schema }: JsonLdProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "BookStore Vietnam",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://bookstore.example.com",
    logo: `${process.env.NEXT_PUBLIC_BASE_URL || "https://bookstore.example.com"}/logo.png`,
    description: "Nền tảng thương mại điện tử bán sách hàng đầu Việt Nam",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+84-28-1234-5678",
      contactType: "customer service",
      availableLanguage: "Vietnamese",
    },
    sameAs: [
      "https://www.facebook.com/bookstorevietnam",
      "https://www.instagram.com/bookstorevietnam",
    ],
  };

  return <JsonLd schema={schema} />;
}

export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JsonLd schema={schema} />;
}

export function ProductSchema({ product }: {
  product: {
    id: number;
    name: string;
    slug?: string;
    description?: string;
    imageUrl?: string;
    author?: string;
    currentPrice: number;
    originalPrice?: number;
    discountPercent?: number;
    inStock?: boolean;
    rating?: number;
    reviewCount?: number;
    category?: string;
  }
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://bookstore.example.com";

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `Mua sách ${product.name} chính hãng với giá tốt nhất`,
    image: product.imageUrl || `${baseUrl}/placeholder-book.jpg`,
    url: `${baseUrl}/products/${product.slug || product.id}`,
    sku: `BOOK-${product.id}`,
    productID: product.id.toString(),
    brand: {
      "@type": "Brand",
      name: "BookStore Vietnam",
    },
    ...(product.author && {
      author: {
        "@type": "Person",
        name: product.author,
      },
    }),
    offers: {
      "@type": "Offer",
      priceCurrency: "VND",
      price: product.currentPrice,
      ...(product.originalPrice && {
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      }),
      availability: product.inStock !== false
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "BookStore Vietnam",
      },
    },
    ...(product.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewCount || 0,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  return <JsonLd schema={schema} />;
}

export function BookSchema({ book }: {
  book: {
    id: number;
    name: string;
    slug?: string;
    author?: string;
    isbn?: string;
    publisher?: string;
    publishYear?: number;
    description?: string;
    imageUrl?: string;
    currentPrice: number;
  }
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://bookstore.example.com";

  const schema = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.name,
    description: book.description,
    isbn: book.isbn,
    author: book.author
      ? { "@type": "Person", name: book.author }
      : undefined,
    publisher: book.publisher
      ? { "@type": "Organization", name: book.publisher }
      : undefined,
    datePublished: book.publishYear?.toString(),
    image: book.imageUrl,
    url: `${baseUrl}/products/${book.slug || book.id}`,
    offers: {
      "@type": "Offer",
      price: book.currentPrice,
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
    },
  };

  return <JsonLd schema={schema} />;
}

export function WebSiteSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://bookstore.example.com";

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BookStore Vietnam",
    url: baseUrl,
    description: "Nền tảng thương mại điện tử bán sách hàng đầu Việt Nam",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/products?keyword={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "BookStore Vietnam",
      url: baseUrl,
    },
  };

  return <JsonLd schema={schema} />;
}

export function FAQSchema(faqs: Array<{ question: string; answer: string }>) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return <JsonLd schema={schema} />;
}
