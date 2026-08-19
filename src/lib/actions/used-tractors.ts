"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { UsedTractorDrive, UsedTractorStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess, requireContentAccess } from "@/lib/authz";
import { slugify } from "@/lib/format";
import { destroyCloudinaryAsset } from "@/lib/cloudinary";
import { usedTractorHref, usedTractorLabel } from "@/lib/used-tractors";

const statusSchema = z.enum(UsedTractorStatus);
const driveSchema = z.enum(UsedTractorDrive).nullable().optional();

const payloadSchema = z.object({
  brand: z.string().min(1).max(80),
  model: z.string().min(1).max(80),
  slug: z.string().min(2).max(120),
  year: z.number().int().min(1950).max(2100).nullable().optional(),
  hours: z.number().int().min(0).max(200000).nullable().optional(),
  horsePower: z.number().min(0).max(1000).nullable().optional(),
  fuelType: z.string().max(40).nullable().optional(),
  hasCabin: z.boolean(),
  transmission: z.string().max(80).nullable().optional(),
  drive: driveSchema,
  location: z.string().max(120).nullable().optional(),
  shortDescription: z.string().max(400).nullable().optional(),
  description: z.string().max(12000).nullable().optional(),
  specs: z.record(z.string(), z.string()).optional(),
  coverImage: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
  imageAlts: z.record(z.string(), z.string()).optional(),
  technicalPdfUrl: z.string().nullable().optional(),
  technicalPdfPublicId: z.string().nullable().optional(),
  technicalPdfName: z.string().nullable().optional(),
  technicalPdfSize: z.number().int().nonnegative().nullable().optional(),
  price: z.number().min(0).nullable().optional(),
  status: statusSchema,
  seoTitle: z.string().max(120).nullable().optional(),
  seoDescription: z.string().max(300).nullable().optional(),
  i18n: z.any().optional(),
});

export type UsedTractorPayload = z.infer<typeof payloadSchema>;

function emptyToNull(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

function cleanSpecs(specs: Record<string, string> | undefined) {
  const next: Record<string, string> = {};
  for (const [key, value] of Object.entries(specs ?? {})) {
    const label = key.trim();
    const text = value.trim();
    if (!label || !text) continue;
    next[label] = text;
  }
  return next;
}

async function assertSlugFree(slug: string, id?: string) {
  const existing = await prisma.usedTractor.findUnique({ where: { slug }, select: { id: true } });
  if (existing && existing.id !== id) return false;
  return true;
}

async function uniqueSlug(base: string, id?: string) {
  const root = slugify(base) || "traktor-i-perdorur";
  let slug = root;
  let n = 2;
  while (!(await assertSlugFree(slug, id))) {
    slug = `${root}-${n}`;
    n += 1;
  }
  return slug;
}

function revalidateUsed(slug?: string) {
  revalidatePath("/admin/used-tractors");
  revalidatePath("/traktore-te-perdorur");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(usedTractorHref(slug));
}

async function destroyUnusedPdf(publicId: string | null | undefined) {
  if (!publicId?.trim()) return;
  const count = await prisma.usedTractor.count({ where: { technicalPdfPublicId: publicId } });
  if (count === 0) await destroyCloudinaryAsset(publicId, "raw");
}

function toData(parsed: UsedTractorPayload, slug: string) {
  const pdfUrl = emptyToNull(parsed.technicalPdfUrl);
  return {
    brand: parsed.brand.trim(),
    model: parsed.model.trim(),
    slug,
    year: parsed.year ?? null,
    hours: parsed.hours ?? null,
    horsePower: parsed.horsePower ?? null,
    fuelType: emptyToNull(parsed.fuelType),
    hasCabin: parsed.hasCabin,
    transmission: emptyToNull(parsed.transmission),
    drive: parsed.drive ?? null,
    location: emptyToNull(parsed.location),
    shortDescription: emptyToNull(parsed.shortDescription),
    description: emptyToNull(parsed.description),
    specs: cleanSpecs(parsed.specs),
    coverImage: emptyToNull(parsed.coverImage),
    images: (parsed.images ?? []).filter(Boolean),
    imageAlts: parsed.imageAlts ?? {},
    technicalPdfUrl: pdfUrl,
    technicalPdfPublicId: pdfUrl ? emptyToNull(parsed.technicalPdfPublicId) : null,
    technicalPdfName: pdfUrl ? emptyToNull(parsed.technicalPdfName) : null,
    technicalPdfSize: pdfUrl ? parsed.technicalPdfSize ?? null : null,
    price: parsed.price ?? null,
    status: parsed.status,
    seoTitle: emptyToNull(parsed.seoTitle),
    seoDescription: emptyToNull(parsed.seoDescription),
    i18n: parsed.i18n ?? {},
    publishedAt:
      parsed.status === UsedTractorStatus.DRAFT || parsed.status === UsedTractorStatus.ARCHIVED
        ? null
        : new Date(),
  };
}

export async function saveUsedTractor(input: UsedTractorPayload, id?: string) {
  await requireContentAccess();
  const parsed = payloadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }

  const slug = await uniqueSlug(parsed.data.slug || usedTractorLabel(parsed.data), id);
  const data = toData(parsed.data, slug);

  if (id) {
    const current = await prisma.usedTractor.findUnique({
      where: { id },
      select: { slug: true, technicalPdfPublicId: true, publishedAt: true, status: true },
    });
    if (!current) return { ok: false as const, error: "Traktör bulunamadı" };
    if (current.publishedAt && data.publishedAt) data.publishedAt = current.publishedAt;
    await prisma.usedTractor.update({ where: { id }, data });
    if (current.technicalPdfPublicId && current.technicalPdfPublicId !== data.technicalPdfPublicId) {
      await destroyUnusedPdf(current.technicalPdfPublicId);
    }
    revalidateUsed(current.slug);
    revalidateUsed(slug);
    return { ok: true as const, id, slug };
  }

  const last = await prisma.usedTractor.aggregate({ _max: { sortOrder: true } });
  const created = await prisma.usedTractor.create({
    data: { ...data, sortOrder: (last._max.sortOrder ?? -1) + 1 },
  });
  revalidateUsed(created.slug);
  return { ok: true as const, id: created.id, slug: created.slug };
}

export async function updateUsedTractorStatus(id: string, status: UsedTractorStatus) {
  await requireContentAccess();
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) return;
  const current = await prisma.usedTractor.findUnique({ where: { id }, select: { slug: true, publishedAt: true } });
  if (!current) return;
  const live = status !== UsedTractorStatus.DRAFT && status !== UsedTractorStatus.ARCHIVED;
  await prisma.usedTractor.update({
    where: { id },
    data: {
      status,
      publishedAt: live ? current.publishedAt ?? new Date() : null,
    },
  });
  revalidateUsed(current.slug);
}

export async function deleteUsedTractor(id: string) {
  await requireAdminAccess();
  const current = await prisma.usedTractor.findUnique({
    where: { id },
    select: { slug: true, technicalPdfPublicId: true },
  });
  if (!current) return;
  await prisma.usedTractor.delete({ where: { id } });
  await destroyUnusedPdf(current.technicalPdfPublicId);
  revalidateUsed(current.slug);
}
