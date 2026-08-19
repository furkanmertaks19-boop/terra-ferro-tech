import { randomUUID } from "crypto";
import { prisma, withPrismaRetry } from "@/lib/prisma";
import { publicGalleryThumb } from "@/lib/cloudinary-media";
import { getRequestLocale } from "@/lib/i18n/request";
import { parseI18nBag } from "@/lib/i18n/config";
import { str } from "@/lib/i18n/content";

export type PublicGalleryCategory = {
  id: string;
  name: string;
  slug: string;
};

export type PublicGalleryItem = {
  id: string;
  type: "IMAGE" | "VIDEO";
  title: string | null;
  description: string | null;
  altText: string | null;
  mediaUrl: string;
  thumbnailUrl: string;
  categoryId: string | null;
  category: PublicGalleryCategory | null;
  sortOrder: number;
};

export type AdminGalleryCategory = PublicGalleryCategory & { sortOrder: number };

export type AdminGalleryItem = {
  id: string;
  type: "IMAGE" | "VIDEO";
  title: string | null;
  description: string | null;
  categoryId: string | null;
  category: PublicGalleryCategory | null;
  mediaUrl: string;
  publicId: string | null;
  thumbnailUrl: string | null;
  posterPublicId: string | null;
  altText: string | null;
  sortOrder: number;
  isPublished: boolean;
};

type GalleryRow = {
  id: string;
  type: "IMAGE" | "VIDEO";
  title: string | null;
  description: string | null;
  altText: string | null;
  mediaUrl: string;
  publicId: string | null;
  thumbnailUrl: string | null;
  posterPublicId: string | null;
  categoryId: string | null;
  sortOrder: number;
  isPublished: boolean;
  catId: string | null;
  catName: string | null;
  catSlug: string | null;
  i18n?: unknown;
  catI18n?: unknown;
};

function newId() {
  return `c${randomUUID().replace(/-/g, "").slice(0, 24)}`;
}

function mapRow(row: GalleryRow): AdminGalleryItem {
  return {
    id: row.id,
    type: row.type === "VIDEO" ? "VIDEO" : "IMAGE",
    title: row.title,
    description: row.description,
    altText: row.altText,
    mediaUrl: row.mediaUrl,
    publicId: row.publicId,
    thumbnailUrl: row.thumbnailUrl,
    posterPublicId: row.posterPublicId,
    categoryId: row.categoryId,
    category: row.catId && row.catName && row.catSlug ? { id: row.catId, name: row.catName, slug: row.catSlug } : null,
    sortOrder: row.sortOrder,
    isPublished: Boolean(row.isPublished),
  };
}

function mapPublic(row: GalleryRow, locale: "sq" | "en" | "tr" = "sq"): PublicGalleryItem {
  const item = mapRow(row);
  const copy = locale === "sq" ? {} : parseI18nBag(row.i18n)[locale] ?? {};
  const catCopy = locale === "sq" ? {} : parseI18nBag(row.catI18n)[locale] ?? {};
  return {
    id: item.id,
    type: item.type,
    title: str(copy.title) || item.title,
    description: str(copy.description) || item.description,
    altText: str(copy.altText) || item.altText,
    mediaUrl: item.mediaUrl,
    thumbnailUrl: publicGalleryThumb(item),
    categoryId: item.categoryId,
    category: item.category
      ? { ...item.category, name: str(catCopy.name, item.category.name) }
      : null,
    sortOrder: item.sortOrder,
  };
}

export async function getGalleryCategories() {
  try {
    const rows = await withPrismaRetry(() =>
      prisma.$queryRaw<Array<{ id: string; name: string; slug: string; sortOrder: number; count: number | bigint }>>`
        SELECT
          c.id, c.name, c.slug, c."sortOrder",
          (
            SELECT COUNT(*)::int FROM "GalleryItem" i
            WHERE i."categoryId" = c.id AND i."isPublished" = TRUE
          ) AS count
        FROM "GalleryCategory" c
        ORDER BY c."sortOrder" ASC
      `
    );
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      sortOrder: row.sortOrder,
      _count: { items: Number(row.count ?? 0) },
    }));
  } catch {
    return [];
  }
}

