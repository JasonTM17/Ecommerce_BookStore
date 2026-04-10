import { vi, en } from "./messages";

export const i18n = {
  locales: ["vi", "en"] as const,
  defaultLocale: "vi" as const,
  localeNames: {
    vi: "Tiếng Việt",
    en: "English",
  },
};

export const messages = { vi, en };
export type Locale = (typeof i18n.locales)[number];

export function getMessage(locale: Locale, key: string): string {
  const keys = key.split(".");
  let value: unknown = messages[locale];

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }

  return typeof value === "string" ? value : key;
}
