"use client";

import { useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

const languages = [
  { code: "vi", name: "Tiếng Việt", flag: "VN" },
  { code: "en", name: "English", flag: "EN" },
];

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { locale, setLocale, isLoading } = useLanguage();

  const currentLang =
    languages.find((language) => language.code === locale) || languages[0];

  const handleSwitch = (newLocale: string) => {
    setIsOpen(false);
    if (newLocale === "vi" || newLocale === "en") {
      setLocale(newLocale);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        aria-label="Switch language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          "eleven-pill-stone flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium",
          "transition-colors hover:bg-[#eee9e4]",
          isLoading && "cursor-wait opacity-60",
        )}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLang.name}</span>
        <ChevronDown
          className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")}
        />
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
            className="eleven-surface absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-2xl bg-white py-1"
          >
            {languages.map((language) => (
              <button
                key={language.code}
                role="option"
                aria-selected={language.code === locale}
                onClick={() => handleSwitch(language.code)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                  language.code === locale
                    ? "bg-[#f5f2ef] font-medium text-black"
                    : "text-[#4e4e4e] hover:bg-[#f8f6f3] hover:text-black",
                )}
              >
                <span>{language.flag}</span>
                <span>{language.name}</span>
                {language.code === locale && (
                  <Check className="ml-auto h-4 w-4 text-black" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
