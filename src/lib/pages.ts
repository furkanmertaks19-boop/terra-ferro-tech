import { Category, Prisma } from "@prisma/client";
import { prisma, withPrismaRetry } from "@/lib/prisma";
import {
  PAGE_DEFS,
  PAGE_KEYS,
  defaultRevision,
  parseRevision,
  publicPathFor,
  revisionToHero,
  type PageKey,
  type PageRevision,
  type PublicPageContent,
} from "@/lib/page-cms";

export type AdminPageRow = {
  key: PageKey;
  adminTitle: string;
  publicName: string;
  path: string;
  summary: string;
  title: string;
  heroImage: string | null;
  updatedAt: Date | null;
  hasUnpublishedChanges: boolean;
  status: string;
};

function rowToRevision(key: PageKey, row: {
  eyebrow: string;
  title: string;
  description: string;
  heroType: string;
  heroImage: string;
  mobileImage: string | null;
  overlayOpacity: number;
  textPosition: string;
  heroHeight: string;
  slides: unknown;
  config: unknown;
}): PageRevision {
  return parseRevision(key, {
    eyebrow: row.eyebrow,
    title: row.title,
    description: row.description,
    heroType: row.heroType,
    heroImage: row.heroImage,
    mobileImage: row.mobileImage,
    overlayOpacity: row.overlayOpacity,
    textPosition: row.textPosition,
    heroHeight: row.heroHeight,
    slides: row.slides,
    config: row.config,
  });
}

async function categoryHero(category: Category): Promise<Partial<PageRevision> | null> {
  try {
    const row = await prisma.categoryPage.findUnique({ where: { category } });
    if (!row) return null;
    return {
      eyebrow: row.eyebrow,
      title: row.title,
      description: row.subtitle,
      heroImage: row.desktopImage,
      mobileImage: row.mobileImage,
      overlayOpacity: row.overlayOpacity,
      textPosition: row.textPosition === "center" ? "center" : "left",
    };
  } catch {
    return null;
  }
}

export async function ensurePageContents() {
  for (const def of PAGE_DEFS) {
    const existing = await withPrismaRetry(() => prisma.pageContent.findUnique({ where: { pageKey: def.key } })).catch(() => null);
    if (existing) continue;
    const base = defaultRevision(def.key);
    const extra =
      def.key === "tractors"
        ? await categoryHero(Category.TRACTOR)
        : def.key === "equipment"
          ? await categoryHero(Category.EQUIPMENT)
          : null;
    const revision = extra ? { ...base, ...extra, config: base.config } : base;
    await prisma.pageContent.create({
      data: {
        pageKey: def.key,
        eyebrow: revision.eyebrow,
        title: revision.title,
        description: revision.description,
        heroType: revision.heroType,
        heroImage: revision.heroImage,
        mobileImage: revision.mobileImage,
        overlayOpacity: revision.overlayOpacity,
        textPosition: revision.textPosition,
        heroHeight: revision.heroHeight,
        slides: revision.slides as Prisma.InputJsonValue,
        config: revision.config as Prisma.InputJsonValue,
        status: "PUBLISHED",
        hasUnpublishedChanges: false,
      },
    });
  }
}

export async function getPublishedPage(key: PageKey): Promise<PublicPageContent> {
  await ensurePageContents().catch(() => undefined);
  const fallback = defaultRevision(key);
  try {
    const row = await withPrismaRetry(() => prisma.pageContent.findUnique({ where: { pageKey: key } }));
    const revision = row ? rowToRevision(key, row) : fallback;
    return { pageKey: key, ...revisionToHero(revision), config: revision.config };
  } catch {
    return { pageKey: key, ...revisionToHero(fallback), config: fallback.config };
  }
}

export async function getEditorPage(key: PageKey): Promise<{
  revision: PageRevision;
  hasUnpublishedChanges: boolean;
  updatedAt: Date | null;
}> {
  await ensurePageContents().catch(() => undefined);
  const row = await withPrismaRetry(() => prisma.pageContent.findUnique({ where: { pageKey: key } }));
  if (!row) {
    return { revision: defaultRevision(key), hasUnpublishedChanges: false, updatedAt: null };
  }
  const live = rowToRevision(key, row);
  const revision = row.hasUnpublishedChanges && row.draftRevision ? parseRevision(key, row.draftRevision) : live;
  return { revision, hasUnpublishedChanges: row.hasUnpublishedChanges, updatedAt: row.updatedAt };
}

export async function listAdminPages(): Promise<AdminPageRow[]> {
  await ensurePageContents().catch(() => undefined);
  const rows = await withPrismaRetry(() => prisma.pageContent.findMany()).catch(() => []);
  const byKey = new Map(rows.map((row) => [row.pageKey, row]));
  return PAGE_KEYS.map((key) => {
    const def = PAGE_DEFS.find((item) => item.key === key)!;
    const row = byKey.get(key);
    const revision = row ? rowToRevision(key, row) : defaultRevision(key);
    return {
      key,
      adminTitle: def.adminTitle,
      publicName: def.publicName,
      path: def.path,
      summary: def.summary,
      title: revision.title,
      heroImage: revision.heroImage || revision.slides.find((slide) => slide.isActive)?.image || null,
      updatedAt: row?.updatedAt ?? null,
      hasUnpublishedChanges: row?.hasUnpublishedChanges ?? false,
      status: row?.status ?? "PUBLISHED",
    };
  });
}

export { publicPathFor };
