"use client";

import { useTranslations as useNextTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

export function useTranslation(namespace?: string) {
  const t = useNextTranslations(namespace);
  const locale = useLocale();

  const format = (key: string, values?: Record<string, string | number>) => {
    if (!values) return t(key);
    let result = t(key);
    for (const [k, v] of Object.entries(values)) {
      result = result.replace(`{${k}}`, String(v));
    }
    return result;
  };

  return { t, locale, format };
}
