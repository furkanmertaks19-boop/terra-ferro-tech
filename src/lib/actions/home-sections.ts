"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireContentAccess } from "@/lib/authz";
import { isHomeSectionType, parseHomeConfig, type HomeSectionType } from "@/lib/home-section-types";
import { defaultSectionValues } from "@/lib/home-sections";

async function requireAdmin() {
  await requireContentAccess();
}

function revalidateHome() {
  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidatePath("/admin/homepage");
}

const saveSchema = z.object({
  id: z.string(),
  type: z.string(),
  variant: z.string(),
  title: z.string(),
  eyebrow: z.string(),
  body: z.string(),
  image: z.string().nullable(),
  mobileImage: z.string().nullable().optional(),
  ctaLabel: z.string(),
  ctaHref: z.string(),
  config: z.any().optional(),
  isVisible: z.boolean().optional(),
});

export type HomeSectionSaveInput = z.infer<typeof saveSchema>;
export type HomeSectionSaveResult = { ok: true } | { ok: false; error: string };

export async function saveHomeSection(input: HomeSectionSaveInput): Promise<HomeSectionSaveResult> {
  await requireAdmin();
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  if (!isHomeSectionType(parsed.data.type)) return { ok: false, error: "Geçersiz bölüm tipi" };

  const data = parsed.data;
  await prisma.homeSection.update({
    where: { id: data.id },
    data: {
      variant: data.variant,
      title: data.title,
      eyebrow: data.eyebrow,
      body: data.body,
      image: data.image,
      mobileImage: data.mobileImage ?? null,
      ctaLabel: data.ctaLabel,
      ctaHref: data.ctaHref,
      config: parseHomeConfig(data.config) as Prisma.InputJsonValue,
      isVisible: data.isVisible ?? undefined,
    },
  });
  revalidateHome();
  return { ok: true };
}

export async function addHomeSection(type: HomeSectionType, variant = "default") {
  await requireAdmin();
  if (!isHomeSectionType(type)) throw new Error("Geçersiz bölüm");
  const last = await prisma.homeSection.aggregate({ _max: { sortOrder: true } });
  const defaults = defaultSectionValues(type, variant);
  const row = await prisma.homeSection.create({
    data: {
      type,
      variant,
      title: defaults.title,
      eyebrow: defaults.eyebrow,
      body: defaults.body,
      image: defaults.image,
      mobileImage: defaults.mobileImage,
      ctaLabel: defaults.ctaLabel,
      ctaHref: defaults.ctaHref,
      config: defaults.config as Prisma.InputJsonValue,
      sortOrder: (last._max.sortOrder ?? -1) + 1,
      isVisible: true,
    },
  });
  revalidateHome();
  return row.id;
}

export async function deleteHomeSection(id: string) {
  await requireAdmin();
  await prisma.homeSection.delete({ where: { id } });
  revalidateHome();
}

export async function toggleHomeSection(id: string, isVisible: boolean) {
  await requireAdmin();
  await prisma.homeSection.update({ where: { id }, data: { isVisible } });
  revalidateHome();
}

export async function reorderHomeSections(ids: string[]) {
  await requireAdmin();
  await prisma.$transaction(ids.map((id, sortOrder) => prisma.homeSection.update({ where: { id }, data: { sortOrder } })));
  revalidateHome();
}

export async function publishHomePage() {
  await requireAdmin();
  revalidateHome();
}
