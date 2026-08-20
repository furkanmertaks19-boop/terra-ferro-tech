import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { usedTractorPath } from "@/lib/i18n/routing";

export function usedTractorHref(slug: string, locale: Locale = DEFAULT_LOCALE) {
  return usedTractorPath(slug, locale);
}

export function usedTractorLabel(item: { brand: string; model: string }) {
  return `${item.brand} ${item.model}`.replace(/\s+/g, " ").trim();
}

export function usedTractorCover(item: { coverImage: string | null; images: string[] }) {
  return item.coverImage || item.images.find(Boolean) || null;
}

export function usedTractorGallery(item: { coverImage: string | null; images: string[] }) {
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const url of [item.coverImage, ...item.images]) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
  }
  return urls;
}
