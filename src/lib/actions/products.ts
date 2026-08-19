"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/format";
import { requireContentAccess, requireAdminAccess } from "@/lib/authz";
import { plainText } from "@/lib/sanitize";
import { Category, Prisma, ProductStatus, Theme } from "@prisma/client";
import { productHref } from "@/lib/product-path";
import { defaultTemplateFor, isProductTemplateId } from "@/lib/templates";
import { groupsToSpecs, type ContentBlock, type SpecGroup } from "@/lib/admin-content";
import { destroyCloudinaryAsset } from "@/lib/cloudinary";
import { resolveHeroImageMode } from "@/lib/hero-image-mode";
import { readProductExtras, writePublishMeta } from "@/lib/product-extras";
import {
  contentFingerprint,
  parseDraftRevision,
  type ProductRevision,
} from "@/lib/product-revision";

const saveSchema = z.object({
  id: z.string().nullable().optional(),
  category: z.enum(Category),
  template: z.string().min(1),
  series: z.string().min(1),
  subcategory: z.string().nullable().optional(),
  name: z.string().min(1),
  fullTitle: z.string().min(1),
  stage: z.string().nullable().optional(),
  horsePower: z.number().nullable().optional(),
  hasCabin: z.boolean().optional(),
  dealerPrice: z.number().min(0).optional(),
  retailPrice: z.number().min(0).optional(),
  featured: z.boolean().optional(),
  showPriceOnSite: z.boolean().optional(),
  isCampaign: z.boolean().optional(),
  isNew: z.boolean().optional(),
  shortDescription: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  slug: z.string().min(1),
  images: z.array(z.string()),
  imageAlts: z.record(z.string(), z.string()).optional(),
  specGroups: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      rows: z.array(z.object({ id: z.string(), key: z.string(), value: z.string() })),
    })
  ),
  contentBlocks: z.array(z.any()).optional(),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  technicalPdfUrl: z.string().nullable().optional(),
  technicalPdfPublicId: z.string().nullable().optional(),
  technicalPdfName: z.string().nullable().optional(),
  technicalPdfSize: z.number().int().nonnegative().nullable().optional(),
  showTechnicalPdf: z.boolean().optional(),
  customBadge: z.string().nullable().optional(),
  customBadgeTone: z.string().nullable().optional(),
  heroImageMode: z.string().optional(),
  referenceUrl: z.string().nullable().optional(),
  i18n: z.any().optional(),
});

export type ProductSaveInput = z.infer<typeof saveSchema>;
export type SaveResult =
  | { ok: true; id: string; slug: string; status: ProductStatus; hasUnpublishedChanges: boolean }
  | { ok: false; error: string; field?: string };


function revalidateCatalog(slug: string, category: Category) {
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/traktoret");
  revalidatePath("/makineri-bujqesore");
  revalidatePath(productHref({ category, slug }));
  revalidatePath(`/produkte/${slug}`);
  revalidatePath("/");
  revalidatePath("/", "layout");
}

async function destroyUnusedPdf(publicId: string | null | undefined) {
  if (!publicId) return;
  const rows = await prisma.$queryRaw<Array<{ count: number | bigint }>>`
    SELECT COUNT(*)::int AS count FROM "Product" WHERE "technicalPdfPublicId" = ${publicId}
  `;
  if (Number(rows[0]?.count ?? 0) === 0) await destroyCloudinaryAsset(publicId, "raw");
}

type TechnicalPdfWrite = {
  technicalPdfUrl: string | null;
  technicalPdfPublicId: string | null;
  technicalPdfName: string | null;
  technicalPdfSize: number | null;
  showTechnicalPdf: boolean;
};

function pdfFromParsed(parsed: ProductSaveInput): TechnicalPdfWrite {
  const url = parsed.technicalPdfUrl?.trim() || null;
  return {
    technicalPdfUrl: url,
    technicalPdfPublicId: url ? parsed.technicalPdfPublicId?.trim() || null : null,
    technicalPdfName: url ? parsed.technicalPdfName?.trim() || null : null,
    technicalPdfSize: url ? parsed.technicalPdfSize ?? null : null,
    showTechnicalPdf: Boolean(url) && (parsed.showTechnicalPdf ?? true),
  };
}

async function readPdfPublicId(id: string): Promise<string | null> {
  const rows = await prisma.$queryRaw<Array<{ technicalPdfPublicId: string | null }>>`
    SELECT "technicalPdfPublicId" FROM "Product" WHERE "id" = ${id} LIMIT 1
  `;
  return rows[0]?.technicalPdfPublicId ?? null;
}

