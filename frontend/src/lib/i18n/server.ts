import { cookies } from "next/headers";
import { defaultLocale, parseLocale, type Locale } from "@/lib/i18n";

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return parseLocale(cookieStore.get("NEXT_LOCALE")?.value ?? defaultLocale);
}
