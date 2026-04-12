import { MetadataRoute } from "next";
import { apiPublic } from "@/lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://bookstore.example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/flash-sale`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/promotions`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/shipping`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/returns`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    const [productsRes, categoriesRes] = await Promise.allSettled([
      apiPublic.get("/products?page=0&size=100"),
      apiPublic.get("/categories"),
    ]);

    const productRoutes: MetadataRoute.Sitemap = [];

    if (productsRes.status === "fulfilled") {
      const products = productsRes.value.data?.content || [];
      for (const product of products) {
        productRoutes.push({
          url: `${BASE_URL}/products/${product.slug || product.id}`,
          lastModified: new Date(product.updatedAt || Date.now()),
          changeFrequency: "weekly" as const,
          priority: product.isFeatured ? 0.8 : 0.7,
        });
      }
    }

    const categoryRoutes: MetadataRoute.Sitemap = [];

    if (categoriesRes.status === "fulfilled") {
      const categories = categoriesRes.value.data?.content || categoriesRes.value.data || [];
      for (const category of categories) {
        categoryRoutes.push({
          url: `${BASE_URL}/categories?id=${category.id}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        });
      }
    }

    return [...staticRoutes, ...productRoutes, ...categoryRoutes];
  } catch {
    return staticRoutes;
  }
}
