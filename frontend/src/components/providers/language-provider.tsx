"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { getLocaleFromCookie, getTranslation } from "@/lib/i18n";

export type Locale = "vi" | "en";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
const localeCookieMaxAge = 60 * 60 * 24 * 365;

function isLocale(value: string | null): value is Locale {
  return value === "vi" || value === "en";
}

export function LanguageProvider({
  children,
  initialLocale = "vi",
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedLocale = localStorage.getItem("locale");
    const nextLocale = isLocale(savedLocale) ? savedLocale : getLocaleFromCookie();

    setLocaleState(nextLocale);
    localStorage.setItem("locale", nextLocale);
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=${localeCookieMaxAge}`;
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setIsLoading(true);
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${localeCookieMaxAge}`;
    setIsLoading(false);
  }, []);

  const t = useCallback(
    (key: string): string => {
      try {
        return getTranslation(locale, key);
      } catch {
        return key;
      }
    },
    [locale]
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
