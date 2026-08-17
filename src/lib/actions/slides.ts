"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireContentAccess } from "@/lib/authz";
import { isSlidePosition } from "@/lib/slide-types";

const slideSchema = z.object({
  id: z.string().nullable().optional(),
  eyebrow: z.string(),
  title: z.string().min(1, "Başlık gerekli"),
  subtitle: z.string(),
  desktopImage: z.string().min(1, "Desktop görsel gerekli"),
  mobileImage: z.string().nullable().optional(),
  primaryButtonText: z.string(),
  primaryButtonUrl: z.string(),
  secondaryButtonText: z.string(),
  secondaryButtonUrl: z.string(),
  contentPosition: z.string(),
  overlayOpacity: z.number().min(0).max(85),
  isActive: z.boolean(),
  autoplayDuration: z.number().min(3000).max(20000),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
});

export type SlideSaveInput = z.infer<typeof slideSchema>;
export type SlideSaveResult = { ok: true; id: string } | { ok: false; error: string };

async function requireAdmin() {
  await requireContentAccess();
}

function revalidateHome() {
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/admin/sliders");
}

function parseDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function saveSlide(input: SlideSaveInput): Promise<SlideSaveResult> {
  await requireAdmin();
  const parsed = slideSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }
  const data = parsed.data;
  if (!isSlidePosition(data.contentPosition)) {
    return { ok: false, error: "Geçersiz içerik konumu" };
  }

  const payload = {
    eyebrow: data.eyebrow.trim(),
    title: data.title.trim(),
    subtitle: data.subtitle.trim(),
    desktopImage: data.desktopImage,
    mobileImage: data.mobileImage || null,
    primaryButtonText: data.primaryButtonText.trim(),
    primaryButtonUrl: data.primaryButtonUrl.trim(),
    secondaryButtonText: data.secondaryButtonText.trim(),
    secondaryButtonUrl: data.secondaryButtonUrl.trim(),
    contentPosition: data.contentPosition,
    overlayOpacity: data.overlayOpacity,
    isActive: data.isActive,
    autoplayDuration: data.autoplayDuration,
    startsAt: parseDate(data.startsAt),
    endsAt: parseDate(data.endsAt),
  };

  if (data.id) {
    await prisma.homeSlide.update({ where: { id: data.id }, data: payload });
    revalidateHome();
    return { ok: true, id: data.id };
  }

  const last = await prisma.homeSlide.aggregate({ _max: { sortOrder: true } });
  const created = await prisma.homeSlide.create({
    data: { ...payload, sortOrder: (last._max.sortOrder ?? -1) + 1 },
  });
  revalidateHome();
  return { ok: true, id: created.id };
}

export async function deleteSlide(id: string) {
  await requireAdmin();
  await prisma.homeSlide.delete({ where: { id } });
  revalidateHome();
}

export async function toggleSlideActive(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.homeSlide.update({ where: { id }, data: { isActive } });
  revalidateHome();
}

export async function reorderSlides(ids: string[]) {
  await requireAdmin();
  await prisma.$transaction(
    ids.map((id, index) => prisma.homeSlide.update({ where: { id }, data: { sortOrder: index } }))
  );
  revalidateHome();
}
