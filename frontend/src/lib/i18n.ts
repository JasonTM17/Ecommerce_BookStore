import { vi, en } from "./i18n/messages";

export type Locale = "vi" | "en";

export const locales: Locale[] = ["vi", "en"];
export const defaultLocale: Locale = "vi";

export const translations: Record<Locale, Record<string, unknown>> = {
  vi,
  en,
};

export function getTranslation(locale: Locale, key: string): string {
  const keys = key.split(".");
  let value: Record<string, unknown> | unknown = translations[locale];
  
  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }
  
  return typeof value === "string" ? value : key;
}

export function formatCurrency(amount: number, locale: Locale = "vi"): string {
  const formatter = new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: locale === "vi" ? "VND" : "USD",
    minimumFractionDigits: 0,
  });
  return formatter.format(amount);
}

export function formatDate(date: string | Date, locale: Locale = "vi"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getLocaleFromCookie(): Locale {
  if (typeof document === "undefined") return "vi";
  
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "NEXT_LOCALE" && (value === "vi" || value === "en")) {
      return value;
    }
  }
  return "vi";
}
