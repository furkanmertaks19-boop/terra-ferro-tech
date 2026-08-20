import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { DEFAULT_LOCALE, isLocale, LOCALE_HEADER, PATHNAME_HEADER, type Locale } from "@/lib/i18n/config";
import { localeFromPathname, toInternalPath } from "@/lib/i18n/routing";

const { auth } = NextAuth(authConfig);

function applyLocaleHeaders(req: Request, locale: Locale, pathname: string, response: NextResponse) {
  response.headers.set(LOCALE_HEADER, locale);
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  void req;
  void pathname;
  return response;
}

export default auth((req) => {
  const user = req.auth?.user;
  const loggedIn = Boolean(user?.id);
  const path = req.nextUrl.pathname;
  const isLoginPage = path === "/admin/login";
  const isChangePassword = path === "/admin/change-password";

  if (path === "/en/admin" || path.startsWith("/en/admin/") || path === "/tr/admin" || path.startsWith("/tr/admin/")) {
    return NextResponse.redirect(new URL(path.replace(/^\/(en|tr)/, ""), req.nextUrl.origin));
  }

  if (path.startsWith("/admin") && !isLoginPage && !loggedIn) {
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin));
  }

  if (loggedIn && user?.mustChangePassword && !isChangePassword && !isLoginPage && path.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/admin/change-password", req.nextUrl.origin));
  }

  if (isLoginPage && loggedIn) {
    const dest = user?.mustChangePassword ? "/admin/change-password" : "/admin";
    return NextResponse.redirect(new URL(dest, req.nextUrl.origin));
  }

  if (isChangePassword && loggedIn && !user?.mustChangePassword) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  }

  if (path.startsWith("/admin") || path.startsWith("/api")) {
    const requestHeaders = new Headers(req.headers);
    const cookieLocale = req.cookies.get("NEXT_LOCALE")?.value;
    const apiLocale = path.startsWith("/api") && isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
    requestHeaders.set(LOCALE_HEADER, path.startsWith("/admin") ? DEFAULT_LOCALE : apiLocale);
    requestHeaders.set(PATHNAME_HEADER, path);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const locale = localeFromPathname(path);
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(LOCALE_HEADER, isLocale(locale) ? locale : DEFAULT_LOCALE);
  requestHeaders.set(PATHNAME_HEADER, path);

  const internal = toInternalPath(path);
  const url = req.nextUrl.clone();
  if (internal && internal !== path) {
    url.pathname = internal;
    url.searchParams.set("_l", locale);
    const response = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    return applyLocaleHeaders(req, locale, path, response);
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  return applyLocaleHeaders(req, locale, path, response);
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm)$).*)"],
};
