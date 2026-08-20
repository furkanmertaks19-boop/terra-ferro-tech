"use client";

import { createContext, useContext, useMemo } from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { getDictionary, type Messages } from "@/lib/i18n/dictionaries";
import { localeFromPathname } from "@/lib/i18n/routing";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function resolvePublicLocale(pathname: string | null | undefined, serverLocale: Locale = DEFAULT_LOCALE): Locale {
  const path = pathname || "/";
  if (path === "/en" || path.startsWith("/en/") || path === "/tr" || path.startsWith("/tr/")) {
    return localeFromPathname(path);
  }
  return serverLocale;
}

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const pathname = usePathname();
  const resolved = useMemo(() => resolvePublicLocale(pathname, locale), [pathname, locale]);
  return <LocaleContext.Provider value={resolved}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function useT(): Messages {
  return getDictionary(useLocale());
}
