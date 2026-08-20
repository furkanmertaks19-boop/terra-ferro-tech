import { prisma, withPrismaRetry } from "./prisma";
import { isSlidePosition, type PublicHeroSlide } from "./slide-types";
import type { HomeSlide } from "@prisma/client";
import type { AdminSlide } from "./slide-types";
import { getRequestLocale } from "@/lib/i18n/request";
import { parseI18nBag } from "@/lib/i18n/config";
import { str } from "@/lib/i18n/content";
import { localizeHref } from "@/lib/i18n/routing";
import { localizeKnownUi } from "@/lib/i18n/phrases";

export type { AdminSlide } from "./slide-types";

export function toAdminSlide(slide: HomeSlide): AdminSlide {
  return {
    id: slide.id,
    eyebrow: slide.eyebrow,
    title: slide.title,
    subtitle: slide.subtitle,
    desktopImage: slide.desktopImage,
    mobileImage: slide.mobileImage,
    primaryButtonText: slide.primaryButtonText,
    primaryButtonUrl: slide.primaryButtonUrl,
    secondaryButtonText: slide.secondaryButtonText,
    secondaryButtonUrl: slide.secondaryButtonUrl,
    contentPosition: slide.contentPosition,
    overlayOpacity: slide.overlayOpacity,
    isActive: slide.isActive,
    sortOrder: slide.sortOrder,
    autoplayDuration: slide.autoplayDuration,
    createdAt: slide.createdAt.toISOString(),
    updatedAt: slide.updatedAt.toISOString(),
    startsAt: slide.startsAt?.toISOString() ?? null,
    endsAt: slide.endsAt?.toISOString() ?? null,
    i18n: "i18n" in slide ? slide.i18n : {},
  };
}

export async function getActiveHomeSlides(): Promise<PublicHeroSlide[]> {
  const now = new Date();
  let rows: HomeSlide[] = [];
  try {
    rows = await withPrismaRetry(() =>
      prisma.homeSlide.findMany({
        where: {
          isActive: true,
          AND: [
            { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
            { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
          ],
        },
        orderBy: { sortOrder: "asc" },
      }),
    );
  } catch {
    return [];
  }

  const locale = await getRequestLocale();
  return rows
    .filter((row) => row.desktopImage)
    .map((row) => {
      const copy = locale === "sq" ? {} : parseI18nBag(row.i18n)[locale] ?? {};
      const primaryUrl = str(copy.primaryButtonUrl, row.primaryButtonUrl);
      const secondaryUrl = str(copy.secondaryButtonUrl, row.secondaryButtonUrl);
      return {
        id: row.id,
        eyebrow: localizeKnownUi(str(copy.eyebrow, row.eyebrow), locale),
        title: localizeKnownUi(str(copy.title, row.title), locale),
        subtitle: localizeKnownUi(str(copy.subtitle, row.subtitle), locale),
        desktopImage: row.desktopImage,
        mobileImage: row.mobileImage,
        primaryButtonText: localizeKnownUi(str(copy.primaryButtonText, row.primaryButtonText), locale),
        primaryButtonUrl: !primaryUrl || primaryUrl.startsWith("#") ? primaryUrl : localizeHref(primaryUrl, locale),
        secondaryButtonText: localizeKnownUi(str(copy.secondaryButtonText, row.secondaryButtonText), locale),
        secondaryButtonUrl: !secondaryUrl || secondaryUrl.startsWith("#") ? secondaryUrl : localizeHref(secondaryUrl, locale),
        contentPosition: isSlidePosition(row.contentPosition) ? row.contentPosition : "left-center",
        overlayOpacity: Math.min(85, Math.max(0, row.overlayOpacity)),
        autoplayDuration: Math.min(20000, Math.max(3000, row.autoplayDuration || 7000)),
      };
    });
}
