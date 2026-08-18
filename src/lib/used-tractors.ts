import { Prisma, UsedTractorDrive, UsedTractorStatus } from "@prisma/client";
import { prisma, withPrismaRetry } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings-data";

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
};

export function usedTractorHref(slug: string) {
  return `${USED_TRACTORS_PATH}/${slug}`;
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
  return {
    ...row,
    specs: (row.specs as Record<string, string>) ?? {},
  };
}

export async function listPublicUsedTractors(): Promise<PublicUsedTractor[]> {
  const rows = await withPrismaRetry(() =>
    prisma.usedTractor.findMany({
      where: { status: { in: PUBLIC_USED_STATUSES } },
      orderBy: [{ status: "asc" }, { sortOrder: "asc" }, { updatedAt: "desc" }],
    }),
  );
  return rows.map(toPublic);
}

export async function getPublicUsedTractorBySlug(slug: string): Promise<PublicUsedTractor | null> {
  const row = await withPrismaRetry(() =>
    prisma.usedTractor.findFirst({
      where: { slug, status: { in: PUBLIC_USED_STATUSES } },
    }),
  );
  return row ? toPublic(row) : null;
}

export async function listSitemapUsedTractors() {
  return withPrismaRetry(() =>
    prisma.usedTractor.findMany({
      where: { status: { in: PUBLIC_USED_STATUSES } },
      select: { slug: true, updatedAt: true },
    }),
  );
}
