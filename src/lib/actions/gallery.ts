"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireContentAccess, requireAdminAccess } from "@/lib/authz";
import { canPublish } from "@/lib/roles";
import { slugify } from "@/lib/format";
import { destroyCloudinaryAsset } from "@/lib/cloudinary";
import { videoPosterFromMedia } from "@/lib/cloudinary-media";
import {
  countGalleryPoster,
  countGalleryPublicId,
  deleteGalleryItemRow,
  findGalleryItem,
  galleryCategorySlugExists,
  insertGalleryCategory,
  insertGalleryItem,
  maxCategorySortOrder,
  maxGallerySortOrder,
  setGalleryPublished,
  setGallerySortOrder,
  updateGalleryItemRow,
} from "@/lib/gallery";

async function requireAdmin() {
  await requireContentAccess();
}

function revalidateGallery() {
  revalidatePath("/galeri");
  revalidatePath("/");
  revalidatePath("/admin/gallery");
}

const itemSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["IMAGE", "VIDEO"]),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  mediaUrl: z.string().min(1),
  publicId: z.string().nullable().optional(),
  thumbnailUrl: z.string().nullable().optional(),
  posterPublicId: z.string().nullable().optional(),
  altText: z.string().nullable().optional(),
  isPublished: z.boolean().optional(),
});

export type GalleryItemInput = z.infer<typeof itemSchema>;
export type GallerySaveResult = { ok: true; id: string; ids: string[] } | { ok: false; error: string };

export async function createGalleryItems(
  items: Array<{
    type: "IMAGE" | "VIDEO";
    mediaUrl: string;
    publicId?: string | null;
    thumbnailUrl?: string | null;
    posterPublicId?: string | null;
    title?: string | null;
    description?: string | null;
    altText?: string | null;
    categoryId?: string | null;
  }>
): Promise<GallerySaveResult> {
  await requireAdmin();
  if (!items.length) return { ok: false, error: "Medya gerekli." };
  let order = await maxGallerySortOrder();
  const ids: string[] = [];
  for (const item of items) {
    order += 1;
    const type = item.type === "VIDEO" ? "VIDEO" : "IMAGE";
    const thumbnailUrl =
      item.thumbnailUrl || (type === "VIDEO" ? videoPosterFromMedia(item.mediaUrl) : item.mediaUrl);
    const id = await insertGalleryItem({
      type,
      mediaUrl: item.mediaUrl,
      publicId: item.publicId ?? null,
      thumbnailUrl,
      posterPublicId: item.posterPublicId ?? null,
      title: item.title?.trim() || null,
      description: item.description?.trim() || null,
      altText: item.altText?.trim() || null,
      categoryId: item.categoryId || null,
      isPublished: false,
      sortOrder: order,
    });
    ids.push(id);
  }
  revalidateGallery();
  return { ok: true, id: ids[0], ids };
}

export async function saveGalleryItem(input: GalleryItemInput): Promise<GallerySaveResult> {
  const user = await requireContentAccess();
  const parsed = itemSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  const data = parsed.data;
  const type: "IMAGE" | "VIDEO" = data.type === "VIDEO" ? "VIDEO" : "IMAGE";
  const thumbnailUrl =
    data.thumbnailUrl || (type === "VIDEO" ? videoPosterFromMedia(data.mediaUrl) : data.mediaUrl);
  const payload = {
    type,
    title: data.title?.trim() || null,
    description: data.description?.trim() || null,
    categoryId: data.categoryId || null,
    mediaUrl: data.mediaUrl,
    publicId: data.publicId ?? null,
    thumbnailUrl,
    posterPublicId: data.posterPublicId ?? null,
    altText: data.altText?.trim() || null,
    isPublished: canPublish(user.role) ? (data.isPublished ?? false) : false,
  };
  if (data.id) {
    const existing = await findGalleryItem(data.id);
    const isPublished = canPublish(user.role) ? (data.isPublished ?? existing?.isPublished ?? false) : existing?.isPublished ?? false;
    await updateGalleryItemRow(data.id, { ...payload, isPublished });
    revalidateGallery();
    return { ok: true, id: data.id, ids: [data.id] };
  }
  const id = await insertGalleryItem({
    ...payload,
    sortOrder: (await maxGallerySortOrder()) + 1,
  });
  revalidateGallery();
  return { ok: true, id, ids: [id] };
}

export async function toggleGalleryItem(id: string, isPublished: boolean) {
  await requireAdminAccess();
  await setGalleryPublished(id, isPublished);
  revalidateGallery();
}

export async function reorderGalleryItems(ids: string[]) {
  await requireAdmin();
  await Promise.all(ids.map((id, index) => setGallerySortOrder(id, index)));
  revalidateGallery();
}

export async function deleteGalleryItem(id: string) {
  await requireAdminAccess();
  const item = await findGalleryItem(id);
  if (!item) return;
  await deleteGalleryItemRow(id);
  if (item.publicId) {
    const stillUsed = await countGalleryPublicId(item.publicId);
    if (stillUsed === 0) {
      await destroyCloudinaryAsset(item.publicId, item.type === "VIDEO" ? "video" : "image");
    }
  }
  if (item.posterPublicId && item.posterPublicId !== item.publicId) {
    const posterUsed = await countGalleryPoster(item.posterPublicId);
    if (posterUsed === 0) await destroyCloudinaryAsset(item.posterPublicId, "image");
  }
  revalidateGallery();
}

export async function createGalleryCategory(name: string): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await requireAdmin();
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Kategori adı gerekli." };
  const base = slugify(trimmed) || "kategori";
  let slug = base;
  let n = 2;
  while (await galleryCategorySlugExists(slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  const id = await insertGalleryCategory(trimmed, slug, (await maxCategorySortOrder()) + 1);
  revalidateGallery();
  return { ok: true, id };
}