async function writeTechnicalPdf(id: string, pdf: TechnicalPdfWrite) {
  await prisma.$executeRaw`
    UPDATE "Product"
    SET
      "technicalPdfUrl" = ${pdf.technicalPdfUrl},
      "technicalPdfPublicId" = ${pdf.technicalPdfPublicId},
      "technicalPdfName" = ${pdf.technicalPdfName},
      "technicalPdfSize" = ${pdf.technicalPdfSize},
      "showTechnicalPdf" = CAST(${pdf.showTechnicalPdf} AS BOOLEAN)
    WHERE "id" = ${id}
  `;
}

async function writeBadgeMeta(
  id: string,
  meta: { isNew: boolean; isCampaign: boolean; customBadge: string | null; customBadgeTone: string | null }
) {
  try {
    await prisma.$executeRaw`
      UPDATE "Product"
      SET
        "isNew" = CAST(${meta.isNew} AS BOOLEAN),
        "isCampaign" = CAST(${meta.isCampaign} AS BOOLEAN),
        "customBadge" = ${meta.customBadge},
        "customBadgeTone" = ${meta.customBadgeTone}
      WHERE "id" = ${id}
    `;
  } catch {
    await prisma.$executeRaw`
      UPDATE "Product"
      SET
        "isNew" = CAST(${meta.isNew} AS BOOLEAN),
        "isCampaign" = CAST(${meta.isCampaign} AS BOOLEAN)
      WHERE "id" = ${id}
    `;
  }
}

async function writeReferenceUrl(id: string, referenceUrl: string | null | undefined) {
  const value = referenceUrl?.trim() || null;
  await prisma.$executeRaw`
    UPDATE "Product"
    SET "referenceUrl" = ${value}
    WHERE "id" = ${id}
  `;
}

function badgeMetaOf(parsed: ProductSaveInput) {
  const label = parsed.customBadge ? plainText(parsed.customBadge, 28) : null;
  return {
    isNew: parsed.isNew ?? false,
    isCampaign: parsed.isCampaign ?? false,
    customBadge: label,
    customBadgeTone: label ? parsed.customBadgeTone?.trim() || "red" : null,
  };
}

function templateOf(parsed: ProductSaveInput) {
  return isProductTemplateId(parsed.template) ? parsed.template : defaultTemplateFor(parsed.category);
}

function toLiveData(parsed: ProductSaveInput) {
  const template = templateOf(parsed);
  const specs = groupsToSpecs(parsed.specGroups as SpecGroup[]);
  return {
    category: parsed.category,
    theme: parsed.category === Category.TRACTOR ? Theme.TRACTOR_THEME : Theme.EQUIPMENT_THEME,
    template,
    series: parsed.series,
    subcategory: parsed.subcategory || null,
    name: parsed.name,
    fullTitle: parsed.fullTitle,
    stage: parsed.stage || null,
    horsePower: parsed.horsePower ?? null,
    hasCabin: parsed.hasCabin ?? false,
    featured: parsed.featured ?? false,
    isCampaign: parsed.isCampaign ?? false,
    isNew: parsed.isNew ?? false,
    shortDescription: parsed.shortDescription || null,
    description: parsed.description || null,
    coverImage: parsed.coverImage?.trim() || parsed.images.find((src) => src.trim() && !src.startsWith("blob:")) || null,
    slug: slugify(parsed.slug),
    specs,
    specGroups: parsed.specGroups,
    contentBlocks: (parsed.contentBlocks as ContentBlock[]) ?? [],
    imageAlts: parsed.imageAlts ?? {},
    images: parsed.images.filter((src) => src.trim() && !src.startsWith("blob:")),
    seoTitle: parsed.seoTitle || null,
    seoDescription: parsed.seoDescription || null,
    heroImageMode: resolveHeroImageMode(parsed.heroImageMode),
    i18n: parsed.i18n ?? {},
  };
}

function prismaCore(data: ReturnType<typeof toLiveData>) {
  const { heroImageMode: _heroImageMode, ...core } = data;
  void _heroImageMode;
  return core;
}

async function nextSortOrder(category: Category) {
  const last = await prisma.product.aggregate({
    where: { category },
    _max: { sortOrder: true },
  });
  return (last._max.sortOrder ?? -1) + 1;
}

