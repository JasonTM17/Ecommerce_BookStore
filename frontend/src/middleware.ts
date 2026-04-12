import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["vi", "en"] as const;
const localeCookieMaxAge = 60 * 60 * 24 * 365;

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  const matchedLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!matchedLocale) {
    return NextResponse.next();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname =
    pathname === `/${matchedLocale}`
      ? "/"
      : pathname.replace(`/${matchedLocale}`, "") || "/";

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set("NEXT_LOCALE", matchedLocale, {
    path: "/",
    maxAge: localeCookieMaxAge,
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|uploads|.*\\..*).*)",
  ],
};