export async function getPublishedGalleryItems(): Promise<PublicGalleryItem[]> {
  try {
    const rows = await withPrismaRetry(() =>
      prisma.$queryRaw<GalleryRow[]>`
        SELECT
          i.id, i.type, i.title, i.description, i."altText", i."mediaUrl", i."publicId",
          i."thumbnailUrl", i."posterPublicId", i."categoryId", i."sortOrder", i."isPublished",
          i.i18n,
          c.id AS "catId", c.name AS "catName", c.slug AS "catSlug", c.i18n AS "catI18n"
        FROM "GalleryItem" i
        LEFT JOIN "GalleryCategory" c ON c.id = i."categoryId"
        WHERE i."isPublished" = TRUE
        ORDER BY i."sortOrder" ASC, i."createdAt" DESC
      `
    );
    return rows.map((row) => mapPublic(row, await getRequestLocale()));
  } catch {
    return [];
  }
}

export async function getPublishedGalleryPreview(take = 6, ids?: string[]): Promise<PublicGalleryItem[]> {
  const items = await getPublishedGalleryItems();
  if (ids?.length) {
    const byId = Object.fromEntries(items.map((item) => [item.id, item]));
    return ids.map((id) => byId[id]).filter(Boolean).slice(0, take);
  }
  return items.slice(0, take);
}

export async function getAdminGallery() {
  try {
    const [itemRows, categoryRows] = await Promise.all([
      withPrismaRetry(() =>
        prisma.$queryRaw<GalleryRow[]>`
          SELECT
            i.id, i.type, i.title, i.description, i."altText", i."mediaUrl", i."publicId",
            i."thumbnailUrl", i."posterPublicId", i."categoryId", i."sortOrder", i."isPublished",
            c.id AS "catId", c.name AS "catName", c.slug AS "catSlug"
          FROM "GalleryItem" i
          LEFT JOIN "GalleryCategory" c ON c.id = i."categoryId"
          ORDER BY i."sortOrder" ASC, i."createdAt" DESC
        `
      ),
      withPrismaRetry(() =>
        prisma.$queryRaw<AdminGalleryCategory[]>`
          SELECT id, name, slug, "sortOrder" FROM "GalleryCategory" ORDER BY "sortOrder" ASC
        `
      ),
    ]);
    return { items: itemRows.map(mapRow), categories: categoryRows };
  } catch {
    return { items: [], categories: [] };
  }
}

export async function getAdminGalleryOptions() {
  try {
    return await withPrismaRetry(() =>
      prisma.$queryRaw<Array<{ id: string; title: string | null; type: "IMAGE" | "VIDEO" }>>`
        SELECT id, title, type FROM "GalleryItem" WHERE "isPublished" = TRUE ORDER BY "sortOrder" ASC
      `
    );
  } catch {
    return [];
  }
}

export async function maxGallerySortOrder() {
  const rows = await prisma.$queryRaw<Array<{ max: number | null }>>`
    SELECT MAX("sortOrder")::int AS max FROM "GalleryItem"
  `;
  return rows[0]?.max ?? -1;
}

export async function insertGalleryItem(data: {
  type: "IMAGE" | "VIDEO";
  title: string | null;
  description: string | null;
  categoryId: string | null;
  mediaUrl: string;
  publicId: string | null;
  thumbnailUrl: string | null;
  posterPublicId: string | null;
  altText: string | null;
  isPublished: boolean;
  sortOrder: number;
}) {
  const id = newId();
  await prisma.$executeRaw`
    INSERT INTO "GalleryItem" (
      "id", "type", "title", "description", "categoryId", "mediaUrl", "publicId",
      "thumbnailUrl", "posterPublicId", "altText", "sortOrder", "isPublished", "createdAt", "updatedAt"
    )
    VALUES (
      ${id},
      CAST(${data.type} AS "GalleryItemType"),
      ${data.title},
      ${data.description},
      ${data.categoryId},
      ${data.mediaUrl},
      ${data.publicId},
      ${data.thumbnailUrl},
      ${data.posterPublicId},
      ${data.altText},
      ${data.sortOrder},
      CAST(${data.isPublished} AS BOOLEAN),
      NOW(),
      NOW()
    )
  `;
  return id;
}

