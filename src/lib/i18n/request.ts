import { headers } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_HEADER, PATHNAME_HEADER, type Locale } from "./config";
import { localeFromPathname } from "./routing";

export { LOCALE_HEADER, PATHNAME_HEADER };

export async function getRequestLocale(): Promise<Locale> {
  const h = await headers();
  const path = h.get(PATHNAME_HEADER);
  if (path && (path === "/en" || path.startsWith("/en/") || path === "/tr" || path.startsWith("/tr/"))) {
    return localeFromPathname(path);
  }
  const value = h.get(LOCALE_HEADER);
  if (isLocale(value)) return value;
  return DEFAULT_LOCALE;
}

export async function getRequestPathname(): Promise<string> {
  return (await headers()).get(PATHNAME_HEADER) || "/";
}
