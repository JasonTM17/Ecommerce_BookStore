import { cookies } from "next/headers";
import { defaultLocale, parseLocale, type Locale } from "@/lib/i18n";

export function getRequestLocale(): Locale {
  const cookieStore = cookies();
  return parseLocale(cookieStore.get("NEXT_LOCALE")?.value ?? defaultLocale);
}