function toRevision(parsed: ProductSaveInput, pdf: TechnicalPdfWrite): ProductRevision {
  const live = toLiveData(parsed);
  return {
    category: live.category,
    template: live.template,
    series: live.series,
    subcategory: live.subcategory,
    name: live.name,
    fullTitle: live.fullTitle,
    stage: live.stage,
    horsePower: live.horsePower,
    hasCabin: live.hasCabin,
    featured: live.featured,
    isCampaign: live.isCampaign,
    isNew: live.isNew,
    customBadge: parsed.customBadge?.trim() || null,
    customBadgeTone: parsed.customBadge?.trim() ? parsed.customBadgeTone?.trim() || "red" : null,
    shortDescription: live.shortDescription,
    description: live.description,
    coverImage: live.coverImage,
    slug: live.slug,
    images: live.images,
    imageAlts: live.imageAlts as Record<string, string>,
    specGroups: parsed.specGroups as SpecGroup[],
    specs: live.specs,
    contentBlocks: live.contentBlocks,
    seoTitle: live.seoTitle,
    seoDescription: live.seoDescription,
    ...pdf,
    heroImageMode: live.heroImageMode,
  };
}

function liveContentFingerprint(row: {
  template: string;
  series: string;
  subcategory: string | null;
  name: string;
  fullTitle: string;
  stage: string | null;
  horsePower: number | null;
  hasCabin: boolean;
  shortDescription: string | null;
  description: string | null;
  coverImage: string | null;
  slug: string;
  images: string[];
  imageAlts: unknown;
  specGroups: unknown;
  contentBlocks: unknown;
  seoTitle: string | null;
  seoDescription: string | null;
  technicalPdfUrl?: string | null;
  heroImageMode: string;
}) {
  return contentFingerprint({
    template: row.template,
    series: row.series,
    subcategory: row.subcategory,
    name: row.name,
    fullTitle: row.fullTitle,
    stage: row.stage,
    horsePower: row.horsePower,
    hasCabin: row.hasCabin,
    shortDescription: row.shortDescription,
    description: row.description,
    coverImage: row.coverImage,
    slug: row.slug,
    images: row.images,
    imageAlts: (row.imageAlts as Record<string, string>) ?? {},
    specGroups: row.specGroups,
    contentBlocks: row.contentBlocks,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    technicalPdfUrl: row.technicalPdfUrl ?? null,
    heroImageMode: row.heroImageMode,
  });
}

async function assertSlugFree(slug: string, id?: string | null) {
  const existing = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
  if (existing && existing.id !== id) {
    return { ok: false as const, error: "Slug zaten kullanılıyor.", field: "slug" };
  }
  return { ok: true as const };
}

function parseInput(input: ProductSaveInput): { ok: false; error: string; field?: string } | { ok: true; data: ProductSaveInput } {
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue?.message ?? "Geçersiz form", field: String(issue?.path[0] ?? "") };
  }
  return { ok: true, data: parsed.data };
}

