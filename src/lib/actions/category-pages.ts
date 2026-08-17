"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Category } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireContentAccess } from "@/lib/authz";
import { isTextPosition } from "@/lib/category-page-types";

const schema = z.object({
  category: z.enum(Category),
  eyebrow: z.string(),
  title: z.string().min(1, "Başlık gerekli"),
  subtitle: z.string(),
  desktopImage: z.string().min(1, "Header görseli gerekli"),
  mobileImage: z.string().nullable().optional(),
  overlayOpacity: z.number().min(0).max(80),
  textPosition: z.string(),
});

export type CategoryPageSaveInput = z.infer<typeof schema>;
export type CategoryPageSaveResult = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  await requireContentAccess();
}

function revalidateCatalog(category: Category) {
  revalidatePath("/", "layout");
  revalidatePath(category === Category.TRACTOR ? "/traktoret" : "/makineri-bujqesore");
  revalidatePath("/admin/category-pages");
}

export async function saveCategoryPage(input: CategoryPageSaveInput): Promise<CategoryPageSaveResult> {
  await requireAdmin();
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }
  const data = parsed.data;
  if (!isTextPosition(data.textPosition)) {
    return { ok: false, error: "Geçersiz içerik konumu" };
  }

  try {
    await prisma.categoryPage.upsert({
      where: { category: data.category },
      create: {
        category: data.category,
        eyebrow: data.eyebrow.trim(),
        title: data.title.trim(),
        subtitle: data.subtitle.trim(),
        desktopImage: data.desktopImage,
        mobileImage: data.mobileImage || null,
        overlayOpacity: data.overlayOpacity,
        textPosition: data.textPosition,
      },
      update: {
        eyebrow: data.eyebrow.trim(),
        title: data.title.trim(),
        subtitle: data.subtitle.trim(),
        desktopImage: data.desktopImage,
        mobileImage: data.mobileImage || null,
        overlayOpacity: data.overlayOpacity,
        textPosition: data.textPosition,
      },
    });
  } catch {
    try {
      const updated = await prisma.$executeRaw`
        UPDATE "CategoryPage"
        SET
          "eyebrow" = ${data.eyebrow.trim()},
          "title" = ${data.title.trim()},
          "subtitle" = ${data.subtitle.trim()},
          "desktopImage" = ${data.desktopImage},
          "mobileImage" = ${data.mobileImage || null},
          "overlayOpacity" = ${data.overlayOpacity},
          "textPosition" = ${data.textPosition},
          "updatedAt" = CURRENT_TIMESTAMP
        WHERE "category"::text = ${data.category}
      `;
      if (updated === 0) {
        return { ok: false, error: "Kategori sayfası bulunamadı" };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Kategori sayfası kaydedilemedi";
      return { ok: false, error: message };
    }
  }

  revalidateCatalog(data.category);
  return { ok: true };
}
