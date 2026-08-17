import { prisma } from "@/lib/prisma";
import { resolveHeroImageMode } from "@/lib/hero-image-mode";
import type { ProductRevision } from "@/lib/product-revision";

export type ProductExtras = {
  technicalPdfUrl: string | null;
  technicalPdfPublicId: string | null;
  technicalPdfName: string | null;
  technicalPdfSize: number | null;
  showTechnicalPdf: boolean;
  heroImageMode: string;
  hasUnpublishedChanges: boolean;
  draftRevision: unknown;
  publishedAt: Date | null;
  referenceUrl: string | null;
  customBadge: string | null;
  customBadgeTone: string | null;
};

function asDate(value: unknown): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function readProductExtras(id: string): Promise<ProductExtras> {
  try {
    const rows = await prisma.$queryRaw<
      Array<{
        technicalPdfUrl: string | null;
        technicalPdfPublicId: string | null;
        technicalPdfName: string | null;
        technicalPdfSize: number | null;
        showTechnicalPdf: boolean;
        heroImageMode: string | null;
        hasUnpublishedChanges: boolean;
        draftRevision: unknown;
        publishedAt: Date | string | null;
        referenceUrl: string | null;
        customBadge: string | null;
        customBadgeTone: string | null;
      }>
    >`
      SELECT
        "technicalPdfUrl",
        "technicalPdfPublicId",
        "technicalPdfName",
        "technicalPdfSize",
        "showTechnicalPdf",
        "heroImageMode",
        "hasUnpublishedChanges",
        "draftRevision",
        "publishedAt",
        "referenceUrl",
        "customBadge",
        "customBadgeTone"
      FROM "Product"
      WHERE "id" = ${id}
      LIMIT 1
    `;
    const row = rows[0];
    return {
      technicalPdfUrl: row?.technicalPdfUrl ?? null,
      technicalPdfPublicId: row?.technicalPdfPublicId ?? null,
      technicalPdfName: row?.technicalPdfName ?? null,
      technicalPdfSize: row?.technicalPdfSize ?? null,
      showTechnicalPdf: Boolean(row?.showTechnicalPdf),
      heroImageMode: resolveHeroImageMode(row?.heroImageMode),
      hasUnpublishedChanges: Boolean(row?.hasUnpublishedChanges),
      draftRevision: row?.draftRevision ?? null,
      publishedAt: asDate(row?.publishedAt),
      referenceUrl: row?.referenceUrl ?? null,
      customBadge: row?.customBadge ?? null,
      customBadgeTone: row?.customBadgeTone ?? null,
    };
  } catch {
    const rows = await prisma.$queryRaw<
      Array<{
        technicalPdfUrl: string | null;
        technicalPdfPublicId: string | null;
        technicalPdfName: string | null;
        technicalPdfSize: number | null;
        showTechnicalPdf: boolean;
        heroImageMode: string | null;
        hasUnpublishedChanges: boolean;
        draftRevision: unknown;
        publishedAt: Date | string | null;
      }>
    >`
      SELECT
        "technicalPdfUrl",
        "technicalPdfPublicId",
        "technicalPdfName",
        "technicalPdfSize",
        "showTechnicalPdf",
        "heroImageMode",
        "hasUnpublishedChanges",
        "draftRevision",
        "publishedAt"
      FROM "Product"
      WHERE "id" = ${id}
      LIMIT 1
    `;
    const row = rows[0];
    return {
      technicalPdfUrl: row?.technicalPdfUrl ?? null,
      technicalPdfPublicId: row?.technicalPdfPublicId ?? null,
      technicalPdfName: row?.technicalPdfName ?? null,
      technicalPdfSize: row?.technicalPdfSize ?? null,
      showTechnicalPdf: Boolean(row?.showTechnicalPdf),
      heroImageMode: resolveHeroImageMode(row?.heroImageMode),
      hasUnpublishedChanges: Boolean(row?.hasUnpublishedChanges),
      draftRevision: row?.draftRevision ?? null,
      publishedAt: asDate(row?.publishedAt),
      referenceUrl: null,
      customBadge: null,
      customBadgeTone: null,
    };
  }
}

export async function attachProductExtras<T extends { id: string }>(product: T): Promise<T & ProductExtras> {
  const extras = await readProductExtras(product.id);
  return { ...product, ...extras };
}

export async function writePublishMeta(
  id: string,
  meta: {
    heroImageMode: string;
    hasUnpublishedChanges: boolean;
    draftRevision: ProductRevision | null;
    publishedAt: Date | null;
  }
) {
  const json = meta.draftRevision ? JSON.stringify(meta.draftRevision) : null;
  await prisma.$executeRaw`
    UPDATE "Product"
    SET
      "heroImageMode" = ${meta.heroImageMode},
      "hasUnpublishedChanges" = CAST(${meta.hasUnpublishedChanges} AS BOOLEAN),
      "draftRevision" = CAST(${json} AS JSONB),
      "publishedAt" = ${meta.publishedAt}
    WHERE "id" = ${id}
  `;
}
