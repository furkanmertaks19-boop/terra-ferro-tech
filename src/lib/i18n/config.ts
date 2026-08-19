export const LOCALES = ["sq", "en", "tr"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "sq";
export const CONTENT_LOCALES = ["en", "tr"] as const;
export type ContentLocale = (typeof CONTENT_LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  sq: "Shqip",
  en: "English",
  tr: "Türkçe",
};

export const LOCALE_SHORT: Record<Locale, string> = {
  sq: "SQ",
  en: "EN",
  tr: "TR",
};

export const LOCALE_OG: Record<Locale, string> = {
  sq: "sq_AL",
  en: "en_US",
  tr: "tr_TR",
};

export const LOCALE_HTML: Record<Locale, string> = {
  sq: "sq",
  en: "en",
  tr: "tr",
};

export const PREFIX_LOCALES: ContentLocale[] = ["en", "tr"];
export const LOCALE_HEADER = "x-locale";
export const PATHNAME_HEADER = "x-pathname";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "sq" || value === "en" || value === "tr";
}

export function isContentLocale(value: string | null | undefined): value is ContentLocale {
  return value === "en" || value === "tr";
}

export type I18nBag = Partial<Record<ContentLocale, Record<string, unknown>>>;

export function parseI18nBag(value: unknown): I18nBag {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const raw = value as Record<string, unknown>;
  const bag: I18nBag = {};
  for (const locale of CONTENT_LOCALES) {
    const entry = raw[locale];
    if (entry && typeof entry === "object" && !Array.isArray(entry)) {
      bag[locale] = entry as Record<string, unknown>;
    }
  }
  return bag;
}

export function textValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function pickLocalizedString(locale: Locale, sq: string | null | undefined, i18n: I18nBag | unknown, key: string): string {
  const fallback = sq ?? "";
  if (locale === "sq") return fallback;
  const bag = parseI18nBag(i18n);
  const localized = textValue(bag[locale]?.[key]).trim();
  return localized || fallback;
}

export function pickLocalizedValue<T>(locale: Locale, sq: T, i18n: I18nBag | unknown, key: string): T {
  if (locale === "sq") return sq;
  const bag = parseI18nBag(i18n);
  const localized = bag[locale]?.[key];
  if (localized == null) return sq;
  if (typeof localized === "string") return (localized.trim() ? localized : sq) as T;
  if (Array.isArray(localized) && localized.length > 0) return localized as T;
  if (typeof localized === "object" && Object.keys(localized as object).length > 0) return localized as T;
  return sq;
}

export function localeHasCopy(i18n: I18nBag | unknown, locale: ContentLocale, keys: string[]): boolean {
  const bag = parseI18nBag(i18n)[locale];
  if (!bag) return false;
  return keys.some((key) => textValue(bag[key]).trim().length > 0);
}

export function missingContentLocales(i18n: I18nBag | unknown, keys: string[]): ContentLocale[] {
  return CONTENT_LOCALES.filter((locale) => !localeHasCopy(i18n, locale, keys));
}
