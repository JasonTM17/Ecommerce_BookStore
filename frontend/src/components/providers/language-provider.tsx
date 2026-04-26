"use client";

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { getLocaleFromCookie, getTranslation, isLocale } from "@/lib/i18n";

export type Locale = "vi" | "en";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);
const localeCookieMaxAge = 60 * 60 * 24 * 365;

function localeCookieValue(locale: Locale) {
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; secure"
      : "";

  return `NEXT_LOCALE=${locale}; path=/; max-age=${localeCookieMaxAge}; samesite=lax${secure}`;
}

export function LanguageProvider({
  children,
  initialLocale = "vi",
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedLocale = localStorage.getItem("locale");
    const nextLocale = isLocale(savedLocale)
      ? savedLocale
      : getLocaleFromCookie();

    if (nextLocale !== locale) {
      setLocaleState(nextLocale);
    }
    localStorage.setItem("locale", nextLocale);
    document.cookie = localeCookieValue(nextLocale);
  }, [locale]);

  const setLocale = useCallback(
    (newLocale: Locale) => {
      if (newLocale === locale) {
        return;
      }

      localStorage.setItem("locale", newLocale);
      document.cookie = localeCookieValue(newLocale);
      setLocaleState(newLocale);
      setIsLoading(true);

      startTransition(() => {
        router.refresh();
        setIsLoading(false);
      });
    },
    [locale, router],
  );

  const t = useCallback(
    (key: string): string => {
      try {
        return getTranslation(locale, key);
      } catch {
        return key;
      }
    },
    [locale],
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
