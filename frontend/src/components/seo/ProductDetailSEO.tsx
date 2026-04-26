"use client";

import { ProductSchema, BookSchema, BreadcrumbSchema } from "./JsonLd";
import type { Product } from "@/lib/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://bookstore-web-dr1k.onrender.com";

interface ProductDetailSEOProps {
  product: Product;
  breadcrumbs?: Array<{ name: string; url: string }>;
}

export function ProductDetailSEO({
  product,
  breadcrumbs,
}: ProductDetailSEOProps) {
  const breadcrumbItems = breadcrumbs || [
    { name: "Trang chủ", url: BASE_URL },
    { name: "Sản phẩm", url: `${BASE_URL}/products` },
    ...(product.category
      ? [
          {
            name: product.category.name,
            url: `${BASE_URL}/categories?id=${product.category.id}`,
          },
        ]
      : []),
    {
      name: product.name,
      url: `${BASE_URL}/products/${product.slug || product.id}`,
    },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <BookSchema
        book={{
          id: product.id,
          name: product.name,
          slug: product.slug || product.id.toString(),
          author: product.author,
          isbn: product.isbn,
          publisher: product.publisher,
          publishYear: product.publishedYear,
          description: product.description,
          imageUrl: product.imageUrl,
          currentPrice: product.currentPrice,
        }}
      />
      <ProductSchema
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug || product.id.toString(),
          description: product.description,
          imageUrl: product.imageUrl,
          author: product.author,
          currentPrice: product.currentPrice,
          originalPrice:
            product.price !== product.currentPrice ? product.price : undefined,
          discountPercent: product.discountPercent,
          inStock: product.inStock,
          rating: product.avgRating,
          reviewCount: product.reviewCount,
          category: product.category?.name,
        }}
      />
    </>
  );
}

interface CategorySEOProps {
  categoryName: string;
  categoryDescription?: string;
  productCount?: number;
}

export function CategorySEO({
  categoryName,
  categoryDescription,
}: CategorySEOProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Sách ${categoryName}`,
    description:
      categoryDescription ||
      `Bộ sưu tập sách ${categoryName} chính hãng tại BookStore Vietnam. Giá tốt, giao nhanh.`,
    publisher: {
      "@type": "Organization",
      name: "BookStore Vietnam",
      url: BASE_URL,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface HomeSEOProps {
  totalProducts?: number;
  totalCategories?: number;
}

export function HomeSEO({
  totalProducts = 10000,
  totalCategories = 20,
}: HomeSEOProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BookStore Vietnam",
    url: BASE_URL,
    description:
      "Nền tảng bán sách trực tuyến hàng đầu Việt Nam. Hơn 10.000 đầu sách chính hãng.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/products?keyword={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    about: {
      "@type": "Thing",
      name: "Online Bookstore",
      description: `Hơn ${totalProducts} đầu sách từ ${totalCategories} danh mục`,
    },
    numberOfItems: totalProducts,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
