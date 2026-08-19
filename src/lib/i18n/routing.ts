import { DEFAULT_LOCALE, PREFIX_LOCALES, type Locale } from "./config";

export type RouteKey =
  | "home"
  | "about"
  | "tractors"
  | "equipment"
  | "gallery"
  | "services"
  | "contact"
  | "used";

export const STATIC_PATHS: Record<RouteKey, Record<Locale, string>> = {
  home: { sq: "/", en: "/en", tr: "/tr" },
  about: { sq: "/rreth-nesh", en: "/en/about", tr: "/tr/hakkimizda" },
  tractors: { sq: "/traktoret", en: "/en/tractors", tr: "/tr/traktorler" },
  equipment: { sq: "/makineri-bujqesore", en: "/en/agricultural-machinery", tr: "/tr/tarim-makineleri" },
  gallery: { sq: "/galeri", en: "/en/gallery", tr: "/tr/galeri" },
  services: { sq: "/sherbimet", en: "/en/services", tr: "/tr/hizmetler" },
  contact: { sq: "/kontakt", en: "/en/contact", tr: "/tr/iletisim" },
  used: { sq: "/traktore-te-perdorur", en: "/en/used-tractors", tr: "/tr/ikinci-el-traktorler" },
};

const DETAIL_PREFIX: Record<"tractors" | "equipment" | "used", Record<Locale, string>> = {
  tractors: STATIC_PATHS.tractors,
  equipment: STATIC_PATHS.equipment,
  used: STATIC_PATHS.used,
};

export function normalizePath(pathname: string) {
  const raw = (pathname.split("?")[0] || "/").trim() || "/";
  if (raw.length > 1 && raw.endsWith("/")) return raw.slice(0, -1);
  return raw;
}

export function localeFromPathname(pathname: string): Locale {
  const path = normalizePath(pathname);
  if (path === "/en" || path.startsWith("/en/")) return "en";
  if (path === "/tr" || path.startsWith("/tr/")) return "tr";
  return DEFAULT_LOCALE;
}

export function pathFor(key: RouteKey, locale: Locale = DEFAULT_LOCALE) {
  return STATIC_PATHS[key][locale];
}

export function productPath(category: "TRACTOR" | "EQUIPMENT", slug: string, locale: Locale = DEFAULT_LOCALE) {
  const prefix = DETAIL_PREFIX[category === "TRACTOR" ? "tractors" : "equipment"][locale];
  return `${prefix}/${slug}`;
}

export function usedTractorPath(slug: string, locale: Locale = DEFAULT_LOCALE) {
  return `${DETAIL_PREFIX.used[locale]}/${slug}`;
}

export type ParsedAppPath =
  | { kind: "static"; key: RouteKey }
  | { kind: "product"; category: "TRACTOR" | "EQUIPMENT"; slug: string }
  | { kind: "used"; slug: string };

export function parseAppPath(pathname: string): ParsedAppPath {
  const path = normalizePath(pathname);
  const locale = localeFromPathname(path);

  for (const kind of ["used", "tractors", "equipment"] as const) {
    const prefix = normalizePath(DETAIL_PREFIX[kind][locale]);
    if (path.startsWith(`${prefix}/`)) {
      const slug = path.slice(prefix.length + 1);
      if (slug && !slug.includes("/")) {
        if (kind === "used") return { kind: "used", slug };
        return { kind: "product", category: kind === "tractors" ? "TRACTOR" : "EQUIPMENT", slug };
      }
    }
  }

  const entries = Object.entries(STATIC_PATHS) as [RouteKey, Record<Locale, string>][];
  const match = entries.find(([, variants]) => normalizePath(variants[locale]) === path);
  if (match) return { kind: "static", key: match[0] };
  return { kind: "static", key: "home" };
}

export function localizeHref(href: string, locale: Locale): string {
  const parsed = parseAppPath(href);
  if (parsed.kind === "static") return pathFor(parsed.key, locale);
  if (parsed.kind === "product") return productPath(parsed.category, parsed.slug, locale);
  return usedTractorPath(parsed.slug, locale);
}

export function switchLocalePath(pathname: string, locale: Locale, search = "") {
  return `${localizeHref(pathname, locale)}${search}`;
}

export function toInternalPath(pathname: string): string | null {
  const locale = localeFromPathname(pathname);
  if (locale === "sq") return null;
  return localizeHref(pathname, "sq");
}

export function alternatePaths(pathname: string): Record<Locale, string> {
  return {
    sq: localizeHref(pathname, "sq"),
    en: localizeHref(pathname, "en"),
    tr: localizeHref(pathname, "tr"),
  };
}

export function isPrefixedLocalePath(pathname: string) {
  const locale = localeFromPathname(pathname);
  if (!PREFIX_LOCALES.includes(locale as "en" | "tr")) return false;
  return pathname === `/${locale}` || pathname.startsWith(`/${locale}/`);
}
