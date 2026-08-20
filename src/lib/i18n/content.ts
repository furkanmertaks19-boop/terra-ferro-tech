import { CONTENT_LOCALES, localeHasCopy, parseI18nBag, pickLocalizedString, textValue, type ContentLocale, type I18nBag, type Locale } from "./config";
import { foldUi, localizeKnownUi } from "./phrases";

export function looksAlbanian(text: string): boolean {
  const raw = text.trim();
  if (!raw) return false;
  if (/[ëË]/.test(raw)) return true;
  const folded = foldUi(raw);
  return /\b(dhe|juaj|makineri|traktore|traktoret|sherbimet|sherbim|gjej|shiko|rreth nesh|cfare|dergoni|vendndodhja|bujqesore|bujqesor|pemishte|kembimi|kembim|mbeshtetje|ofrojme|ofrojme|prane|ne shqiperi|lushnje|kerkoni|kerko|na shkruani|ekipi yne|foto dhe|gama e produkteve|modelet e zgjedhura|kultivatore|rotovatore|plugje|fuqia qe|pajisjet qe|partneri juaj)\b/.test(
    folded,
  );
}

/** SQ stays in DB; EN/TR prefer bag, then known UI map, then dictionary — never leftover Albanian UI. */
export function pickPublicText(locale: Locale, bag: unknown, db: unknown, dict = ""): string {
  const fromDb = str(db);
  if (locale === "sq") return fromDb || dict;
  const fromBag = str(bag);
  if (fromBag && !looksAlbanian(fromBag)) return fromBag;
  const mapped = localizeKnownUi(fromBag || fromDb, locale);
  if (mapped && !looksAlbanian(mapped)) return mapped;
  if (dict) return dict;
  return fromBag || fromDb;
}

export function str(value: unknown, fallback = "") {
  const next = textValue(value).trim();
  return next || fallback;
}

export function localizeRecord<T extends Record<string, unknown>>(
  locale: Locale,
  record: T,
  keys: readonly string[],
  i18n: unknown = record.i18n,
): T {
  if (locale === "sq") return record;
  const bag = parseI18nBag(i18n)[locale];
  if (!bag) return record;
  const next = { ...record };
  for (const key of keys) {
    const localized = str(bag[key]);
    if (localized) (next as Record<string, unknown>)[key] = localized;
  }
  return next;
}

export function mergeById<T extends { id?: string }>(base: T[], overlay: unknown, keys: readonly (keyof T)[]): T[] {
  if (!Array.isArray(overlay) || overlay.length === 0) return base;
  const map = new Map<string, Record<string, unknown>>();
  for (const item of overlay) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const id = typeof row.id === "string" ? row.id : "";
    if (id) map.set(id, row);
  }
  return base.map((item, index) => {
    const match = (item.id && map.get(item.id)) || (overlay[index] as Record<string, unknown> | undefined);
    if (!match) return item;
    const next = { ...item };
    for (const key of keys) {
      const localized = str(match[key as string]);
      if (localized) (next as Record<string, unknown>)[key as string] = localized;
    }
    return next;
  });
}

export function mergeSpecs(base: Record<string, string>, overlay: unknown): Record<string, string> {
  if (!overlay || typeof overlay !== "object" || Array.isArray(overlay)) return base;
  const next = { ...base };
  const entries = Object.entries(overlay as Record<string, unknown>);
  const values = Object.values(base);
  const keys = Object.keys(base);
  for (const [key, value] of entries) {
    const text = str(value);
    if (!text) continue;
    if (key in next) next[key] = text;
    else {
      const idx = keys.indexOf(key);
      if (idx >= 0) next[keys[idx]] = text;
      else if (typeof overlay === "object") {
        const matchKey = keys.find((_, i) => values[i] !== undefined && i === keys.length);
        void matchKey;
      }
    }
  }
  for (let i = 0; i < keys.length; i++) {
    const overlayVal = str((overlay as Record<string, unknown>)[keys[i]]);
    if (overlayVal) next[keys[i]] = overlayVal;
  }
  return next;
}

export const PAGE_COPY_KEYS = ["eyebrow", "title", "description"] as const;
export const SLIDE_COPY_KEYS = ["eyebrow", "title", "subtitle", "primaryButtonText", "secondaryButtonText"] as const;
export const PRODUCT_COPY_KEYS = [
  "name",
  "fullTitle",
  "series",
  "shortDescription",
  "description",
  "seoTitle",
  "seoDescription",
  "customBadge",
] as const;
export const USED_COPY_KEYS = ["shortDescription", "description", "seoTitle", "seoDescription"] as const;
export const SECTION_COPY_KEYS = ["title", "eyebrow", "body", "ctaLabel"] as const;
export const GALLERY_COPY_KEYS = ["title", "description", "altText"] as const;
export const CATEGORY_COPY_KEYS = ["name"] as const;

export function translationMissing(i18n: unknown, locale: ContentLocale, keys: readonly string[]) {
  return !localeHasCopy(i18n, locale, [...keys]);
}

export function completeness(i18n: unknown, keys: readonly string[]): Record<ContentLocale, boolean> {
  return {
    en: localeHasCopy(i18n, "en", [...keys]),
    tr: localeHasCopy(i18n, "tr", [...keys]),
  };
}

export function asI18nInput(value: unknown): I18nBag {
  return parseI18nBag(value);
}

export function pick(locale: Locale, sq: string | null | undefined, i18n: unknown, key: string) {
  return pickLocalizedString(locale, sq, i18n, key);
}
