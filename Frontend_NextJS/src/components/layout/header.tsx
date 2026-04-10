"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { useCartStore } from "@/lib/store";
import { ShoppingCart, User, Menu, Search, X, LogOut, ChevronDown, BookOpen } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

export function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCartStore();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/");
    setIsUserMenuOpen(false);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg shadow-gray-200/50"
          : "bg-white"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="relative w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 group-hover:scale-105 transition-all duration-300">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              BookStore
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {[
              { href: "/", label: "Trang Chủ" },
              { href: "/products", label: "Sản Phẩm" },
              { href: "/categories", label: "Danh Mục" },
              { href: "/about", label: "Giới Thiệu" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium relative overflow-hidden group transition-colors duration-300"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <Link href="/search">
              <Button
                variant="ghost"
                size="icon"
                className="relative group"
              >
                <Search className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </Button>
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative group"
              >
                <ShoppingCart className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-bounce">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Language Switcher */}
            <LanguageSwitcher currentLocale="vi" />

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 hover:bg-blue-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-md">
                    {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-gray-500 transition-transform duration-200",
                    isUserMenuOpen && "rotate-180"
                  )} />
                </Button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl shadow-gray-200/50 border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                      <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        href="/account"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors mx-2 rounded-lg"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-3" />
                        Tài Khoản
                      </Link>
                      <Link
                        href="/orders"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors mx-2 rounded-lg"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-3" />
                        Đơn Hàng
                      </Link>
                    </div>
                    {isAdmin && (
                      <>
                        <div className="border-t border-gray-100 my-2" />
                        <Link
                          href="/admin"
                          className="flex items-center px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors mx-2 rounded-lg font-medium"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="w-4 h-4 mr-3 bg-blue-600 text-white rounded text-[8px] flex items-center justify-center">A</div>
                          Quản Trị
                        </Link>
                      </>
                    )}
                    <div className="border-t border-gray-100 my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors mx-2 rounded-lg"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Đăng Xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 px-6">
                  Đăng Nhập
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden relative"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="relative w-5 h-5">
                <span className={cn(
                  "absolute left-0 w-full h-0.5 bg-gray-600 transition-all duration-300",
                  isMenuOpen ? "rotate-45 top-2.5" : "top-1"
                )} />
                <span className={cn(
                  "absolute left-0 top-2.5 w-full h-0.5 bg-gray-600 transition-opacity duration-300",
                  isMenuOpen ? "opacity-0" : "opacity-100"
                )} />
                <span className={cn(
                  "absolute left-0 w-full h-0.5 bg-gray-600 transition-all duration-300",
                  isMenuOpen ? "-rotate-45 top-2.5" : "top-4"
                )} />
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={cn(
          "lg:hidden overflow-hidden transition-all duration-300",
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}>
          <nav className="py-4 border-t border-gray-100 bg-gradient-to-b from-white to-gray-50/50">
            <div className="space-y-1">
              {[
                { href: "/", label: "Trang Chủ" },
                { href: "/products", label: "Sản Phẩm" },
                { href: "/categories", label: "Danh Mục" },
                { href: "/about", label: "Giới Thiệu" },
              ].map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg mx-2 transition-colors"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="ml-3 font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