export async function updateGalleryItemRow(
  id: string,
  data: {
    type: "IMAGE" | "VIDEO";
    title: string | null;
    description: string | null;
    categoryId: string | null;
    mediaUrl: string;
    publicId: string | null;
    thumbnailUrl: string | null;
    posterPublicId: string | null;
    altText: string | null;
    isPublished: boolean;
  }
) {
  await prisma.$executeRaw`
    UPDATE "GalleryItem"
    SET
      "type" = CAST(${data.type} AS "GalleryItemType"),
      "title" = ${data.title},
      "description" = ${data.description},
      "categoryId" = ${data.categoryId},
      "mediaUrl" = ${data.mediaUrl},
      "publicId" = ${data.publicId},
      "thumbnailUrl" = ${data.thumbnailUrl},
      "posterPublicId" = ${data.posterPublicId},
      "altText" = ${data.altText},
      "isPublished" = CAST(${data.isPublished} AS BOOLEAN),
      "updatedAt" = NOW()
    WHERE "id" = ${id}
  `;
}

export async function setGalleryPublished(id: string, isPublished: boolean) {
  await prisma.$executeRaw`
    UPDATE "GalleryItem"
    SET "isPublished" = CAST(${isPublished} AS BOOLEAN), "updatedAt" = NOW()
    WHERE "id" = ${id}
  `;
}

export async function setGallerySortOrder(id: string, sortOrder: number) {
  await prisma.$executeRaw`
    UPDATE "GalleryItem" SET "sortOrder" = ${sortOrder}, "updatedAt" = NOW() WHERE "id" = ${id}
  `;
}

export async function findGalleryItem(id: string) {
  const rows = await prisma.$queryRaw<GalleryRow[]>`
    SELECT
      i.id, i.type, i.title, i.description, i."altText", i."mediaUrl", i."publicId",
      i."thumbnailUrl", i."posterPublicId", i."categoryId", i."sortOrder", i."isPublished",
      c.id AS "catId", c.name AS "catName", c.slug AS "catSlug"
    FROM "GalleryItem" i
    LEFT JOIN "GalleryCategory" c ON c.id = i."categoryId"
    WHERE i.id = ${id}
    LIMIT 1
  `;
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function deleteGalleryItemRow(id: string) {
  await prisma.$executeRaw`DELETE FROM "GalleryItem" WHERE "id" = ${id}`;
}

export async function countGalleryPublicId(publicId: string) {
  const rows = await prisma.$queryRaw<Array<{ count: number | bigint }>>`
    SELECT COUNT(*)::int AS count FROM "GalleryItem" WHERE "publicId" = ${publicId}
  `;
  return Number(rows[0]?.count ?? 0);
}

export async function countGalleryPoster(posterPublicId: string) {
  const rows = await prisma.$queryRaw<Array<{ count: number | bigint }>>`
    SELECT COUNT(*)::int AS count FROM "GalleryItem" WHERE "posterPublicId" = ${posterPublicId}
  `;
  return Number(rows[0]?.count ?? 0);
}

export async function galleryCategorySlugExists(slug: string) {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM "GalleryCategory" WHERE slug = ${slug} LIMIT 1
  `;
  return Boolean(rows[0]);
}

export async function maxCategorySortOrder() {
  const rows = await prisma.$queryRaw<Array<{ max: number | null }>>`
    SELECT MAX("sortOrder")::int AS max FROM "GalleryCategory"
  `;
  return rows[0]?.max ?? -1;
}

export async function insertGalleryCategory(name: string, slug: string, sortOrder: number) {
  const id = newId();
  await prisma.$executeRaw`
    INSERT INTO "GalleryCategory" ("id", "name", "slug", "sortOrder", "createdAt", "updatedAt")
    VALUES (${id}, ${name}, ${slug}, ${sortOrder}, NOW(), NOW())
  `;
  return id;
}
