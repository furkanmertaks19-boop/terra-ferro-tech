import { headers } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_HEADER, PATHNAME_HEADER, type Locale } from "./config";

export { LOCALE_HEADER, PATHNAME_HEADER };

export async function getRequestLocale(): Promise<Locale> {
  const value = (await headers()).get(LOCALE_HEADER);
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getRequestPathname(): Promise<string> {
  return (await headers()).get(PATHNAME_HEADER) || "/";
}