export async function saveProduct(input: ProductSaveInput): Promise<SaveResult> {
  await requireContentAccess();
  const parsed = parseInput(input);
  if (!parsed.ok) return parsed;
  const data = toLiveData(parsed.data);
  const pdf = pdfFromParsed(parsed.data);
  const revision = toRevision(parsed.data, pdf);

  if (!parsed.data.id) {
    const slugCheck = await assertSlugFree(data.slug);
    if (!slugCheck.ok) return slugCheck;
    const row = await prisma.product.create({
      data: {
        ...prismaCore(data),
        status: ProductStatus.DRAFT,
        dealerPrice: 0,
        retailPrice: 0,
        showPriceOnSite: false,
        sortOrder: await nextSortOrder(data.category),
      },
    });
    await writeTechnicalPdf(row.id, pdf);
    await writeReferenceUrl(row.id, parsed.data.referenceUrl);
    await writeBadgeMeta(row.id, badgeMetaOf(parsed.data));
    await writePublishMeta(row.id, {
      heroImageMode: data.heroImageMode,
      hasUnpublishedChanges: false,
      draftRevision: null,
      publishedAt: null,
    });
    revalidatePath("/admin/products");
    revalidatePath("/admin");
    return { ok: true, id: row.id, slug: row.slug, status: ProductStatus.DRAFT, hasUnpublishedChanges: false };
  }

  const current = await prisma.product.findUnique({ where: { id: parsed.data.id } });
  if (!current) return { ok: false, error: "Ürün bulunamadı." };

  if (current.status !== ProductStatus.PUBLISHED) {
    const slugCheck = await assertSlugFree(data.slug, current.id);
    if (!slugCheck.ok) return slugCheck;
    const extras = await readProductExtras(current.id);
    const previousPublicId = extras.technicalPdfPublicId;
    const row = await prisma.product.update({
      where: { id: current.id },
      data: {
        ...prismaCore(data),
        status: current.status,
      },
    });
    await writeTechnicalPdf(row.id, pdf);
    await writeReferenceUrl(row.id, parsed.data.referenceUrl);
    await writeBadgeMeta(row.id, badgeMetaOf(parsed.data));
    await writePublishMeta(row.id, {
      heroImageMode: data.heroImageMode,
      hasUnpublishedChanges: false,
      draftRevision: null,
      publishedAt: extras.publishedAt,
    });
    if (previousPublicId && previousPublicId !== pdf.technicalPdfPublicId) {
      await destroyUnusedPdf(previousPublicId);
    }
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${row.id}`);
    revalidatePath(`/admin/preview/product/${row.id}`);
    return { ok: true, id: row.id, slug: row.slug, status: row.status, hasUnpublishedChanges: false };
  }

  const extras = await readProductExtras(current.id);
  const incomingPrint = liveContentFingerprint({ ...data, technicalPdfUrl: pdf.technicalPdfUrl });
  const livePrint = liveContentFingerprint({
    ...current,
    technicalPdfUrl: extras.technicalPdfUrl,
    heroImageMode: extras.heroImageMode,
  });
  const hasUnpublishedChanges = incomingPrint !== livePrint;

  await prisma.product.update({
    where: { id: current.id },
    data: {
      featured: data.featured,
      isNew: data.isNew,
      isCampaign: data.isCampaign,
    },
  });
  await writeReferenceUrl(current.id, parsed.data.referenceUrl);
  await writeBadgeMeta(current.id, badgeMetaOf(parsed.data));
  await writePublishMeta(current.id, {
    heroImageMode: extras.heroImageMode,
    hasUnpublishedChanges,
    draftRevision: hasUnpublishedChanges ? revision : null,
    publishedAt: extras.publishedAt,
  });

  revalidateCatalog(current.slug, current.category);
  revalidatePath(`/admin/products/${current.id}`);
  revalidatePath(`/admin/preview/product/${current.id}`);
  return {
    ok: true,
    id: current.id,
    slug: hasUnpublishedChanges ? revision.slug : current.slug,
    status: ProductStatus.PUBLISHED,
    hasUnpublishedChanges,
  };
}

export async function publishProduct(input: ProductSaveInput): Promise<SaveResult> {
  await requireAdminAccess();
  const parsed = parseInput(input);
  if (!parsed.ok) return parsed;
  const data = toLiveData(parsed.data);
  const pdf = pdfFromParsed(parsed.data);
  const slugCheck = await assertSlugFree(data.slug, parsed.data.id);
  if (!slugCheck.ok) return slugCheck;

  if (!parsed.data.id) {
    const row = await prisma.product.create({
      data: {
        ...prismaCore(data),
        status: ProductStatus.PUBLISHED,
        dealerPrice: 0,
        retailPrice: 0,
        showPriceOnSite: false,
        sortOrder: await nextSortOrder(data.category),
      },
    });
    await writeTechnicalPdf(row.id, pdf);
    await writeReferenceUrl(row.id, parsed.data.referenceUrl);
    await writeBadgeMeta(row.id, badgeMetaOf(parsed.data));
    await writePublishMeta(row.id, {
      heroImageMode: data.heroImageMode,
      hasUnpublishedChanges: false,
      draftRevision: null,
      publishedAt: new Date(),
    });
    revalidateCatalog(row.slug, row.category);
    return { ok: true, id: row.id, slug: row.slug, status: ProductStatus.PUBLISHED, hasUnpublishedChanges: false };
  }

  const extras = await readProductExtras(parsed.data.id);
  const previousPublicId = extras.technicalPdfPublicId;
  const previous = await prisma.product.findUnique({ where: { id: parsed.data.id }, select: { slug: true, category: true } });
  const row = await prisma.product.update({
    where: { id: parsed.data.id },
    data: {
      ...prismaCore(data),
      status: ProductStatus.PUBLISHED,
    },
  });
  await writeTechnicalPdf(row.id, pdf);
  await writeReferenceUrl(row.id, parsed.data.referenceUrl);
  await writeBadgeMeta(row.id, badgeMetaOf(parsed.data));
  await writePublishMeta(row.id, {
    heroImageMode: data.heroImageMode,
    hasUnpublishedChanges: false,
    draftRevision: null,
    publishedAt: new Date(),
  });
  if (previousPublicId && previousPublicId !== pdf.technicalPdfPublicId) {
    await destroyUnusedPdf(previousPublicId);
  }
  if (previous && previous.slug !== row.slug) revalidateCatalog(previous.slug, previous.category);
  revalidateCatalog(row.slug, row.category);
  revalidatePath(`/admin/products/${row.id}`);
  revalidatePath(`/admin/preview/product/${row.id}`);
  return { ok: true, id: row.id, slug: row.slug, status: ProductStatus.PUBLISHED, hasUnpublishedChanges: false };
}

export async function unpublishProduct(id: string): Promise<SaveResult> {
  await requireAdminAccess();
  const current = await prisma.product.findUnique({ where: { id } });
  if (!current) return { ok: false, error: "Ürün bulunamadı." };
  const extras = await readProductExtras(id);
  const revision = extras.hasUnpublishedChanges ? parseDraftRevision(extras.draftRevision) : null;
  const live = revision
    ? toLiveData({
        id: current.id,
        category: revision.category,
        template: revision.template,
        series: revision.series,
        subcategory: revision.subcategory,
        name: revision.name,
        fullTitle: revision.fullTitle,
        stage: revision.stage,
        horsePower: revision.horsePower,
        hasCabin: revision.hasCabin,
        featured: revision.featured,
        isCampaign: revision.isCampaign,
        isNew: revision.isNew,
        shortDescription: revision.shortDescription,
        description: revision.description,
        coverImage: revision.coverImage,
        slug: revision.slug,
        images: revision.images,
        imageAlts: revision.imageAlts,
        specGroups: revision.specGroups,
        contentBlocks: revision.contentBlocks,
        seoTitle: revision.seoTitle,
        seoDescription: revision.seoDescription,
        technicalPdfUrl: revision.technicalPdfUrl,
        technicalPdfPublicId: revision.technicalPdfPublicId,
        technicalPdfName: revision.technicalPdfName,
        technicalPdfSize: revision.technicalPdfSize,
        showTechnicalPdf: revision.showTechnicalPdf,
        heroImageMode: revision.heroImageMode,
      })
    : null;
  const row = await prisma.product.update({
    where: { id },
    data: {
      ...(live ? prismaCore(live) : {}),
      status: ProductStatus.DRAFT,
    },
  });
  if (revision) {
    await writeTechnicalPdf(row.id, {
      technicalPdfUrl: revision.technicalPdfUrl,
      technicalPdfPublicId: revision.technicalPdfPublicId,
      technicalPdfName: revision.technicalPdfName,
      technicalPdfSize: revision.technicalPdfSize,
      showTechnicalPdf: revision.showTechnicalPdf,
    });
  }
  await writePublishMeta(row.id, {
    heroImageMode: live?.heroImageMode ?? extras.heroImageMode,
    hasUnpublishedChanges: false,
    draftRevision: null,
    publishedAt: extras.publishedAt,
  });
  revalidateCatalog(current.slug, current.category);
  revalidateCatalog(row.slug, row.category);
  return { ok: true, id: row.id, slug: row.slug, status: ProductStatus.DRAFT, hasUnpublishedChanges: false };
}

export async function archiveProduct(id: string): Promise<SaveResult> {
  await requireAdminAccess();
  const current = await prisma.product.findUnique({ where: { id } });
  if (!current) return { ok: false, error: "Ürün bulunamadı." };
  const row = await prisma.product.update({
    where: { id },
    data: { status: ProductStatus.ARCHIVED },
  });
  revalidateCatalog(row.slug, row.category);
  const extras = await readProductExtras(row.id);
  return { ok: true, id: row.id, slug: row.slug, status: ProductStatus.ARCHIVED, hasUnpublishedChanges: extras.hasUnpublishedChanges };
}

export async function deleteProduct(id: string) {
  await requireAdminAccess();
  const publicId = await readPdfPublicId(id);
  const current = await prisma.product.findUnique({ where: { id }, select: { slug: true, category: true } });
  await prisma.product.delete({ where: { id } });
  await destroyUnusedPdf(publicId);
  if (current) revalidateCatalog(current.slug, current.category);
}

export async function duplicateProduct(id: string) {
  await requireContentAccess();
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new Error("Ürün bulunamadı");
  const copy = await prisma.product.create({
    data: {
      category: product.category,
      theme: product.theme,
      template: product.template,
      status: ProductStatus.DRAFT,
      featured: product.featured,
      series: product.series,
      subcategory: product.subcategory,
      name: `${product.name} kopya`,
      fullTitle: product.fullTitle,
      stage: product.stage,
      horsePower: product.horsePower,
      hasCabin: product.hasCabin,
      dealerPrice: product.dealerPrice,
      retailPrice: product.retailPrice,
      isCampaign: product.isCampaign,
      isNew: product.isNew,
      showPriceOnSite: product.showPriceOnSite,
      shortDescription: product.shortDescription,
      description: product.description,
      specs: (product.specs ?? {}) as Prisma.InputJsonValue,
      specGroups: product.specGroups === null ? Prisma.JsonNull : (product.specGroups as Prisma.InputJsonValue),
      contentBlocks: (product.contentBlocks ?? []) as Prisma.InputJsonValue,
      imageAlts: (product.imageAlts ?? {}) as Prisma.InputJsonValue,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
      coverImage: product.coverImage,
      images: product.images,
      slug: `${product.slug}-kopya-${Date.now().toString().slice(-4)}`,
      sortOrder: await nextSortOrder(product.category),
    },
  });
  const extras = await readProductExtras(id);
  await writePublishMeta(copy.id, {
    heroImageMode: extras.heroImageMode,
    hasUnpublishedChanges: false,
    draftRevision: null,
    publishedAt: null,
  });
  if (extras.technicalPdfUrl) {
    await writeTechnicalPdf(copy.id, {
      technicalPdfUrl: extras.technicalPdfUrl,
      technicalPdfPublicId: extras.technicalPdfPublicId,
      technicalPdfName: extras.technicalPdfName,
      technicalPdfSize: extras.technicalPdfSize,
      showTechnicalPdf: Boolean(extras.showTechnicalPdf),
    });
  }
  await writeReferenceUrl(copy.id, extras.referenceUrl);
  await writeBadgeMeta(copy.id, {
    isNew: product.isNew,
    isCampaign: product.isCampaign,
    customBadge: extras.customBadge,
    customBadgeTone: extras.customBadgeTone,
  });
  revalidatePath("/admin/products");
  return copy.id;
}

export async function bulkUpdateProducts(ids: string[], data: { status?: ProductStatus; category?: Category; template?: string }) {
  await requireAdminAccess();
  await prisma.product.updateMany({ where: { id: { in: ids } }, data });
  if (data.status === ProductStatus.PUBLISHED) {
    const publishedAt = new Date();
    await Promise.all(
      ids.map(async (id) => {
        const extras = await readProductExtras(id);
        await writePublishMeta(id, {
          heroImageMode: extras.heroImageMode,
          hasUnpublishedChanges: false,
          draftRevision: null,
          publishedAt,
        });
      })
    );
  }
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidatePath("/traktoret");
  revalidatePath("/makineri-bujqesore");
  revalidatePath("/");
}

export async function bulkDeleteProducts(ids: string[]) {
  await requireAdminAccess();
  const publicIds = (
    await Promise.all(ids.map((id) => readPdfPublicId(id)))
  ).filter((id): id is string => Boolean(id));
  await prisma.product.deleteMany({ where: { id: { in: ids } } });
  await Promise.all(publicIds.map((publicId) => destroyUnusedPdf(publicId)));
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidatePath("/traktoret");
  revalidatePath("/makineri-bujqesore");
}

export async function reorderProducts(category: Category, ids: string[]) {
  await requireContentAccess();
  if (ids.length === 0) return;
  const unique = Array.from(new Set(ids));
  const owned = await prisma.product.findMany({
    where: { category, id: { in: unique } },
    select: { id: true },
  });
  if (owned.length !== unique.length) {
    throw new Error("Sıralama yalnızca aynı kategori içinde yapılabilir.");
  }
  const rest = await prisma.product.findMany({
    where: { category, id: { notIn: unique } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true },
  });
  const ordered = [...unique, ...rest.map((row) => row.id)];
  await prisma.$transaction(ordered.map((id, sortOrder) => prisma.product.update({ where: { id }, data: { sortOrder } })));
  revalidatePath("/admin/products");
  revalidatePath("/traktoret");
  revalidatePath("/makineri-bujqesore");
  revalidatePath("/");
}
