"use client";

import { NextIntlClientProvider } from "next-intl";
import { ReactNode } from "react";

interface LocaleProviderProps {
  children: ReactNode;
  locale?: string;
}

export function LocaleProvider({ children, locale = "vi" }: LocaleProviderProps) {
  return (
    <NextIntlClientProvider locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
