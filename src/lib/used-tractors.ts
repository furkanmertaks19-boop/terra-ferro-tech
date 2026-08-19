import { Prisma, UsedTractorDrive, UsedTractorStatus } from "@prisma/client";
import { prisma, withPrismaRetry } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings-data";
import { getRequestLocale } from "@/lib/i18n/request";
import { parseI18nBag, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { str } from "@/lib/i18n/content";
import { usedTractorPath } from "@/lib/i18n/routing";

export const USED_TRACTORS_PATH = "/traktore-te-perdorur";

export const PUBLIC_USED_STATUSES: UsedTractorStatus[] = [
  UsedTractorStatus.FOR_SALE,
  UsedTractorStatus.RESERVED,
  UsedTractorStatus.SOLD,
];

export type PublicUsedTractor = {
  id: string;
  status: UsedTractorStatus;
  brand: string;
  model: string;
  slug: string;
  year: number | null;
  hours: number | null;
  horsePower: number | null;
  fuelType: string | null;
  hasCabin: boolean;
  transmission: string | null;
  drive: UsedTractorDrive | null;
  location: string | null;
  shortDescription: string | null;
  description: string | null;
  specs: Record<string, string>;
  coverImage: string | null;
  images: string[];
  technicalPdfUrl: string | null;
  technicalPdfName: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: Date;
  i18n?: unknown;
};

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

export async function isUsedTractorsEnabled() {
  const settings = await getSiteSettings();
  return settings.usedTractorsEnabled;
}

function toPublic(row: {
  id: string;
  status: UsedTractorStatus;
  brand: string;
  model: string;
  slug: string;
  year: number | null;
  hours: number | null;
  horsePower: number | null;
  fuelType: string | null;
  hasCabin: boolean;
  transmission: string | null;
  drive: UsedTractorDrive | null;
  location: string | null;
  shortDescription: string | null;
  description: string | null;
  specs: Prisma.JsonValue;
  coverImage: string | null;
  images: string[];
  technicalPdfUrl: string | null;
  technicalPdfName: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: Date;
}): PublicUsedTractor {
  const localeCopy = parseI18nBag((row as { i18n?: unknown }).i18n);
  return {
    ...row,
    specs: (row.specs as Record<string, string>) ?? {},
    i18n: localeCopy,
  };
}

function localizeUsed(item: PublicUsedTractor, locale: Locale): PublicUsedTractor {
  if (locale === "sq") return item;
  const copy = parseI18nBag(item.i18n)[locale];
  if (!copy) return item;
  const specs = { ...item.specs };
  if (copy.specs && typeof copy.specs === "object") {
    for (const key of Object.keys(specs)) {
      const next = str((copy.specs as Record<string, unknown>)[key]);
      if (next) specs[key] = next;
    }
  }
  return {
    ...item,
    shortDescription: str(copy.shortDescription) || item.shortDescription,
    description: str(copy.description) || item.description,
    seoTitle: str(copy.seoTitle) || item.seoTitle,
    seoDescription: str(copy.seoDescription) || item.seoDescription,
    specs,
  };
}

export async function listPublicUsedTractors(): Promise<PublicUsedTractor[]> {
  const locale = await getRequestLocale();
  const rows = await withPrismaRetry(() =>
    prisma.usedTractor.findMany({
      where: { status: { in: PUBLIC_USED_STATUSES } },
      orderBy: [{ status: "asc" }, { sortOrder: "asc" }, { updatedAt: "desc" }],
    }),
  );
  return rows.map((row) => localizeUsed(toPublic(row), locale));
}

export async function getPublicUsedTractorBySlug(slug: string): Promise<PublicUsedTractor | null> {
  const locale = await getRequestLocale();
  const row = await withPrismaRetry(() =>
    prisma.usedTractor.findFirst({
      where: { slug, status: { in: PUBLIC_USED_STATUSES } },
    }),
  );
  return row ? localizeUsed(toPublic(row), locale) : null;
}

export async function listSitemapUsedTractors() {
  return withPrismaRetry(() =>
    prisma.usedTractor.findMany({
      where: { status: { in: PUBLIC_USED_STATUSES } },
      select: { slug: true, updatedAt: true },
    }),
  );
}
