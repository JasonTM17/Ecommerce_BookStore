import vi from "./locales/vi.json";
import en from "./locales/en.json";

export type Locale = "vi" | "en";

export const locales: Locale[] = ["vi", "en"];
export const defaultLocale: Locale = "vi";

export const translations = {
  vi,
  en,
};

export type TranslationKey = keyof typeof vi;

export function getTranslation(locale: Locale, key: string): string {
  const keys = key.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = translations[locale];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
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
