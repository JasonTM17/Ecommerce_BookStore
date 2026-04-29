"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock,
  Flame,
  LogOut,
  Search,
  ShoppingCart,
  User,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useAuth } from "@/components/providers/auth-provider";
import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";
import { clearAuthTokens } from "@/lib/api";
import { flashSaleApi, type FlashSale } from "@/lib/flashsale";
import { getDemoActiveFlashSales } from "@/lib/demo-storefront";
import { useCartStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const HEADER_FLASH_SALE_COPY = {
  vi: {
    label: "Flash sale",
    prefix: "Sách hot giảm đến",
    slot: "5 khung giờ hôm nay",
    endsIn: "Còn",
    cta: "Xem deal",
  },
  en: {
    label: "Flash sale",
    prefix: "Hot books up to",
    slot: "5 daily slots",
    endsIn: "Left",
    cta: "View deals",
  },
} as const;

export function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCartStore();
  const { locale, t } = useLanguage();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [quickSearch, setQuickSearch] = useState("");
  const userMenuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { href: "/", label: t("nav.home") },
    { href: "/products", label: t("nav.products") },
    { href: "/categories", label: t("nav.categories") },
    { href: "/about", label: t("nav.about") },
  ];

  const menuLabels = {
    account: t("nav.account"),
    orders: t("nav.orders"),
    admin: t("nav.admin"),
    logout: t("nav.logout"),
    login: t("nav.login"),
  };

  useEffect(() => {
    setHasMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const keyword = quickSearch.trim();
    if (keyword.length < 2) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams({ focus: "search", keyword });
      router.push(`/products?${params.toString()}`);
    }, 550);

    return () => window.clearTimeout(timeoutId);
  }, [quickSearch, router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    clearAuthTokens();
    router.push("/");
    setIsUserMenuOpen(false);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-black/[0.05] transition-all duration-300",
        isScrolled
          ? "bg-white/92 shadow-[rgba(0,0,0,0.04)_0_4px_18px] backdrop-blur-xl"
          : "bg-white/88 backdrop-blur-xl",
      )}
    >
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between md:h-20">
          <Link href="/" className="group flex min-w-0 shrink-0 items-center">
            <div className="eleven-warm-surface relative flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105">
              <BookOpen className="h-5 w-5 text-black" />
            </div>
            <span className="ml-3 text-lg font-semibold tracking-normal text-black sm:text-xl">
              BookStore
            </span>
          </Link>

          <nav className="hidden items-center space-x-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-[15px] font-medium text-[#4e4e4e] transition-colors duration-300 hover:bg-[#f5f2ef] hover:text-black"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form
            role="search"
            className="relative hidden w-56 items-center xl:flex 2xl:w-72"
            onSubmit={(event) => {
              event.preventDefault();
              const keyword = quickSearch.trim();
              const params = new URLSearchParams({ focus: "search" });
              if (keyword) {
                params.set("keyword", keyword);
              }
              router.push(`/products?${params.toString()}`);
            }}
          >
            <Search className="pointer-events-none absolute left-4 h-4 w-4 text-[#777169]" />
            <input
              type="search"
              value={quickSearch}
              onChange={(event) => setQuickSearch(event.target.value)}
              placeholder={locale === "vi" ? "Tìm kiếm sách" : "Search books"}
              aria-label={t("common.search")}
              className="h-11 w-full rounded-full border border-black/[0.08] bg-[#f8f5f1] pl-11 pr-4 text-sm text-black outline-none transition focus:border-black/30 focus:bg-white focus:ring-2 focus:ring-black/5"
            />
          </form>

          <div className="flex items-center space-x-2">
            <Link href="/products?focus=search">
              <Button
                variant="ghost"
                size="icon"
                className="group relative rounded-full hover:bg-[#f5f2ef]"
                aria-label={t("common.search")}
              >
                <Search className="h-5 w-5 text-[#4e4e4e] transition-colors group-hover:text-black" />
              </Button>
            </Link>

            <Link href="/cart" className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="group relative rounded-full hover:bg-[#f5f2ef]"
                aria-label={t("nav.cart")}
              >
                <ShoppingCart className="h-5 w-5 text-[#4e4e4e] transition-colors group-hover:text-black" />
                {hasMounted && totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white shadow-[rgba(0,0,0,0.18)_0_4px_12px]">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Button>
            </Link>

            <LanguageSwitcher />

            {isAuthenticated ? (
              <div className="relative hidden sm:block" ref={userMenuRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="eleven-pill-stone flex items-center gap-2 px-3 transition-colors hover:bg-[#eee9e4]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-medium text-white">
                    {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <span className="hidden text-sm font-medium text-black sm:inline">
                    {user?.fullName}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-[#777169] transition-transform duration-200",
                      isUserMenuOpen && "rotate-180",
                    )}
                  />
                </Button>

                {isUserMenuOpen && (
                  <div className="eleven-surface absolute right-0 z-50 mt-2 w-56 animate-in rounded-2xl py-2 duration-200 fade-in slide-in-from-top-2">
                    <div className="border-b border-black/[0.05] px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.fullName}
                      </p>
                      <p className="mt-0.5 text-xs text-[#777169]">
                        {user?.email}
                      </p>
                    </div>

                    <div className="py-2">
                      <Link
                        href="/account"
                        className="mx-2 flex items-center rounded-full px-4 py-2.5 text-sm text-[#4e4e4e] transition-colors hover:bg-[#f5f2ef] hover:text-black"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="mr-3 h-4 w-4" />
                        {menuLabels.account}
                      </Link>
                      <Link
                        href="/orders"
                        className="mx-2 flex items-center rounded-full px-4 py-2.5 text-sm text-[#4e4e4e] transition-colors hover:bg-[#f5f2ef] hover:text-black"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <ShoppingCart className="mr-3 h-4 w-4" />
                        {menuLabels.orders}
                      </Link>
                    </div>

                    {isAdmin && (
                      <>
                        <div className="my-2 border-t border-black/[0.05]" />
                        <Link
                          href="/admin"
                          className="mx-2 flex items-center rounded-full px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-[#f5f2ef]"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="mr-3 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[8px] text-white">
                            A
                          </div>
                          {menuLabels.admin}
                        </Link>
                      </>
                    )}

                    <div className="my-2 border-t border-black/[0.05]" />
                    <button
                      onClick={handleLogout}
                      className="mx-2 flex w-[calc(100%-1rem)] items-center rounded-full px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      {menuLabels.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="hidden sm:block">
                <Button className="eleven-pill-black px-6 transition-transform duration-300 hover:scale-[1.02] hover:bg-black/90">
                  {menuLabels.login}
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full hover:bg-[#f5f2ef] lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={locale === "vi" ? "Mở menu" : "Open menu"}
            >
              <div className="relative h-5 w-5">
                <span
                  className={cn(
                    "absolute left-0 h-0.5 w-full bg-black transition-all duration-300",
                    isMenuOpen ? "top-2.5 rotate-45" : "top-1",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 top-2.5 h-0.5 w-full bg-black transition-opacity duration-300",
                    isMenuOpen ? "opacity-0" : "opacity-100",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 h-0.5 w-full bg-black transition-all duration-300",
                    isMenuOpen ? "top-2.5 -rotate-45" : "top-4",
                  )}
                />
              </div>
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden">
            <nav className="border-t border-black/[0.05] bg-white py-4">
              <div className="space-y-1">
                {navItems.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="mx-2 flex items-center rounded-full px-4 py-3 text-[#4e4e4e] transition-colors hover:bg-[#f5f2ef] hover:text-black"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}

                <div className="my-3 border-t border-black/[0.05]" />

                {isAuthenticated ? (
                  <>
                    <Link
                      href="/account"
                      className="mx-2 flex items-center rounded-full px-4 py-3 text-[#4e4e4e] transition-colors hover:bg-[#f5f2ef] hover:text-black"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="mr-3 h-4 w-4" />
                      <span className="font-medium">{menuLabels.account}</span>
                    </Link>
                    <Link
                      href="/orders"
                      className="mx-2 flex items-center rounded-full px-4 py-3 text-[#4e4e4e] transition-colors hover:bg-[#f5f2ef] hover:text-black"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <ShoppingCart className="mr-3 h-4 w-4" />
                      <span className="font-medium">{menuLabels.orders}</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="mx-2 flex w-[calc(100%-1rem)] items-center rounded-full px-4 py-3 text-left text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span className="font-medium">{menuLabels.logout}</span>
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="mx-2 flex items-center rounded-full px-4 py-3 text-[#4e4e4e] transition-colors hover:bg-[#f5f2ef] hover:text-black"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="mr-3 h-4 w-4" />
                    <span className="font-medium">{menuLabels.login}</span>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
      <HeaderFlashSaleStrip />
    </header>
  );
}

function HeaderFlashSaleStrip() {
  const { locale } = useLanguage();
  const copy = HEADER_FLASH_SALE_COPY[locale];
  const [flashSales, setFlashSales] = useState<FlashSale[]>(
    () => getDemoActiveFlashSales() as FlashSale[],
  );
  const [hasMounted, setHasMounted] = useState(false);

  const featuredSale = useMemo(
    () =>
      [...flashSales].sort(
        (left, right) =>
          (right.discountPercent || 0) - (left.discountPercent || 0),
      )[0],
    [flashSales],
  );
  const timeLeft = useHeaderFlashSaleCountdown(featuredSale?.endTime);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === "test") {
      return;
    }

    let isActive = true;

    flashSaleApi
      .getActiveFlashSales()
      .then((sales) => {
        if (isActive && sales.length > 0) {
          setFlashSales(sales);
        }
      })
      .catch(() => {
        if (isActive) {
          setFlashSales(getDemoActiveFlashSales() as FlashSale[]);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  if (!featuredSale) {
    return null;
  }

  return (
    <div
      data-testid="header-flash-sale-strip"
      className="border-t border-[#eadfce] bg-gradient-to-r from-[#fff8ed] via-[#fffdf7] to-[#f7efe6]"
    >
      <div className="mx-auto flex h-auto min-h-10 w-full max-w-7xl items-center justify-between gap-3 px-4 py-2 text-sm sm:h-11 sm:py-0">
        <Link
          href="/flash-sale"
          className="group flex min-w-0 flex-1 items-center gap-2 text-gray-950"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#b42318] text-white shadow-[rgba(180,35,24,0.18)_0_6px_14px]">
            <Flame className="h-4 w-4 fill-[#fbbf24] text-white" />
          </span>
          <span className="hidden shrink-0 items-center rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#7c2d12] ring-1 ring-[#eadfce] sm:inline-flex">
            {copy.label}
          </span>
          <span className="min-w-0 truncate font-medium">
            {copy.prefix}{" "}
            <span className="font-extrabold text-[#b42318]">
              {featuredSale.discountPercent}%
            </span>
            <span className="hidden text-[#5f554c] md:inline">
              {" "}
              · {featuredSale.product.name}
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-2 text-xs font-semibold text-[#5f554c] md:flex">
          <span className="rounded-full bg-white/75 px-3 py-1 ring-1 ring-[#eadfce]">
            {copy.slot}
          </span>
          <span className="rounded-full bg-white/75 px-3 py-1 font-mono tabular-nums text-[#b42318] ring-1 ring-[#eadfce]">
            {copy.endsIn}{" "}
            {hasMounted ? formatHeaderCountdown(timeLeft) : "--:--:--"}
          </span>
          <span className="rounded-full bg-black px-3 py-1 text-white">
            {formatHeaderPrice(featuredSale.salePrice, locale)}
          </span>
        </div>

        <Link
          href="/flash-sale"
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#1f1a17] px-3 py-1.5 text-xs font-bold text-white shadow-[rgba(31,26,23,0.16)_0_8px_18px] transition-colors hover:bg-[#3a2c25]"
        >
          <Clock className="h-3.5 w-3.5" />
          <span>{copy.cta}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function useHeaderFlashSaleCountdown(endTime?: string) {
  const [timeLeft, setTimeLeft] = useState(() =>
    calculateHeaderCountdown(endTime),
  );

  useEffect(() => {
    setTimeLeft(calculateHeaderCountdown(endTime));

    if (!endTime) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setTimeLeft(calculateHeaderCountdown(endTime));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [endTime]);

  return timeLeft;
}

function calculateHeaderCountdown(endTime?: string) {
  if (!endTime) {
    return 0;
  }

  return Math.max(0, new Date(endTime).getTime() - Date.now());
}

function formatHeaderCountdown(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":");
}

function formatHeaderPrice(amount: number, locale: "vi" | "en") {
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}
