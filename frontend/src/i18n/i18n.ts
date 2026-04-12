import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

export const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "vi";

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) notFound();

  return {
    locale: locale || defaultLocale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
