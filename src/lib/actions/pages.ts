"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Category, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireContentAccess } from "@/lib/authz";
import { canPublish } from "@/lib/roles";
import {
  defaultRevision,
  isHeroHeight,
  isHeroType,
  isPageKey,
  isTextPosition,
  parseRevision,
  publicPathFor,
  type PageKey,
  type PageRevision,
} from "@/lib/page-cms";
import { ensurePageContents } from "@/lib/pages";

const schema = z.object({
  pageKey: z.string(),
  revision: z.any(),
});

export type PageSaveResult = { ok: true } | { ok: false; error: string };

function revalidatePage(key: PageKey) {
  const path = publicPathFor(key);
  revalidatePath("/", "layout");
  revalidatePath(path);
  revalidatePath(path, "page");
  revalidatePath(path, "layout");
  revalidatePath("/admin/pages");
  revalidatePath(`/admin/pages/${key}`);
  revalidatePath(`/admin/preview/page/${key}`);
  if (key === "tractors" || key === "equipment") {
    revalidatePath("/admin/category-pages");
  }
}

function asRevision(key: PageKey, value: unknown): PageRevision | null {
  if (!value || typeof value !== "object") return null;
  return parseRevision(key, value);
}

async function syncCategoryPage(key: PageKey, revision: PageRevision) {
  if (key !== "tractors" && key !== "equipment") return;
  const category = key === "tractors" ? Category.TRACTOR : Category.EQUIPMENT;
  await prisma.categoryPage.upsert({
    where: { category },
    create: {
      category,
      eyebrow: revision.eyebrow,
      title: revision.title,
      subtitle: revision.description,
      desktopImage: revision.heroImage || "/images/home/category-tractors.jpg",
      mobileImage: revision.mobileImage,
      overlayOpacity: revision.overlayOpacity,
      textPosition: revision.textPosition === "center" ? "center" : "left",
    },
    update: {
      eyebrow: revision.eyebrow,
      title: revision.title,
      subtitle: revision.description,
      desktopImage: revision.heroImage,
      mobileImage: revision.mobileImage,
      overlayOpacity: revision.overlayOpacity,
      textPosition: revision.textPosition === "center" ? "center" : "left",
    },
  });
}

export async function savePage(input: { pageKey: string; revision: unknown }): Promise<PageSaveResult> {
  await requireContentAccess();
  const parsed = schema.safeParse(input);
  if (!parsed.success || !isPageKey(parsed.data.pageKey)) return { ok: false, error: "Geçersiz sayfa" };
  const key = parsed.data.pageKey;
  const revision = asRevision(key, parsed.data.revision);
  if (!revision) return { ok: false, error: "Geçersiz içerik" };
  if (!isHeroType(revision.heroType) || !isTextPosition(revision.textPosition) || !isHeroHeight(revision.heroHeight)) {
    return { ok: false, error: "Geçersiz hero ayarı" };
  }

  await ensurePageContents().catch(() => undefined);
  await prisma.pageContent.upsert({
    where: { pageKey: key },
    create: {
      pageKey: key,
      ...liveFields(defaultRevision(key)),
      draftRevision: revision as Prisma.InputJsonValue,
      hasUnpublishedChanges: true,
      status: "PUBLISHED",
    },
    update: {
      draftRevision: revision as Prisma.InputJsonValue,
      hasUnpublishedChanges: true,
    },
  });
  revalidatePath("/admin/pages");
  revalidatePath(`/admin/pages/${key}`);
  revalidatePath(`/admin/preview/page/${key}`);
  return { ok: true };
}

export async function publishPage(input: { pageKey: string; revision: unknown }): Promise<PageSaveResult> {
  const user = await requireContentAccess();
  if (!canPublish(user.role)) return { ok: false, error: "Yayınlamak için yetkiniz yok." };
  const parsed = schema.safeParse(input);
  if (!parsed.success || !isPageKey(parsed.data.pageKey)) return { ok: false, error: "Geçersiz sayfa" };
  const key = parsed.data.pageKey;
  const revision = asRevision(key, parsed.data.revision);
  if (!revision) return { ok: false, error: "Geçersiz içerik" };

  await ensurePageContents().catch(() => undefined);
  await prisma.pageContent.upsert({
    where: { pageKey: key },
    create: {
      pageKey: key,
      ...liveFields(revision),
      draftRevision: revision as Prisma.InputJsonValue,
      hasUnpublishedChanges: false,
      status: "PUBLISHED",
    },
    update: {
      ...liveFields(revision),
      draftRevision: revision as Prisma.InputJsonValue,
      hasUnpublishedChanges: false,
      status: "PUBLISHED",
    },
  });
  await syncCategoryPage(key, revision).catch(() => undefined);
  revalidatePage(key);
  return { ok: true };
}

function liveFields(revision: PageRevision) {
  return {
    eyebrow: revision.eyebrow.trim(),
    title: revision.title.trim(),
    description: revision.description.trim(),
    heroType: revision.heroType,
    heroImage: revision.heroImage.trim(),
    mobileImage: revision.mobileImage,
    overlayOpacity: revision.overlayOpacity,
    textPosition: revision.textPosition,
    heroHeight: revision.heroHeight,
    slides: revision.slides as Prisma.InputJsonValue,
    config: revision.config as Prisma.InputJsonValue,
    i18n: (revision.i18n ?? {}) as Prisma.InputJsonValue,
  };
}
