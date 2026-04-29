"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home } from "lucide-react";
import Link from "next/link";
import { getLocaleFromCookie, getTranslation } from "@/lib/i18n";
import { logClientError } from "@/lib/monitoring";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = getLocaleFromCookie();
  const t = (key: string) => getTranslation(locale, key);

  useEffect(() => {
    console.error("Global error:", error);
    logClientError({
      component: "app/global-error",
      digest: error.digest,
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
  }, [error]);

  return (
    <html lang={locale}>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{t("errors.criticalTitle")}</h1>
            <p className="text-gray-600 mb-8">{t("errors.criticalDescription")}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button onClick={reset} size="lg">
                {t("common.retry")}
              </Button>
              <Link href="/">
                <Button variant="outline" size="lg">
                  <Home className="h-4 w-4 mr-2" />
                  {t("common.backHome")}
                </Button>
              </Link>
            </div>
            {process.env.NODE_ENV === "development" && (
              <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left">
                <p className="text-sm font-mono text-red-600 break-all">{error.message}</p>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
