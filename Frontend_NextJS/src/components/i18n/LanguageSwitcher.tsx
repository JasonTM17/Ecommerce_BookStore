"use client";

import { useTransition, useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const languages = [
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", name: "English", flag: "🇬🇧" },
];

export function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const currentLang = languages.find((l) => l.code === currentLocale) || languages[0];

  const handleSwitch = (locale: string) => {
    setIsOpen(false);
    startTransition(() => {
      // Replace locale segment in pathname
      const segments = pathname.split("/");
      segments[1] = locale;
      router.push(segments.join("/"));
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        aria-label="Switch language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600",
          "hover:bg-gray-100 transition-colors",
          isPending && "opacity-60 cursor-wait"
        )}
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{currentLang.name}</span>
        <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            role="listbox"
            aria-label="Select language"
            className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 overflow-hidden"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                role="option"
                aria-selected={lang.code === currentLocale}
                onClick={() => handleSwitch(lang.code)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                  lang.code === currentLocale
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
                {lang.code === currentLocale && (
                  <span className="ml-auto text-blue-500">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
