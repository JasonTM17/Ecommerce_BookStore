"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onSearch?: (keyword: string) => void;
}

export function SearchBar({
  className,
  placeholder = "Tìm kiếm sách...",
  autoFocus = false,
  onSearch,
}: SearchBarProps) {
  const [keyword, setKeyword] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const debouncedSearch = useDebouncedCallback(
    (value: string) => {
      if (onSearch) {
        onSearch(value);
      } else if (value.trim()) {
        router.push(`/products?keyword=${encodeURIComponent(value.trim())}`);
      }
    },
    400
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyword(value);
    debouncedSearch(value);
  };

  const handleClear = () => {
    setKeyword("");
    inputRef.current?.focus();
    onSearch?.("");
  };

  // Keyboard shortcut "/" to focus search
  useEffect(() => {
    if (!autoFocus) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [autoFocus]);

  return (
    <div
      className={cn(
        "relative flex items-center transition-all duration-300",
        isFocused && "ring-2 ring-blue-500/30",
        className
      )}
    >
      <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        ref={inputRef}
        type="search"
        value={keyword}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        data-search-input
        aria-label="Tìm kiếm sách"
        className={cn(
          "w-full pl-10 pr-10 py-2.5 bg-white/80 backdrop-blur-sm",
          "border border-gray-200 rounded-xl text-sm",
          "placeholder:text-gray-400 focus:outline-none focus:border-blue-500",
          "transition-all duration-300",
          "dark:bg-gray-800/80 dark:border-gray-700 dark:text-gray-100"
        )}
      />
      {keyword && (
        <button
          onClick={handleClear}
          aria-label="Xóa tìm kiếm"
          className="absolute right-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-3.5 h-3.5 text-gray-400" />
        </button>
      )}
      {!keyword && (
        <kbd className="absolute right-3 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-gray-400 bg-gray-100 rounded border border-gray-200 dark:bg-gray-700 dark:border-gray-600 pointer-events-none">
          /
        </kbd>
      )}
    </div>
  );
}
